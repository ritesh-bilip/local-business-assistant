# apps/rag/views.py

import time
import json
import logging

from django.conf import settings
from django.http import StreamingHttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import UserRateThrottle

from .retriever import retrieve
from .prompt_builder import build_prompt
from .llm import generate, generate_stream
from .models import QueryLog, PromptTemplate, Proposal
from .serializers import (
    AskSerializer, ProposalSerializer,
    SavedProposalSerializer, ProposalCreateSerializer, ProposalStatusSerializer,
)

logger = logging.getLogger(__name__)


# ============================================================
# Helpers
# ============================================================

MIN_RELEVANCE = 0.35
SNIPPET_CHARS = 200
PROMPT_PREVIEW_CHARS = 500


def _source_public(chunk):
    text = chunk.get("text", "") or ""
    snippet = text[:SNIPPET_CHARS] + ("…" if len(text) > SNIPPET_CHARS else "")
    payload = {
        "chunk_id": chunk["chunk_id"],
        "document_id": chunk["document_id"],
        "filename": chunk["filename"],
        "page": chunk.get("page"),
        "snippet": snippet,
    }
    if settings.DEBUG and "score" in chunk:
        payload["score"] = round(float(chunk["score"]), 4)
    return payload


def _model_name():
    return settings.LLM_MODEL_PATH.replace("\\", "/").split("/")[-1]


def _confidence_from_chunks(chunks):
    if not chunks:
        return 0.0
    return max(0.0, min(1.0, float(chunks[0]["score"])))


def _sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data, default=str)}\n\n"


# ============================================================
# Throttles
# ============================================================

class RagAskThrottle(UserRateThrottle):
    scope = "rag_ask"


class ProposalThrottle(UserRateThrottle):
    scope = "rag_proposal"


# ============================================================
# Non-streaming views
# ============================================================

class RAGAskView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [RagAskThrottle]

    def post(self, request):
        ser = AskSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        question = ser.validated_data["question"].strip()
        top_k = min(ser.validated_data.get("top_k") or settings.TOP_K_DEFAULT, 20)
        template_id = ser.validated_data.get("template_id")

        business = getattr(request.user, "business", None)

        template_text = None
        if template_id and business:
            tpl = PromptTemplate.objects.filter(id=template_id, business=business).first()
            if tpl:
                template_text = tpl.template_text

        t0 = time.time()
        chunks = retrieve(
            question, top_k=top_k,
            business_id=business.id if business else None,
        )

        top_score = float(chunks[0]["score"]) if chunks else 0.0
        no_answer = (not chunks) or (top_score < MIN_RELEVANCE)

        if no_answer:
            answer = "I don't have enough relevant information to answer that."
            confidence = 0.0
            prompt = ""
        else:
            prompt = build_prompt(question, chunks, template_text)
            answer = generate(prompt)
            confidence = _confidence_from_chunks(chunks)

        latency_ms = int((time.time() - t0) * 1000)

        QueryLog.objects.create(
            user=request.user, business=business,
            question=question,
            retrieved_chunks=[c["chunk_id"] for c in chunks],
            response_text=answer, prompt_used=prompt,
            model=_model_name(),
            confidence=confidence, latency_ms=latency_ms,
        )

        payload = {
            "answer": answer,
            "sources": [_source_public(c) for c in chunks],
            "confidence": round(confidence, 2),
            "latency_ms": latency_ms,
        }

        if settings.DEBUG:
            payload["debug"] = {
                "prompt_used": prompt[:PROMPT_PREVIEW_CHARS] + (
                    "…" if len(prompt) > PROMPT_PREVIEW_CHARS else ""
                ),
                "prompt_length": len(prompt),
                "raw_scores": [round(float(c["score"]), 4) for c in chunks],
                "top_k": top_k,
                "min_relevance": MIN_RELEVANCE,
                "gated": no_answer,
            }

        return Response(payload)


class SearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        q = request.query_params.get("q", "").strip()
        if not q:
            return Response({"detail": "q is required."}, status=400)

        try:
            top_k = int(request.query_params.get("top_k", settings.TOP_K_DEFAULT))
        except (TypeError, ValueError):
            return Response({"detail": "top_k must be an integer."}, status=400)
        top_k = max(1, min(top_k, 20))

        business = getattr(request.user, "business", None)
        chunks = retrieve(
            q, top_k=top_k,
            business_id=business.id if business else None,
        )

        return Response({
            "query": q,
            "results": [_source_public(c) for c in chunks],
        })


class GenerateProposalView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [ProposalThrottle]

    def post(self, request):
        ser = ProposalSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        client_info = ser.validated_data["client_info"]
        template_id = ser.validated_data.get("template_id")

        business = getattr(request.user, "business", None)

        template_text = None
        if template_id and business:
            tpl = PromptTemplate.objects.filter(id=template_id, business=business).first()
            if tpl:
                template_text = tpl.template_text

        query = " ".join(str(v) for v in client_info.values())
        chunks = retrieve(
            query, top_k=settings.TOP_K_DEFAULT,
            business_id=business.id if business else None,
        )

        base_prompt = template_text or (
            "You are a proposal writer. Draft a concise, professional proposal using the "
            "sources below. Include a summary, scope, timeline, and pricing estimate if available."
        )
        prompt = build_prompt(
            f"Client info:\n{client_info}\n\nWrite the proposal.",
            chunks, base_prompt,
        )
        draft = generate(prompt, max_tokens=1024)

        QueryLog.objects.create(
            user=request.user, business=business,
            question=f"[PROPOSAL] {client_info}",
            retrieved_chunks=[c["chunk_id"] for c in chunks],
            response_text=draft, prompt_used=prompt,
            model=_model_name(),
        )

        payload = {
            "draft": draft,
            "sources": [_source_public(c) for c in chunks],
        }

        if settings.DEBUG:
            payload["debug"] = {
                "prompt_used": prompt[:PROMPT_PREVIEW_CHARS] + (
                    "…" if len(prompt) > PROMPT_PREVIEW_CHARS else ""
                ),
                "prompt_length": len(prompt),
            }

        return Response(payload)


class HistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        business = getattr(request.user, "business", None)
        if business is None:
            return Response([], status=200)

        qs = QueryLog.objects.filter(business=business).order_by("-created_at")[:100]

        data = [{
            "id": q.id,
            "question": q.question[:300] + ("…" if len(q.question) > 300 else ""),
            "response_preview": (
                q.response_text[:300] + ("…" if len(q.response_text) > 300 else "")
            ),
            "model": q.model,
            "confidence": round(q.confidence, 2) if q.confidence is not None else None,
            "latency_ms": q.latency_ms,
            "created_at": q.created_at.isoformat(),
            "retrieved_chunks": q.retrieved_chunks,
        } for q in qs]

        return Response(data)


# ============================================================
# Streaming views
# ============================================================

class RAGAskStreamView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [RagAskThrottle]

    def post(self, request):
        ser = AskSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        question = ser.validated_data["question"].strip()
        top_k = min(ser.validated_data.get("top_k") or settings.TOP_K_DEFAULT, 20)
        template_id = ser.validated_data.get("template_id")

        user = request.user
        business = getattr(user, "business", None)
        business_id = business.id if business else None

        template_text = None
        if template_id and business:
            tpl = PromptTemplate.objects.filter(id=template_id, business=business).first()
            if tpl:
                template_text = tpl.template_text

        chunks = retrieve(question, top_k=top_k, business_id=business_id)

        top_score = float(chunks[0]["score"]) if chunks else 0.0
        gated = (not chunks) or (top_score < MIN_RELEVANCE)

        if gated:
            prompt = ""
            canned = "I don't have enough relevant information to answer that."
        else:
            prompt = build_prompt(question, chunks, template_text)
            canned = None

        sources_payload = [_source_public(c) for c in chunks]
        model_name = _model_name()

        def event_stream():
            t0 = time.time()
            parts = []

            try:
                yield _sse("sources", {"sources": sources_payload, "gated": gated})

                if gated:
                    for word in canned.split(" "):
                        delta = word + " "
                        parts.append(delta)
                        yield _sse("token", {"text": delta})
                else:
                    for delta in generate_stream(prompt):
                        if not delta:
                            continue
                        parts.append(delta)
                        yield _sse("token", {"text": delta})

                answer = "".join(parts).strip()
                latency_ms = int((time.time() - t0) * 1000)
                confidence = 0.0 if gated else _confidence_from_chunks(chunks)

                log = QueryLog.objects.create(
                    user=user, business=business,
                    question=question,
                    retrieved_chunks=[c["chunk_id"] for c in chunks],
                    response_text=answer, prompt_used=prompt,
                    model=model_name,
                    confidence=confidence, latency_ms=latency_ms,
                )

                payload = {
                    "answer": answer,
                    "confidence": round(confidence, 2),
                    "latency_ms": latency_ms,
                    "query_log_id": log.id,
                }
                if settings.DEBUG:
                    payload["debug"] = {
                        "raw_scores": [round(float(c["score"]), 4) for c in chunks],
                        "min_relevance": MIN_RELEVANCE,
                        "gated": gated,
                    }
                yield _sse("done", payload)

            except GeneratorExit:
                logger.info("Client disconnected mid-stream for question: %s", question[:80])
                try:
                    QueryLog.objects.create(
                        user=user, business=business,
                        question=question,
                        retrieved_chunks=[c["chunk_id"] for c in chunks],
                        response_text="".join(parts).strip() + " [partial]",
                        prompt_used=prompt, model=model_name,
                        confidence=None,
                        latency_ms=int((time.time() - t0) * 1000),
                    )
                except Exception:
                    pass
                raise

            except Exception as exc:
                logger.exception("Streaming error")
                yield _sse("error", {"detail": str(exc)})

        response = StreamingHttpResponse(
            event_stream(),
            content_type="text/event-stream",
        )
        response["Cache-Control"] = "no-cache, no-store"
        response["X-Accel-Buffering"] = "no"
        return response


class GenerateProposalStreamView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [ProposalThrottle]

    def post(self, request):
        ser = ProposalSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        client_info = ser.validated_data["client_info"]
        template_id = ser.validated_data.get("template_id")

        user = request.user
        business = getattr(user, "business", None)
        business_id = business.id if business else None

        template_text = None
        if template_id and business:
            tpl = PromptTemplate.objects.filter(id=template_id, business=business).first()
            if tpl:
                template_text = tpl.template_text

        query = " ".join(str(v) for v in client_info.values())
        chunks = retrieve(
            query, top_k=settings.TOP_K_DEFAULT,
            business_id=business_id,
        )

        base_prompt = template_text or (
            "You are a proposal writer. Draft a concise, professional proposal using the "
            "sources below. Include a summary, scope, timeline, and pricing estimate if "
            "available. Cite sources as [Source N] where you rely on them."
        )
        prompt = build_prompt(
            f"Client info:\n{client_info}\n\nWrite the proposal.",
            chunks, base_prompt,
        )

        sources_payload = [_source_public(c) for c in chunks]
        model_name = _model_name()

        def event_stream():
            t0 = time.time()
            parts = []

            try:
                yield _sse("sources", {
                    "sources": sources_payload,
                    "count": len(sources_payload),
                })

                for delta in generate_stream(prompt, max_tokens=1024):
                    if not delta:
                        continue
                    parts.append(delta)
                    yield _sse("token", {"text": delta})

                draft = "".join(parts).strip()
                latency_ms = int((time.time() - t0) * 1000)

                log = QueryLog.objects.create(
                    user=user, business=business,
                    question=f"[PROPOSAL-STREAM] {client_info}",
                    retrieved_chunks=[c["chunk_id"] for c in chunks],
                    response_text=draft, prompt_used=prompt,
                    model=model_name, latency_ms=latency_ms,
                )

                payload = {
                    "draft": draft,
                    "latency_ms": latency_ms,
                    "query_log_id": log.id,
                    "sources": sources_payload,
                }
                yield _sse("done", payload)

            except GeneratorExit:
                logger.info("Client disconnected mid-proposal stream")
                try:
                    QueryLog.objects.create(
                        user=user, business=business,
                        question=f"[PROPOSAL-STREAM-PARTIAL] {client_info}",
                        retrieved_chunks=[c["chunk_id"] for c in chunks],
                        response_text="".join(parts).strip() + " [partial]",
                        prompt_used=prompt, model=model_name,
                        latency_ms=int((time.time() - t0) * 1000),
                    )
                except Exception:
                    pass
                raise

            except Exception as exc:
                logger.exception("Proposal streaming error")
                yield _sse("error", {"detail": str(exc)})

        response = StreamingHttpResponse(
            event_stream(),
            content_type="text/event-stream",
        )
        response["Cache-Control"] = "no-cache, no-store"
        response["X-Accel-Buffering"] = "no"
        return response


# ============================================================
# Saved Proposals CRUD
# ============================================================

class ProposalListCreateView(APIView):
    """GET /api/rag/proposals/  — list. POST — create."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        business = getattr(request.user, "business", None)
        if business is None:
            return Response([])

        qs = Proposal.objects.filter(business=business)

        status_filter = request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)

        q = request.query_params.get("q", "").strip()
        if q:
            qs = qs.filter(client_name__icontains=q)

        qs = qs[:200]
        return Response(SavedProposalSerializer(qs, many=True).data)

    def post(self, request):
        business = getattr(request.user, "business", None)
        if business is None:
            return Response(
                {"detail": "User has no business."},
                status=status.HTTP_403_FORBIDDEN,
            )

        ser = ProposalCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        proposal = Proposal.objects.create(
            business=business,
            created_by=request.user,
            client_name=data["client_name"],
            client_info=data["client_info"],
            draft_text=data["draft_text"],
            sources=data["sources"],
            notes=data.get("notes", ""),
            status="draft",
        )
        return Response(
            SavedProposalSerializer(proposal).data,
            status=status.HTTP_201_CREATED,
        )


class ProposalDetailView(APIView):
    """GET / PATCH / DELETE /api/rag/proposals/{id}/"""
    permission_classes = [IsAuthenticated]

    def _get(self, request, pk):
        business = getattr(request.user, "business", None)
        if business is None:
            return None
        return Proposal.objects.filter(pk=pk, business=business).first()

    def get(self, request, pk):
        obj = self._get(request, pk)
        if not obj:
            return Response({"detail": "Not found."}, status=404)
        return Response(SavedProposalSerializer(obj).data)

    def patch(self, request, pk):
        obj = self._get(request, pk)
        if not obj:
            return Response({"detail": "Not found."}, status=404)
        ser = SavedProposalSerializer(obj, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)

    def delete(self, request, pk):
        obj = self._get(request, pk)
        if not obj:
            return Response({"detail": "Not found."}, status=404)
        obj.delete()
        return Response(status=204)


class ProposalStatusView(APIView):
    """POST /api/rag/proposals/{id}/status/"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        business = getattr(request.user, "business", None)
        obj = Proposal.objects.filter(pk=pk, business=business).first()
        if not obj:
            return Response({"detail": "Not found."}, status=404)

        ser = ProposalStatusSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        obj.status = ser.validated_data["status"]
        obj.save(update_fields=["status", "updated_at"])
        return Response(SavedProposalSerializer(obj).data)