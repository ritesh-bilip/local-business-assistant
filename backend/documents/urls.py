from django.urls import path
from .views import (
    DocumentListCreateView, DocumentDetailView,
    DocumentProcessView, JobStatusView,
)

urlpatterns = [
    path("", DocumentListCreateView.as_view()),
    path("<int:pk>/", DocumentDetailView.as_view()),
    path("<int:pk>/process/", DocumentProcessView.as_view()),
    path("jobs/", JobStatusView.as_view()),
]