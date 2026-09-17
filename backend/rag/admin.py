from django.contrib import admin
from .models import PromptTemplate, QueryLog

@admin.register(PromptTemplate)
class PromptTemplateAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "business", "created_at")
    list_filter = ("business",)

@admin.register(QueryLog)
class QueryLogAdmin(admin.ModelAdmin):
    list_display = ("id", "business", "user", "short_q", "confidence", "latency_ms", "created_at")
    list_filter = ("business", "model")
    search_fields = ("question", "response_text")
    readonly_fields = ("prompt_used", "retrieved_chunks")

    def short_q(self, obj):
        return obj.question[:60]
    short_q.short_description = "Question"