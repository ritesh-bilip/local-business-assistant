import { useCallback, useRef, useState } from "react";
import { proposalStream } from "../api/rag";
import type { Source } from "../api/rag";

type ProposalState = {
  draft: string;
  sources: Source[];
  isStreaming: boolean;
  finished: boolean;
  error: string | null;
  latencyMs: number | null;
  queryLogId: number | null;
};

const INITIAL: ProposalState = {
  draft: "",
  sources: [],
  isStreaming: false,
  finished: false,
  error: null,
  latencyMs: null,
  queryLogId: null,
};

export function useProposalStream() {
  const [state, setState] = useState<ProposalState>(INITIAL);
  const controllerRef = useRef<AbortController | null>(null);

  const generate = useCallback(
    async (client_info: Record<string, string>, template_id?: number) => {
      controllerRef.current?.abort();
      controllerRef.current = new AbortController();

      setState({ ...INITIAL, isStreaming: true });

      try {
        await proposalStream(
          client_info,
          {
            signal: controllerRef.current.signal,
            onSources: (sources) => setState((s) => ({ ...s, sources })),
            onToken: (text) =>
              setState((s) => ({ ...s, draft: s.draft + text })),
            onDone: (meta) =>
              setState((s) => ({
                ...s,
                isStreaming: false,
                finished: true,
                latencyMs: meta.latency_ms,
                queryLogId: meta.query_log_id,
                sources: meta.sources ?? s.sources,
                draft: meta.draft ?? s.draft,
              })),
            onError: (detail) =>
              setState((s) => ({ ...s, isStreaming: false, error: detail })),
          },
          template_id
        );
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setState((s) => ({ ...s, isStreaming: false, error: String(err) }));
        }
      }
    },
    []
  );

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    setState((s) => ({ ...s, isStreaming: false }));
  }, []);

  const setDraft = useCallback((draft: string) => {
    setState((s) => ({ ...s, draft }));
  }, []);

  const reset = useCallback(() => setState(INITIAL), []);

  return { ...state, generate, cancel, reset, setDraft };
}