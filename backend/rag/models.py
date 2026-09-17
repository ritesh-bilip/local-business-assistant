from django.db import models
from users.models import Business, User


class PromptTemplate(models.Model):
    business = models.ForeignKey(
        Business, on_delete=models.CASCADE, related_name="prompt_templates"
    )
    name = models.CharField(max_length=100)
    template_text = models.TextField()
    defaults = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("business", "name")
        ordering = ["name"]

    def __str__(self):
        return f"{self.business.name} / {self.name}"


class QueryLog(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="query_logs"
    )
    business = models.ForeignKey(
        Business, on_delete=models.CASCADE, related_name="query_logs"
    )
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
        indexes = [
            models.Index(fields=["business", "-created_at"]),
        ]

    def __str__(self):
        return f"[{self.created_at:%Y-%m-%d %H:%M}] {self.question[:60]}"


class Proposal(models.Model):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("sent", "Sent"),
        ("won", "Won"),
        ("lost", "Lost"),
        ("archived", "Archived"),
    ]

    business = models.ForeignKey(
        Business, on_delete=models.CASCADE, related_name="proposals"
    )
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="proposals"
    )
    client_name = models.CharField(max_length=255)
    client_info = models.JSONField(default=dict)
    draft_text = models.TextField()
    sources = models.JSONField(default=list)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="draft"
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["business", "-created_at"]),
            models.Index(fields=["business", "status"]),
        ]

    def __str__(self):
        return f"{self.client_name} — {self.status}"