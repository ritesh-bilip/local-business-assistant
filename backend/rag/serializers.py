from rest_framework import serializers
from .models import Proposal


class AskSerializer(serializers.Serializer):
    question = serializers.CharField()
    top_k = serializers.IntegerField(required=False, min_value=1, max_value=20)
    template_id = serializers.IntegerField(required=False, allow_null=True)


class ProposalSerializer(serializers.Serializer):
    client_info = serializers.DictField()
    template_id = serializers.IntegerField(required=False, allow_null=True)


class SavedProposalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proposal
        fields = [
            "id", "client_name", "client_info", "draft_text",
            "sources", "status", "notes",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "sources"]


class ProposalCreateSerializer(serializers.Serializer):
    client_name = serializers.CharField(max_length=255)
    client_info = serializers.DictField(default=dict)
    draft_text = serializers.CharField()
    sources = serializers.ListField(default=list)
    notes = serializers.CharField(required=False, allow_blank=True, default="")


class ProposalStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=["draft", "sent", "won", "lost", "archived"]
    )