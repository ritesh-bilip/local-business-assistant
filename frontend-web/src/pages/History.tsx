import { useEffect, useState } from "react";
import { ragApi } from "../api/rag";
import type { HistoryEntry } from "../api/rag";
import Spinner from "../components/Spinner";

export default function History() {
  const [items, setItems] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ragApi
      .history()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-[26px] border border-white/10 bg-slate-900/45 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.32)] backdrop-blur-xl">
        <h1 className="text-3xl font-black tracking-tight text-white">Query history</h1>
        <p className="mt-2 text-slate-300">Every question, answer, and source you've retrieved.</p>
      </div>

      {loading ? (
        <div className="py-12 text-center"><Spinner /></div>
      ) : items.length === 0 ? (
        <div className="rounded-[26px] border border-white/10 bg-slate-900/45 p-10 text-center text-slate-300 shadow-[0_18px_50px_rgba(15,23,42,0.32)] backdrop-blur-xl">No queries yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map((h) => (
            <div
              key={h.id}
              className="rounded-[24px] border border-white/10 bg-slate-900/45 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.32)] backdrop-blur-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 font-medium text-slate-100">{h.question}</div>
                  <div className="line-clamp-3 whitespace-pre-wrap text-sm text-slate-300">
                    {h.response_preview}
                  </div>
                </div>
                <div className="shrink-0 text-right text-xs text-slate-400">
                  <div>{new Date(h.created_at).toLocaleString()}</div>
                  {h.confidence != null && (
                    <div>Confidence: {(h.confidence * 100).toFixed(0)}%</div>
                  )}
                  {h.latency_ms != null && <div>{h.latency_ms}ms</div>}
                  <div className="mt-1 text-slate-500">
                    {h.retrieved_chunks.length} source
                    {h.retrieved_chunks.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}