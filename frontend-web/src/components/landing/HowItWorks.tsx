import { IconUpload, IconCpu, IconMessageCircle, IconCheck } from "./Icons";

const steps = [
  {
    n: "01",
    icon: IconUpload,
    title: "Upload your documents",
    body: "Drop in PDFs, manuals, invoices, policies. Files are stored in MinIO or Supabase and queued for processing.",
    detail: "PDF · DOCX · TXT · MD · HTML",
  },
  {
    n: "02",
    icon: IconCpu,
    title: "Automatic ingestion",
    body: "Celery workers extract text, split into overlapping chunks, embed with MiniLM, and index into FAISS.",
    detail: "Chunked · Embedded · Indexed",
  },
  {
    n: "03",
    icon: IconMessageCircle,
    title: "Ask anything",
    body: "Your query is embedded, the top-K chunks retrieved, and a grounded prompt sent to a local LLM.",
    detail: "Streams tokens with citations",
  },
  {
    n: "04",
    icon: IconCheck,
    title: "Verify and ship",
    body: "Every response links back to source passages. Audit logs let you reproduce any answer months later.",
    detail: "Full prompt + chunk trail",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-indigo-300">
            How it works
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            From document to answer in four steps
          </h2>
          <p className="mt-4 text-lg text-slate-300">
            The full RAG pipeline, automated. No prompt engineering required.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div
            className="absolute left-[12.5%] right-[12.5%] top-16 hidden h-px bg-gradient-to-r from-transparent via-indigo-400/70 to-transparent lg:block"
            aria-hidden
          />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="relative z-10 mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-400/40 bg-slate-900/80 shadow-[0_18px_50px_rgba(99,102,241,0.28)]">
                    <s.icon className="h-6 w-6 text-indigo-300" />
                  </div>
                  <div className="mb-2 font-mono text-[11px] font-semibold tracking-widest text-cyan-300">
                    {s.n}
                  </div>
                  <h3 className="mb-2 font-semibold text-white">{s.title}</h3>
                  <p className="mb-3 text-sm leading-relaxed text-slate-300">{s.body}</p>
                  <span className="rounded-full border border-white/10 bg-slate-900/60 px-2.5 py-1 text-[11px] font-medium text-slate-300">
                    {s.detail}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}