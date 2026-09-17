# apps/rag/llm.py

import atexit
import logging
import os
import threading
import time

from django.conf import settings

log = logging.getLogger(__name__)


# ============================================================
# Singleton lifecycle
# ============================================================

_llm_instance = None
_llm_loaded = False
_llm_lock = threading.Lock()


def _silence_llama_destructor():
    """
    Monkey-patch llama_cpp.Llama.__del__ so it swallows the
    AttributeError that fires during interpreter shutdown on
    Python 3.13 + llama-cpp-python 0.2.x. Cosmetic only.
    """
    try:
        from llama_cpp import Llama
    except Exception:
        return

    original = Llama.__del__
    if getattr(original, "_patched", False):
        return

    def _safe_del(self):
        try:
            original(self)
        except Exception:
            pass

    _safe_del._patched = True
    Llama.__del__ = _safe_del


def get_llm():
    """
    Lazily load the llama.cpp model. Thread-safe. Returns None if
    the .gguf file is missing so callers can fall back to stubs.
    """
    global _llm_instance, _llm_loaded

    if _llm_loaded:
        return _llm_instance

    with _llm_lock:
        if _llm_loaded:
            return _llm_instance

        if not os.path.exists(settings.LLM_MODEL_PATH):
            log.warning(
                "LLM model not found at %s — using stub responses.",
                settings.LLM_MODEL_PATH,
            )
            _llm_instance = None
            _llm_loaded = True
            return None

        from llama_cpp import Llama
        _silence_llama_destructor()

        log.info("Loading LLM from %s …", settings.LLM_MODEL_PATH)
        _llm_instance = Llama(
            model_path=settings.LLM_MODEL_PATH,
            n_ctx=4096,
            n_threads=4,
            temperature=0.1,
            top_p=0.9,
            verbose=False,        # silence the giant metadata dump
        )
        _llm_loaded = True
        return _llm_instance


def shutdown_llm():
    """Release the model cleanly at process exit."""
    global _llm_instance, _llm_loaded
    with _llm_lock:
        if _llm_instance is not None:
            try:
                _llm_instance.close()
            except Exception:
                pass
            _llm_instance = None
        _llm_loaded = False


atexit.register(shutdown_llm)


# ============================================================
# Text extraction helper
# ============================================================

def _extract_text_from_chunk(chunk) -> str:
    """Pull text from a llama.cpp chunk, defending against None values."""
    choices = (chunk or {}).get("choices") or []
    if not choices:
        return ""
    return choices[0].get("text") or ""


# ============================================================
# Public API
# ============================================================

def generate(prompt: str, max_tokens: int = 512) -> str:
    llm = get_llm()
    if llm is None:
        return "[stub] LLM model not configured. Set LLM_MODEL_PATH to a .gguf file."
    out = llm(prompt, max_tokens=max_tokens, stop=["=== QUESTION ===", "</s>"])
    return _extract_text_from_chunk(out).strip()


def generate_stream(prompt: str, max_tokens: int = 512):
    """Generator that yields non-empty text deltas from the LLM."""
    llm = get_llm()

    if llm is None:
        stub = "[stub] LLM model not configured. Set LLM_MODEL_PATH to a .gguf file."
        for word in stub.split(" "):
            yield word + " "
            time.sleep(0.03)
        return

    stream = llm(
        prompt,
        max_tokens=max_tokens,
        stop=["=== QUESTION ===", "</s>"],
        stream=True,
    )

    for chunk in stream:
        delta = _extract_text_from_chunk(chunk)
        if delta:
            yield delta