from rest_framework import serializers
from .models import Document, Chunk

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ["id", "filename", "content_type", "status", "error",
                  "uploaded_at", "processed_at"]
        read_only_fields = fields

class ChunkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chunk
        fields = ["id", "text", "chunk_index", "page", "tokens", "metadata"]