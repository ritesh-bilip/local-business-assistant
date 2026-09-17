import logging
from celery import shared_task
from django.utils import timezone
from django.db import transaction

from .models import Document, Chunk, VectorRef
from .storage import download_file
from .utils import extract_text, chunk_text
from embeddings.encoder import embed_texts
from vectorstore import faiss_client

log = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def process_document(self, document_id: int):
    try:
        doc = Document.objects.get(id=document_id)
    except Document.DoesNotExist:
        log.warning("Document %s not found", document_id)
        return

    doc.status = "processing"
    doc.error = ""
    doc.save(update_fields=["status", "error"])

    try:
        data = download_file(doc.s3_key)
        text = extract_text(doc.filename, doc.content_type, data)
        chunks = chunk_text(text)
        if not chunks:
            raise ValueError("No text extracted from document.")

        # Clear previous chunks on reprocess
        doc.chunks.all().delete()

        texts = [c for c, _ in chunks]
        vectors = embed_texts(texts)

        with transaction.atomic():
            chunk_objs = []
            for i, (ctext, tokens) in enumerate(chunks):
                chunk_objs.append(Chunk(
                    document=doc, text=ctext, chunk_index=i, tokens=tokens,
                ))
            Chunk.objects.bulk_create(chunk_objs)

        ids = list(Chunk.objects.filter(document=doc).order_by("chunk_index").values_list("id", flat=True))
        row_ids = faiss_client.add_vectors(vectors, ids)

        with transaction.atomic():
            VectorRef.objects.bulk_create([
                VectorRef(chunk_id=cid, vector_index=rid)
                for cid, rid in zip(ids, row_ids)
            ])

        doc.status = "completed"
        doc.processed_at = timezone.now()
        doc.save(update_fields=["status", "processed_at"])
        log.info("Processed document %s with %d chunks", doc.id, len(chunks))

    except Exception as exc:
        log.exception("Document %s failed", document_id)
        doc.status = "failed"
        doc.error = str(exc)[:2000]
        doc.save(update_fields=["status", "error"])
        raise self.retry(exc=exc, countdown=10)