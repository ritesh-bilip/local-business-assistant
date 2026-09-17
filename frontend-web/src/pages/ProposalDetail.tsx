import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { proposalsApi } from "../api/proposals";
import type { SavedProposal } from "../api/proposals";
import { exportProposalPdf } from "../utils/exportPdf";
import { useAuth } from "../hooks/useAuth";
import Spinner from "../components/Spinner";

export default function ProposalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [proposal, setProposal] = useState<SavedProposal | null>(null);
  const [draftText, setDraftText] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (!id) return;
    proposalsApi.get(Number(id)).then((p) => {
      setProposal(p);
      setDraftText(p.draft_text);
      setNotes(p.notes);
    });
  }, [id]);

  const handleSave = async () => {
    if (!proposal) return;
    setSaving(true);
    try {
      const updated = await proposalsApi.update(proposal.id, {
        draft_text: draftText,
        notes,
      });
      setProposal(updated);
      setSavedAt(new Date());
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    if (!proposal) return;
    exportProposalPdf({
      title: `Proposal for ${proposal.client_name}`,
      subtitle: `Saved ${new Date(proposal.created_at).toLocaleDateString()}`,
      body: draftText,
      businessName: user?.business_name,
    });
  };

  if (!proposal) {
    return (
      <div className="py-16 text-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button
            onClick={() => navigate("/proposals")}
            className="text-sm text-slate-500 hover:text-slate-900"
          >
            ← Back to proposals
          </button>
          <h1 className="mt-1 text-2xl font-bold">{proposal.client_name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Download PDF
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      {savedAt && (
        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          ✓ Saved at {savedAt.toLocaleTimeString()}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Proposal text
            </label>
            <textarea
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              rows={20}
              className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 p-3 font-sans text-sm leading-relaxed outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Internal notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Follow-up reminders, call notes, etc."
              className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">
              Client info
            </h3>
            <dl className="space-y-1.5 text-sm">
              {Object.entries(proposal.client_info).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2">
                  <dt className="capitalize text-slate-500">{k}</dt>
                  <dd className="text-right text-slate-900">{String(v)}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">
              Sources ({proposal.sources.length})
            </h3>
            <ul className="space-y-2">
              {proposal.sources.map((s: any, i: number) => (
                <li key={i} className="text-xs text-slate-600">
                  <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] font-semibold text-blue-700">
                    {i + 1}
                  </span>
                  {s.filename}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}