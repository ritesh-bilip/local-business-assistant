import io
import re
from pypdf import PdfReader
from docx import Document as DocxDocument
from bs4 import BeautifulSoup
from django.conf import settings


def extract_text(filename: str, content_type: str, data: bytes) -> str:
    name = filename.lower()
    if name.endswith(".pdf") or content_type == "application/pdf":
        return _extract_pdf(data)
    if name.endswith(".docx"):
        return _extract_docx(data)
    if name.endswith(".txt") or name.endswith(".md"):
        return data.decode("utf-8", errors="ignore")
    if name.endswith(".html") or name.endswith(".htm"):
        return BeautifulSoup(data, "html.parser").get_text("\n")
    # Fallback: try utf-8 decode
    return data.decode("utf-8", errors="ignore")


def _extract_pdf(data: bytes) -> str:
    reader = PdfReader(io.BytesIO(data))
    return "\n".join((page.extract_text() or "") for page in reader.pages)


def _extract_docx(data: bytes) -> str:
    doc = DocxDocument(io.BytesIO(data))
    return "\n".join(p.text for p in doc.paragraphs)


def chunk_text(text: str, chunk_size: int | None = None, overlap: int | None = None):
    """Word-based sliding-window chunker. Returns list of (chunk_text, tokens)."""
    chunk_size = chunk_size or settings.CHUNK_SIZE
    overlap = overlap or settings.CHUNK_OVERLAP
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return []
    words = text.split(" ")
    chunks = []
    step = max(1, chunk_size - overlap)
    for start in range(0, len(words), step):
        window = words[start:start + chunk_size]
        if not window:
            break
        chunk = " ".join(window)
        chunks.append((chunk, len(window)))
        if start + chunk_size >= len(words):
            break
    return chunks