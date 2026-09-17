import {
  IconBolt,
  IconShield,
  IconSearch,
  IconDocument,
  IconClock,
  IconCpu,
} from "./Icons";

const features = [
  {
    icon: IconSearch,
    title: "Semantic search that understands",
    body: "Every answer cites the exact passage it came from. Click a source to jump to the chunk that grounded it.",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: IconBolt,
    title: "Streaming answers",
    body: "Tokens appear as they're generated — just like ChatGPT. No more staring at a spinner.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: IconDocument,
    title: "Ingests everything",
    body: "PDF, DOCX, TXT, Markdown, HTML. Auto-chunked, embedded, and indexed into a vector store.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: IconCpu,
    title: "Runs on your hardware",
    body: "Local Llama.cpp inference and MiniLM embeddings. No API keys, no per-token billing, no data leaks.",
    color: "from-purple-500 to-indigo-500",
  },
  {
    icon: IconShield,
    title: "Multi-tenant by design",
    body: "Per-business isolation on every query. Beta Clinic can never see Acme Plumbing's documents.",
    color: "from-rose-500 to-pink-500",
  },
  {
    icon: IconClock,
    title: "Full audit trail",
    body: "Every question, prompt, retrieved chunk, and answer is logged. Reproduce any decision months later.",
    color: "from-cyan-500 to-blue-500",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-indigo-300">
            Features
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything you need to ground your team
          </h2>
          <p className="mt-4 text-lg text-slate-300">
            A complete RAG stack — ingestion, embeddings, retrieval, and generation — in one deployable package.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative rounded-[26px] border border-white/10 bg-slate-900/45 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.32)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-400/40 hover:bg-slate-900/65"
            >
              <div
                className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} text-white shadow-lg shadow-indigo-500/20`}
              >
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="mb-2 font-semibold text-white">{f.title}</h3>
              <p className="text-[15px] leading-relaxed text-slate-300">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}