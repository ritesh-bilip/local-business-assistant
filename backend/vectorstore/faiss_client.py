import json
import os
import threading
import numpy as np
import faiss
from django.conf import settings
from embeddings.encoder import embedding_dim

_lock = threading.Lock()
_index = None
_id_map: list[int] = []  # position = faiss row id


def _ensure_paths():
    os.makedirs(os.path.dirname(settings.FAISS_INDEX_PATH), exist_ok=True)


def load_index():
    global _index, _id_map
    with _lock:
        if _index is not None:
            return _index
        _ensure_paths()
        dim = embedding_dim()
        if os.path.exists(settings.FAISS_INDEX_PATH):
            _index = faiss.read_index(settings.FAISS_INDEX_PATH)
        else:
            # Inner-product on normalized vectors == cosine similarity
            _index = faiss.IndexFlatIP(dim)
        if os.path.exists(settings.FAISS_IDMAP_PATH):
            with open(settings.FAISS_IDMAP_PATH) as f:
                _id_map = json.load(f)
        return _index


def persist():
    with _lock:
        _ensure_paths()
        faiss.write_index(_index, settings.FAISS_INDEX_PATH)
        with open(settings.FAISS_IDMAP_PATH, "w") as f:
            json.dump(_id_map, f)


def add_vectors(vectors: list[list[float]], chunk_ids: list[int]):
    """Add vectors and return their FAISS row ids."""
    assert len(vectors) == len(chunk_ids)
    idx = load_index()
    with _lock:
        arr = np.asarray(vectors, dtype="float32")
        start = idx.ntotal
        idx.add(arr)
        _id_map.extend(chunk_ids)
    persist()
    return list(range(start, start + len(vectors)))


def search(vector: list[float], top_k: int = 5):
    """Return list of (chunk_id, score)."""
    idx = load_index()
    if idx.ntotal == 0:
        return []
    q = np.asarray([vector], dtype="float32")
    with _lock:
        distances, indices = idx.search(q, min(top_k, idx.ntotal))
    results = []
    for dist, row in zip(distances[0], indices[0]):
        if row < 0 or row >= len(_id_map):
            continue
        results.append((_id_map[row], float(dist)))
    return results


def total_vectors() -> int:
    return load_index().ntotal