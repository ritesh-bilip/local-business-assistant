from django.urls import path
from .views import (
    RAGAskView,
    RAGAskStreamView,
    SearchView,
    GenerateProposalView,
    GenerateProposalStreamView,   # ← new
    HistoryView,
)

urlpatterns = [
    path("ask/", RAGAskView.as_view()),
    path("ask/stream/", RAGAskStreamView.as_view()),
    path("search/", SearchView.as_view()),
    path("generate-proposal/", GenerateProposalView.as_view()),
    path("generate-proposal/stream/", GenerateProposalStreamView.as_view()),   # ← new
    path("history/", HistoryView.as_view()),
]