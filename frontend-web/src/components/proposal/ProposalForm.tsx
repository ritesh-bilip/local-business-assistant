import { useState } from "react";
import type { FormEvent } from "react";

export type ClientInfo = {
  name: string;
  issue: string;
  urgency: "low" | "medium" | "high" | "emergency";
  budget?: string;
  address?: string;
  preferred_date?: string;
  notes?: string;
};

type Props = {
  onSubmit: (info: Record<string, string>) => void;
  onCancel?: () => void;
  disabled?: boolean;
  hasDraft: boolean;
};

const EMPTY: ClientInfo = {
  name: "",
  issue: "",
  urgency: "medium",
};

export default function ProposalForm({
  onSubmit,
  onCancel,
  disabled,
  hasDraft,
}: Props) {
  const [info, setInfo] = useState<ClientInfo>(EMPTY);

  const update = <K extends keyof ClientInfo>(k: K, v: ClientInfo[K]) =>
    setInfo((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const payload: Record<string, string> = {};
    (Object.keys(info) as (keyof ClientInfo)[]).forEach((k) => {
      const v = info[k];
      if (v && String(v).trim()) payload[k] = String(v).trim();
    });
    onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4"
    >
      <div>
        <h2 className="text-lg font-semibold">Client details</h2>
        <p className="text-sm text-gray-500">
          Fill in what you know — the AI will draft the rest.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Client name" required>
          <input
            value={info.name}
            onChange={(e) => update("name", e.target.value)}
            required
            placeholder="Bob Smith"
            className={inputCls}
          />
        </Field>

        <Field label="Urgency">
          <select
            value={info.urgency}
            onChange={(e) => update("urgency", e.target.value as any)}
            className={inputCls}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="emergency">Emergency</option>
          </select>
        </Field>

        <Field label="Issue / scope" required className="sm:col-span-2">
          <input
            value={info.issue}
            onChange={(e) => update("issue", e.target.value)}
            required
            placeholder="Burst main valve, water shut off at street"
            className={inputCls}
          />
        </Field>

        <Field label="Address">
          <input
            value={info.address ?? ""}
            onChange={(e) => update("address", e.target.value)}
            placeholder="42 Oak Street, Springfield"
            className={inputCls}
          />
        </Field>

        <Field label="Preferred date">
          <input
            type="date"
            value={info.preferred_date ?? ""}
            onChange={(e) => update("preferred_date", e.target.value)}
            className={inputCls}
          />
        </Field>

        <Field label="Budget (optional)">
          <input
            value={info.budget ?? ""}
            onChange={(e) => update("budget", e.target.value)}
            placeholder="$1,200"
            className={inputCls}
          />
        </Field>

        <Field label="Notes (optional)" className="sm:col-span-2">
          <textarea
            value={info.notes ?? ""}
            onChange={(e) => update("notes", e.target.value)}
            rows={3}
            placeholder="Repeat customer. Has a dog in the yard."
            className={inputCls}
          />
        </Field>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={disabled || !info.name.trim() || !info.issue.trim()}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium transition-colors"
        >
          {hasDraft ? "Regenerate" : "Generate proposal"}
        </button>
        {hasDraft && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium"
          >
            Start over
          </button>
        )}
      </div>
    </form>
  );
}

const inputCls =
  "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm";

function Field({
  label,
  required,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}