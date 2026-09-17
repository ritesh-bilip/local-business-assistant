from rest_framework import serializers

class AskSerializer(serializers.Serializer):
    question = serializers.CharField()
    top_k = serializers.IntegerField(required=False, min_value=1, max_value=20)
    template_id = serializers.IntegerField(required=False, allow_null=True)

class ProposalSerializer(serializers.Serializer):
    client_info = serializers.DictField()
    template_id = serializers.IntegerField(required=False, allow_null=True)