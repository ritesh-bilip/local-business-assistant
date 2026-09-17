
from django.db import models
from users.models import Business

class Document(models.Model):
    STATUS = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name="documents")
    filename = models.CharField(max_length=255)
    s3_key = models.CharField(max_length=512)  # object storage key
    content_type = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS, default="pending")
    error = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-uploaded_at"]

class Chunk(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name="chunks")
    text = models.TextField()
    chunk_index = models.IntegerField()
    tokens = models.IntegerField(default=0)
    page = models.IntegerField(null=True, blank=True)
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["document_id", "chunk_index"]

class VectorRef(models.Model):
    chunk = models.OneToOneField(Chunk, on_delete=models.CASCADE, related_name="vector_ref")
    vector_index = models.BigIntegerField(unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)