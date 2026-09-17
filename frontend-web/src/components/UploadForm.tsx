import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { documentsApi } from "../api/documents";

type Props = {
  onUploaded: () => void;
};

export default function UploadForm({ onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      await documentsApi.upload(file);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      onUploaded();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[26px] border border-white/10 bg-slate-900/45 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.32)] backdrop-blur-xl"
    >
      <h2 className="mb-1 text-lg font-semibold text-white">Upload a document</h2>
      <p className="mb-4 text-sm text-slate-300">
        PDF, DOCX, TXT, MD, or HTML. It will be chunked and indexed automatically.
      </p>

      {error && (
        <div className="mb-3 rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md,.html,.htm"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="flex-1 rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-200 file:mr-3 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-indigo-500 file:to-violet-500 file:px-4 file:py-2 file:font-medium file:text-white file:shadow-lg file:shadow-indigo-500/20 file:cursor-pointer"
        />
        <button
          type="submit"
          disabled={!file || uploading}
          className="rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 px-5 py-2.5 font-semibold text-white shadow-[0_14px_26px_rgba(99,102,241,0.45)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </div>
    </form>
  );
}