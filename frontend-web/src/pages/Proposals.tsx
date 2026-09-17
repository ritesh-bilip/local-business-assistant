import { useState } from "react";
import { useProposalStream } from "../hooks/useProposalStream";
import { useAuth } from "../hooks/useAuth";
import { proposalsApi } from "../api/proposals";
import ProposalForm from "../components/proposal/ProposalForm";
import ProposalEditor from "../components/proposal/ProposalEditor";
import ProposalActions from "../components/proposal/ProposalActions";
import SourcesPanel from "../components/SourcesPanel";
import type { Source } from "../api/rag";

export default function Proposal() {
  const { user } = useAuth();
  const [clientName, setClientName] = useState<string>("");
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<number | null>(null);

  const {
    draft,
    sources,
    isStreaming,
    finished,
    error,
    latencyMs,
    generate,
    cancel,
    reset,
    setDraft,
  } = useProposalStream();

  const handleSubmit = (info: Record<string, string>) => {
    setClientName(info.name || "Client");
    setSelectedSource(null);
    setSavedId(null);
    generate(info);
  };

  const handleReset = () => {
    reset();
    setClientName("");
    setSelectedSource(null);
    setSavedId(null);
  };

  const handleSave = async () => {
    if (!draft || !clientName) return;
    setSaving(true);
    try {
      const saved = await proposalsApi.create({
        client_name: clientName,
        client_info: { name: clientName },
        draft_text: draft,
        sources,
      });
      setSavedId(saved.id);
    } finally {
      setSaving(false);
    }
  };

  const hasDraft = draft.length > 0 || isStreaming || finished;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Generate a proposal</h1>
          <p className="text-gray-500">
            Draft a professional quote grounded in your documents.
          </p>
        </div>
        {isStreaming && (
          <button
            onClick={cancel}
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300"
          >
            Stop
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[400px_1fr]">
        <div>
          <ProposalForm
            onSubmit={handleSubmit}
            onCancel={handleReset}
            disabled={isStreaming}
            hasDraft={hasDraft}
          />
        </div>

        <div className="space-y-4">
          {hasDraft ? (
            <>
              <ProposalEditor
                value={draft}
                onChange={setDraft}
                isStreaming={isStreaming}
              />

              {!isStreaming && finished && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4">
                  <div className="text-xs text-gray-500">
                    {latencyMs != null && <>Generated in {latencyMs}ms · </>}
                    {sources.length} source{sources.length !== 1 ? "s" : ""} used
                  </div>
                  <div className="flex gap-2">
                    {savedId ? (
                      <a
                        href={`/proposals/${savedId}`}
                        className="rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
                      >
                        ✓ Saved — View
                      </a>
                    ) : (
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {saving ? "Saving…" : "Save proposal"}
                      </button>
                    )}
                    <ProposalActions
                      draft={draft}
                      sources={sources}
                      clientName={clientName}
                      businessName={user?.business_name}
                    />
                  </div>
                </div>
              )}

              {sources.length > 0 && (
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold">Sources</h3>
                  {selectedSource ? (
                    <div>
                      <button
                        onClick={() => setSelectedSource(null)}
                        className="mb-3 text-xs text-gray-500 hover:text-gray-900"
                      >
                        ← Back to list
                      </button>
                      <div className="mb-1 text-sm font-medium">
                        {selectedSource.filename}
                      </div>
                      <div className="whitespace-pre-wrap text-sm text-gray-700">
                        {selectedSource.snippet}
                      </div>
                    </div>
                  ) : (
                    <SourcesPanel
                      sources={sources}
                      onSelect={setSelectedSource}
                      selected={selectedSource}
                    />
                  )}
                </div>
              )}
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-6 py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-100 bg-brand-50">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6 text-brand-600"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
        </svg>
      </div>
      <h3 className="mb-1 font-semibold text-gray-900">
        Your draft will appear here
      </h3>
      <p className="max-w-sm text-sm text-gray-500">
        Fill in the client details on the left and click Generate. The AI will
        stream a proposal grounded in your uploaded documents.
      </p>
    </div>
  );
}