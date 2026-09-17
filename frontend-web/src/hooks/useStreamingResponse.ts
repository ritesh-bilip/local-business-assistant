import { useCallback, useRef, useState } from "react";
import { askStream } from "../api/rag";
import type { Source } from "../api/rag";

type StreamState = {
  answer: string;
  sources: Source[];
  gated: boolean;
  isStreaming: boolean;
  error: string | null;
  confidence: number | null;
  latencyMs: number | null;
  queryLogId: number | null;
};

const INITIAL: StreamState = {
  answer: "",
  sources: [],
  gated: false,
  isStreaming: false,
  error: null,
  confidence: null,
  latencyMs: null,
  queryLogId: null,
};

export function useStreamingResponse() {
  const [state, setState] = useState<StreamState>(INITIAL);
  const controllerRef = useRef<AbortController | null>(null);

  const ask = useCallback(async (question: string, top_k = 3) => {
    // Cancel any in-flight request
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();

    setState({ ...INITIAL, isStreaming: true });

    try {
      await askStream(
        question,
        {
          signal: controllerRef.current.signal,
          onSources: (sources, gated) =>
            setState((s) => ({ ...s, sources, gated })),
          onToken: (text) => setState((s) => ({ ...s, answer: s.answer + text })),
          onDone: (meta) =>
            setState((s) => ({
              ...s,
              isStreaming: false,
              confidence: meta.confidence,
              latencyMs: meta.latency_ms,
              queryLogId: meta.query_log_id,
            })),
          onError: (detail) =>
            setState((s) => ({ ...s, isStreaming: false, error: detail })),
        },
        top_k
      );
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setState((s) => ({ ...s, isStreaming: false, error: String(err) }));
      }
    }
  }, []);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    setState((s) => ({ ...s, isStreaming: false }));
  }, []);

  const reset = useCallback(() => setState(INITIAL), []);

  return { ...state, ask, cancel, reset };
}