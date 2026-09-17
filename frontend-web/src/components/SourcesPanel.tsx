import type { Source } from "../api/rag";
import { formatCitation } from "../utils/formatCitation";

type Props = {
  sources: Source[];
  onSelect?: (source: Source) => void;
  selected?: Source | null;
};

export default function SourcesPanel({ sources, onSelect, selected }: Props) {
  if (sources.length === 0) {
    return (
      <div className="text-sm italic text-slate-400">
        No sources retrieved for this query.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sources.map((s, i) => {
        const isSelected = selected?.chunk_id === s.chunk_id;
        return (
          <button
            key={s.chunk_id}
            onClick={() => onSelect?.(s)}
            className={`w-full rounded-2xl border p-3 text-left transition ${
              isSelected
                ? "border-indigo-400/60 bg-indigo-500/10"
                : "border-white/10 bg-slate-950/40 hover:border-white/20 hover:bg-slate-900/60"
            }`}
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 text-xs font-semibold text-white">
                {i + 1}
              </span>
              <span className="truncate text-sm font-medium text-slate-100">
                {formatCitation(s)}
              </span>
              {s.score !== undefined && (
                <span className="ml-auto text-xs text-slate-400">
                  {s.score.toFixed(3)}
                </span>
              )}
            </div>
            <p className="line-clamp-3 text-sm text-slate-300">{s.snippet}</p>
          </button>
        );
      })}
    </div>
  );
}