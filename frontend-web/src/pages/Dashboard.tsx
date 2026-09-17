import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { documentsApi } from "../api/documents";
import type { Document } from "../api/documents";
import { ragApi } from "../api/rag";
import type { HistoryEntry } from "../api/rag";
import { useAuth } from "../hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<Document[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    documentsApi.list().then(setDocs);
    ragApi.history().then(setHistory);
  }, []);

  const completed = docs.filter((d) => d.status === "completed").length;
  const pending = docs.filter(
    (d) => d.status !== "completed" && d.status !== "failed"
  ).length;

  return (
    <div className="space-y-6">
      <div className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Welcome back, {user?.business_name}
        </h1>
        <p className="mt-2 text-slate-500">
          Here's what's happening with your assistant.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          label="Documents"
          value={docs.length}
          hint={`${completed} ready`}
          to="/documents"
        />
        <StatCard
          label="Processing"
          value={pending}
          hint="in queue"
          to="/documents"
        />
        <StatCard
          label="Questions asked"
          value={history.length}
          hint="last 100"
          to="/history"
        />
      </div>

      <div className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent questions
          </h2>
          <Link
            to="/history"
            className="text-sm font-medium text-blue-600 transition hover:text-blue-700 hover:underline"
          >
            View all →
          </Link>
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-slate-500">
            No questions yet. Try the Ask tab.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {history.slice(0, 5).map((h) => (
              <li key={h.id} className="py-3">
                <div className="text-sm font-medium text-slate-900">
                  {h.question}
                </div>
                <div className="mt-0.5 text-xs text-slate-500">
                  {new Date(h.created_at).toLocaleString()}
                  {h.confidence != null &&
                    ` · confidence ${(h.confidence * 100).toFixed(0)}%`}
                  {h.latency_ms != null && ` · ${h.latency_ms}ms`}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  to,
}: {
  label: string;
  value: number;
  hint: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="group block rounded-[22px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_24px_60px_rgba(59,130,246,0.15)]"
    >
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-black tracking-tight text-slate-900">
        {value}
      </div>
      <div className="mt-2 text-xs text-slate-400">{hint}</div>
    </Link>
  );
}