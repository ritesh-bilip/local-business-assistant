from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("users.urls")),
    path("api/documents/", include("documents.urls")),
    path("api/rag/", include("rag.urls")),
]
from django.http import JsonResponse
from vectorstore.faiss_client import total_vectors

def health(request):
    return JsonResponse({"status": "ok", "vectors": total_vectors()})

urlpatterns += [path("health/", health)]