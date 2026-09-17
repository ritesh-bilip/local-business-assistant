import { useEffect, useState } from "react";
import { documentsApi } from "../api/documents";
import type { Document } from "../api/documents";
import UploadForm from "../components/UploadForm";
import DocumentList from "../components/DocumentList";
import Spinner from "../components/Spinner";

export default function Documents() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Document | null>(null);

  const refresh = async () => {
    try {
      const data = await documentsApi.list();
      setDocs(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // Poll every 4s while any doc is not finished
    const id = setInterval(() => {
      setDocs((current) => {
        if (current.some((d) => d.status === "pending" || d.status === "processing")) {
          refresh();
        }
        return current;
      });
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-[26px] border border-white/10 bg-slate-900/45 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.32)] backdrop-blur-xl">
        <h1 className="text-3xl font-black tracking-tight text-white">Documents</h1>
        <p className="mt-2 text-slate-300">Upload and manage the documents your assistant learns from.</p>
      </div>

      <UploadForm onUploaded={refresh} />

      {loading ? (
        <div className="py-12 text-center"><Spinner /></div>
      ) : (
        <DocumentList
          documents={docs}
          onRefresh={refresh}
          onSelect={setSelected}
        />
      )}

      {selected && <ChunksModal doc={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function ChunksModal({ doc, onClose }: { doc: Document; onClose: () => void }) {
  const [full, setFull] = useState<Document | null>(null);

  useEffect(() => {
    documentsApi.get(doc.id).then(setFull);
  }, [doc.id]);

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-20"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h2 className="font-semibold">{doc.filename}</h2>
            <p className="text-xs text-gray-500">
              {full?.chunks?.length ?? "…"} chunks
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto p-5 space-y-3">
          {!full ? (
            <div className="text-center py-6"><Spinner /></div>
          ) : (
            full.chunks?.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-lg border border-gray-200 bg-gray-50"
              >
                <div className="text-xs text-gray-500 mb-1">
                  Chunk #{c.chunk_index} · {c.tokens} tokens
                </div>
                <div className="text-sm text-gray-800 whitespace-pre-wrap">
                  {c.text}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}