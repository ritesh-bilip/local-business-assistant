import { api, tokenStore, API_BASE } from "./client";

export type Source = {
  chunk_id: number;
  document_id: number;
  filename: string;
  page: number | null;
  snippet: string;
  score?: number;
};

export type AskResponse = {
  answer: string;
  sources: Source[];
  confidence: number;
  latency_ms: number;
  debug?: {
    prompt_used: string;
    raw_scores: number[];
    top_k: number;
    min_relevance: number;
    gated: boolean;
  };
};

export type HistoryEntry = {
  id: number;
  question: string;
  response_preview: string;
  model: string;
  confidence: number | null;
  latency_ms: number | null;
  created_at: string;
  retrieved_chunks: number[];
};

export const ragApi = {
  ask: (question: string, top_k = 3) =>
    api
      .post<AskResponse>("/rag/ask/", { question, top_k })
      .then((r) => r.data),

  search: (q: string, top_k = 5) =>
    api
      .get<{ query: string; results: Source[] }>("/rag/search/", {
        params: { q, top_k },
      })
      .then((r) => r.data),

  proposal: (client_info: Record<string, string>, template_id?: number) =>
    api
      .post<{ draft: string; sources: Source[] }>("/rag/generate-proposal/", {
        client_info,
        template_id,
      })
      .then((r) => r.data),

  history: () => api.get<HistoryEntry[]>("/rag/history/").then((r) => r.data),
};

/**
 * Streams tokens from /api/rag/ask/stream/.
 * Uses fetch + ReadableStream (not EventSource) because we need POST + auth headers.
 */
export type StreamHandlers = {
  onSources?: (sources: Source[], gated: boolean) => void;
  onToken?: (text: string) => void;
  onDone?: (meta: {
    answer: string;
    confidence: number;
    latency_ms: number;
    query_log_id: number;
    debug?: any;
  }) => void;
  onError?: (detail: string) => void;
  signal?: AbortSignal;
};

export async function askStream(
  question: string,
  handlers: StreamHandlers,
  top_k = 3
): Promise<void> {
  const token = tokenStore.get();
  if (!token) {
    handlers.onError?.("Not authenticated");
    return;
  }

  const res = await fetch(`${API_BASE}/rag/ask/stream/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ question, top_k }),
    signal: handlers.signal,
  });

  if (!res.ok || !res.body) {
    handlers.onError?.(`HTTP ${res.status}`);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const messages = buffer.split("\n\n");
      buffer = messages.pop() || "";

      for (const raw of messages) {
        if (!raw.trim()) continue;

        let event = "message";
        let dataStr = "";
        for (const line of raw.split("\n")) {
          if (line.startsWith("event: ")) event = line.slice(7);
          else if (line.startsWith("data: ")) dataStr += line.slice(6);
        }

        let data: any = {};
        try {
          data = JSON.parse(dataStr);
        } catch {
          continue;
        }

        if (event === "sources") handlers.onSources?.(data.sources ?? [], !!data.gated);
        else if (event === "token") handlers.onToken?.(data.text ?? "");
        else if (event === "done") handlers.onDone?.(data);
        else if (event === "error") handlers.onError?.(data.detail ?? "Unknown error");
      }
    }
  } finally {
    reader.releaseLock();
  }
}
export type ProposalHandlers = {
  onSources?: (sources: Source[]) => void;
  onToken?: (text: string) => void;
  onDone?: (meta: {
    draft: string;
    latency_ms: number;
    query_log_id: number;
    sources: Source[];
  }) => void;
  onError?: (detail: string) => void;
  signal?: AbortSignal;
};

export async function proposalStream(
  client_info: Record<string, string>,
  handlers: ProposalHandlers,
  template_id?: number
): Promise<void> {
  const token = tokenStore.get();
  if (!token) {
    handlers.onError?.("Not authenticated");
    return;
  }

  const res = await fetch(`${API_BASE}/rag/generate-proposal/stream/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ client_info, template_id }),
    signal: handlers.signal,
  });

  if (!res.ok || !res.body) {
    handlers.onError?.(`HTTP ${res.status}`);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const messages = buffer.split("\n\n");
      buffer = messages.pop() || "";

      for (const raw of messages) {
        if (!raw.trim()) continue;

        let event = "message";
        let dataStr = "";
        for (const line of raw.split("\n")) {
          if (line.startsWith("event: ")) event = line.slice(7);
          else if (line.startsWith("data: ")) dataStr += line.slice(6);
        }

        let data: any = {};
        try {
          data = JSON.parse(dataStr);
        } catch {
          continue;
        }

        if (event === "sources") handlers.onSources?.(data.sources ?? []);
        else if (event === "token") handlers.onToken?.(data.text ?? "");
        else if (event === "done") handlers.onDone?.(data);
        else if (event === "error") handlers.onError?.(data.detail ?? "Unknown error");
      }
    }
  } finally {
    reader.releaseLock();
  }
}