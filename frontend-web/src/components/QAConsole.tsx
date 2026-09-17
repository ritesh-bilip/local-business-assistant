import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Source } from "../api/rag";
import { useStreamingResponse } from "../hooks/useStreamingResponse";
import SourcesPanel from "./SourcesPanel";

type Message =
  | { role: "user"; content: string }
  | {
      role: "assistant";
      content: string;
      sources: Source[];
      confidence: number | null;
      latencyMs: number | null;
      streaming: boolean;
      error: string | null;
    };

export default function QAConsole() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);

  const {
    answer,
    sources,
    isStreaming,
    error,
    confidence,
    latencyMs,
    ask,
    cancel,
    reset,
  } = useStreamingResponse();

  const scrollerRef = useRef<HTMLDivElement>(null);

  // When a stream finishes, commit the message to the list
  useEffect(() => {
    if (!isStreaming && answer) {
      setMessages((prev) => {
        // Replace last assistant msg if it was streaming, else append
        const last = prev[prev.length - 1];
        const finished: Message = {
          role: "assistant",
          content: answer,
          sources,
          confidence,
          latencyMs,
          streaming: false,
          error: error,
        };
        if (last?.role === "assistant" && last.streaming) {
          return [...prev.slice(0, -1), finished];
        }
        return [...prev, finished];
      });
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStreaming]);

  // Auto-scroll
  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, answer]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q || isStreaming) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    await ask(q, 3);
  };

  return (
    <div className="grid h-[calc(100vh-160px)] grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
      {/* Chat column */}
      <div className="flex flex-col overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/45 shadow-[0_18px_50px_rgba(15,23,42,0.32)] backdrop-blur-xl">
        <div ref={scrollerRef} className="flex-1 space-y-4 overflow-y-auto p-6">
          {messages.length === 0 && !isStreaming && (
            <div className="py-16 text-center">
              <h2 className="mb-2 text-2xl font-semibold text-white">Ask your business anything</h2>
              <p className="mb-6 text-slate-300">
                Grounded answers from your uploaded documents.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "What is the warranty period on main valves?",
                  "How much does an emergency call cost?",
                  "What's covered by the warranty?",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-white/10"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <MessageBubble
              key={i}
              message={m}
              onSelectSource={setSelectedSource}
            />
          ))}

          {/* Live streaming bubble */}
          {isStreaming && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 text-xs font-semibold text-white">
                AI
              </div>
              <div className="min-w-0 flex-1">
                <div className="rounded-2xl rounded-tl-sm bg-slate-800/80 px-4 py-3 text-slate-100">
                  {answer ? (
                    <span className="streaming-cursor whitespace-pre-wrap">{answer}</span>
                  ) : (
                    <span className="text-sm text-slate-400">Retrieving…</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-100">
              ⚠️ {error}
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex gap-2 border-t border-white/10 bg-slate-950/40 p-4"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your business…"
            disabled={isStreaming}
            className="flex-1 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/50 disabled:bg-slate-900/50"
          />
          {isStreaming ? (
            <button
              type="button"
              onClick={cancel}
              className="rounded-xl bg-slate-200 px-4 py-2.5 font-medium text-slate-800 transition hover:bg-slate-100"
            >
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 px-5 py-2.5 font-medium text-white shadow-[0_14px_26px_rgba(99,102,241,0.45)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Ask
            </button>
          )}
        </form>
      </div>

      {/* Sources column */}
      <div className="overflow-y-auto rounded-[28px] border border-white/10 bg-slate-900/45 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.32)] backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Sources</h3>
          {selectedSource && (
            <button
              onClick={() => setSelectedSource(null)}
              className="text-xs text-slate-300 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {selectedSource ? (
          <SelectedSourceView source={selectedSource} />
        ) : (
          <SourcesPanel
            sources={
              isStreaming
                ? sources
                : messages[messages.length - 1]?.role === "assistant"
                ? (messages[messages.length - 1] as any).sources ?? []
                : []
            }
            onSelect={setSelectedSource}
            selected={selectedSource}
          />
        )}
      </div>
    </div>
  );
}

// ----- Sub-components -----

function MessageBubble({
  message,
  onSelectSource,
}: {
  message: Message;
  onSelectSource: (s: Source) => void;
}) {
  if (message.role === "user") {
    return (
      <div className="flex gap-3 justify-end">
        <div className="bg-brand-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%]">
          {message.content}
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-xs font-semibold shrink-0">
          You
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
        AI
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-4 py-3 text-gray-900 whitespace-pre-wrap">
          {message.content}
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          {message.confidence !== null && (
            <span>Confidence: {(message.confidence * 100).toFixed(0)}%</span>
          )}
          {message.latencyMs !== null && <span>{message.latencyMs}ms</span>}
          {message.sources.length > 0 && (
            <button
              onClick={() => onSelectSource(message.sources[0])}
              className="text-brand-600 hover:underline"
            >
              {message.sources.length} source{message.sources.length > 1 ? "s" : ""}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SelectedSourceView({ source }: { source: Source }) {
  return (
    <div>
      <div className="mb-3">
        <div className="font-medium text-sm">{source.filename}</div>
        {source.page != null && (
          <div className="text-xs text-gray-500">Page {source.page}</div>
        )}
      </div>
      <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
        {source.snippet}
      </div>
      {source.score !== undefined && (
        <div className="mt-3 text-xs text-gray-400">
          Relevance score: {source.score.toFixed(4)}
        </div>
      )}
    </div>
  );
}