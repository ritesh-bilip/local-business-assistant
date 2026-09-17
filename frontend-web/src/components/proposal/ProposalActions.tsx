import { useState } from "react";
import type { Source } from "../../api/rag";
import { exportProposalPdf } from "../../utils/exportPdf";

type Props = {
  draft: string;
  sources: Source[];
  clientName?: string;
  businessName?: string;
  disabled?: boolean;
};

export default function ProposalActions({
  draft,
  clientName,
  businessName,
  disabled,
}: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownload = () => {
    exportProposalPdf({
      title: `Proposal for ${clientName || "Client"}`,
      subtitle: `Prepared ${new Date().toLocaleDateString()}`,
      body: draft,
      businessName,
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={handleCopy}
        disabled={disabled || !draft}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
      >
        {copied ? "✓ Copied" : "Copy text"}
      </button>

      <button
        onClick={handleDownload}
        disabled={disabled || !draft}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium"
      >
        Download PDF
      </button>
    </div>
  );
}