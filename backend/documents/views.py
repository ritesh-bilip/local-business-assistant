import uuid
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Document, Chunk
from .serializers import DocumentSerializer, ChunkSerializer
from .storage import upload_file
from .tasks import process_document


def _business(request):
    biz = getattr(request.user, "business", None)
    if biz is None:
        raise PermissionError("User has no business attached.")
    return biz


class DocumentListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        biz = _business(request)
        docs = Document.objects.filter(business=biz)
        return Response(DocumentSerializer(docs, many=True).data)

    def post(self, request):
        biz = _business(request)
        f = request.FILES.get("file")
        if not f:
            return Response({"detail": "file is required."}, status=400)

        key = f"business_{biz.id}/{uuid.uuid4()}_{f.name}"
        upload_file(key, f.read(), f.content_type)

        doc = Document.objects.create(
            business=biz,
            filename=f.name,
            s3_key=key,
            content_type=f.content_type or "",
            status="pending",
        )
        process_document.delay(doc.id)
        return Response(DocumentSerializer(doc).data, status=201)


class DocumentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        biz = _business(request)
        doc = get_object_or_404(Document, pk=pk, business=biz)
        data = DocumentSerializer(doc).data
        data["chunks"] = ChunkSerializer(doc.chunks.all(), many=True).data
        return Response(data)

    def delete(self, request, pk):
        biz = _business(request)
        doc = get_object_or_404(Document, pk=pk, business=biz)
        doc.delete()
        return Response(status=204)


class DocumentProcessView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        biz = _business(request)
        doc = get_object_or_404(Document, pk=pk, business=biz)
        process_document.delay(doc.id)
        return Response({"status": "queued"})


class JobStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        biz = _business(request)
        docs = Document.objects.filter(business=biz).values(
            "id", "filename", "status", "error", "uploaded_at", "processed_at"
        )
        return Response(list(docs))