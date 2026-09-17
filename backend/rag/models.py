from django.db import models
from users.models import Business, User

class PromptTemplate(models.Model):
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name="prompt_templates")
    name = models.CharField(max_length=100)
    template_text = models.TextField()
    defaults = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("business", "name")

class QueryLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    business = models.ForeignKey(Business, on_delete=models.CASCADE)
    question = models.TextField()
    retrieved_chunks = models.JSONField(default=list)
    response_text = models.TextField(blank=True)
    prompt_used = models.TextField(blank=True)
    model = models.CharField(max_length=100, blank=True)
    confidence = models.FloatField(null=True, blank=True)
    latency_ms = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]