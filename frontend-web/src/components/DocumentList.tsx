import { documentsApi } from "../api/documents";
import type { Document } from "../api/documents";

const statusStyles: Record<Document["status"], string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

type Props = {
  documents: Document[];
  onRefresh: () => void;
  onSelect: (doc: Document) => void;
};

export default function DocumentList({ documents, onRefresh, onSelect }: Props) {
  const handleReprocess = async (id: number) => {
    await documentsApi.process(id);
    onRefresh();
  };

  const handleDelete = async (id: number, filename: string) => {
    if (!confirm(`Delete "${filename}"? This cannot be undone.`)) return;
    await documentsApi.remove(id);
    onRefresh();
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No documents yet. Upload one above to get started.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[26px] border border-white/10 bg-slate-900/45 shadow-[0_18px_50px_rgba(15,23,42,0.32)] backdrop-blur-xl">
      <table className="w-full text-sm">
        <thead className="border-b border-white/10 bg-slate-900/70">
          <tr className="text-left">
            <th className="px-4 py-3 font-medium text-slate-300">Filename</th>
            <th className="px-4 py-3 font-medium text-slate-300">Status</th>
            <th className="px-4 py-3 font-medium text-slate-300">Uploaded</th>
            <th className="px-4 py-3 text-right font-medium text-slate-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((d) => (
            <tr
              key={d.id}
              className="border-b border-white/5 last:border-b-0 hover:bg-white/5"
            >
              <td className="px-4 py-3">
                <button
                  onClick={() => onSelect(d)}
                  className="text-left font-medium text-slate-100 transition hover:text-cyan-300"
                >
                  {d.filename}
                </button>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    statusStyles[d.status]
                  }`}
                >
                  {d.status}
                </span>
                {d.error && (
                  <div className="mt-1 text-xs text-rose-300">{d.error.slice(0, 80)}</div>
                )}
              </td>
              <td className="px-4 py-3 text-slate-400">
                {new Date(d.uploaded_at).toLocaleString()}
              </td>
              <td className="space-x-2 px-4 py-3 text-right">
                <button
                  onClick={() => handleReprocess(d.id)}
                  className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-200 transition hover:bg-white/10"
                >
                  Reprocess
                </button>
                <button
                  onClick={() => handleDelete(d.id, d.filename)}
                  className="rounded border border-rose-400/30 bg-rose-500/10 px-2 py-1 text-xs text-rose-200 transition hover:bg-rose-500/20"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}