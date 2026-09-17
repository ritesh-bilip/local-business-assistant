from django.urls import path
from .views import (
    RAGAskView, RAGAskStreamView,
    SearchView,
    GenerateProposalView, GenerateProposalStreamView,
    HistoryView,
    ProposalListCreateView, ProposalDetailView, ProposalStatusView,
)

urlpatterns = [
    # Q&A
    path("ask/", RAGAskView.as_view()),
    path("ask/stream/", RAGAskStreamView.as_view()),
    path("search/", SearchView.as_view()),

    # Proposal generation
    path("generate-proposal/", GenerateProposalView.as_view()),
    path("generate-proposal/stream/", GenerateProposalStreamView.as_view()),

    # History
    path("history/", HistoryView.as_view()),

    # Saved proposals
    path("proposals/", ProposalListCreateView.as_view()),
    path("proposals/<int:pk>/", ProposalDetailView.as_view()),
    path("proposals/<int:pk>/status/", ProposalStatusView.as_view()),
]