import { useState } from "react";
import { useProposalStream } from "../hooks/useProposalStream";
import { useAuth } from "../hooks/useAuth";
import ProposalForm from "../components/proposal/ProposalForm";
import ProposalEditor from "../components/proposal/ProposalEditor";
import ProposalActions from "../components/proposal/ProposalActions";
import SourcesPanel from "../components/SourcesPanel";
import type { Source } from "../api/rag";

export default function Proposal() {
  const { user } = useAuth();
  const [clientName, setClientName] = useState<string>("");
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);

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
    generate(info);
  };

  const handleReset = () => {
    reset();
    setClientName("");
    setSelectedSource(null);
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
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium"
          >
            Stop
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
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
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-gray-200">
                  <div className="text-xs text-gray-500">
                    {latencyMs != null && <>Generated in {latencyMs}ms · </>}
                    {sources.length} source{sources.length !== 1 ? "s" : ""} used
                  </div>
                  <ProposalActions
                    draft={draft}
                    sources={sources}
                    clientName={clientName}
                    businessName={user?.business_name}
                  />
                </div>
              )}

              {sources.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                  <h3 className="font-semibold mb-3 text-sm">Sources</h3>
                  {selectedSource ? (
                    <div>
                      <button
                        onClick={() => setSelectedSource(null)}
                        className="text-xs text-gray-500 hover:text-gray-900 mb-3"
                      >
                        ← Back to list
                      </button>
                      <div className="font-medium text-sm mb-1">
                        {selectedSource.filename}
                      </div>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
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
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50">
      <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mb-4">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6 text-brand-600"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
        </svg>
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">
        Your draft will appear here
      </h3>
      <p className="text-sm text-gray-500 max-w-sm">
        Fill in the client details on the left and click Generate. The AI will
        stream a proposal grounded in your uploaded documents.
      </p>
    </div>
  );
}