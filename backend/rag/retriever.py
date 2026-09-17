from embeddings.encoder import embed_query
from vectorstore import faiss_client
from documents.models import Chunk


def retrieve(query: str, top_k: int = 5, business_id: int | None = None):
    """
    Returns list of dicts:
      {chunk_id, document_id, text, score, page}
    Filtered to a business if provided.
    """
    qv = embed_query(query)
    hits = faiss_client.search(qv, top_k=top_k * 3)  # over-fetch then filter
    if not hits:
        return []

    chunk_ids = [cid for cid, _ in hits]
    score_map = {cid: score for cid, score in hits}

    qs = Chunk.objects.filter(id__in=chunk_ids).select_related("document")
    if business_id is not None:
        qs = qs.filter(document__business_id=business_id)

    # preserve score-based order
    chunks = list(qs)
    chunks.sort(key=lambda c: score_map.get(c.id, -1), reverse=True)
    chunks = chunks[:top_k]

    return [
        {
            "chunk_id": c.id,
            "document_id": c.document_id,
            "filename": c.document.filename,
            "text": c.text,
            "page": c.page,
            "score": score_map.get(c.id, 0.0),
        }
        for c in chunks
    ]