from django.contrib import admin
from .models import Document, Chunk, VectorRef
from .tasks import process_document

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("id", "filename", "business", "status", "uploaded_at", "processed_at")
    list_filter = ("status", "business")
    search_fields = ("filename",)
    actions = ["reprocess"]

    @admin.action(description="Reprocess selected documents")
    def reprocess(self, request, queryset):
        for doc in queryset:
            process_document.delay(doc.id)
        self.message_user(request, f"Queued {queryset.count()} document(s).")

admin.site.register(Chunk)
admin.site.register(VectorRef)