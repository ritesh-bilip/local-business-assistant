import { Link } from "react-router-dom";
import { IconArrowRight, IconLock, IconShield, IconCpu } from "./Icons";

export default function CTA() {
  return (
    <>
      {/* Security band */}
      <section id="security" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-indigo-300">
                Privacy & security
              </div>
              <h2 className="mb-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Your data never leaves your infrastructure
              </h2>
              <p className="mb-8 text-lg leading-relaxed text-slate-300">
                Unlike SaaS tools that ship your documents to a third party,
                Local Business Assistant runs entirely on your machines. LLM
                inference, embeddings, and vector search — all local.
              </p>

              <div className="space-y-4">
                {[
                  {
                    icon: IconLock,
                    title: "Local LLM inference",
                    body: "llama.cpp with quantized GGML weights. No OpenAI, no Anthropic, no API keys.",
                  },
                  {
                    icon: IconShield,
                    title: "Per-tenant isolation",
                    body: "Every query filters by business ID. Beta Clinic never sees Acme Plumbing's chunks.",
                  },
                  {
                    icon: IconCpu,
                    title: "Audit-ready logging",
                    body: "Prompts, retrieved chunks, model output, latency — stored and reproducible.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-indigo-400/30 bg-indigo-500/10">
                      <item.icon className="h-5 w-5 text-indigo-300" />
                    </div>
                    <div>
                      <div className="mb-1 font-semibold text-white">{item.title}</div>
                      <div className="text-sm leading-relaxed text-slate-300">{item.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: stack diagram */}
            <div className="relative">
              <div className="rounded-[28px] border border-white/10 bg-slate-900/55 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.32)] backdrop-blur-xl">
                <div className="mb-4 font-mono text-xs text-slate-400">docker-compose.yml</div>
                <div className="space-y-2.5 font-mono text-xs">
                  {[
                    { name: "django-api", color: "bg-emerald-500", label: ":8000", sub: "REST + streaming SSE" },
                    { name: "celery-worker", color: "bg-amber-500", label: "1 worker", sub: "extract · embed · index" },
                    { name: "postgres:15", color: "bg-blue-500", label: ":5433", sub: "metadata + audit log" },
                    { name: "redis:7", color: "bg-red-500", label: ":6379", sub: "task broker" },
                    { name: "minio", color: "bg-pink-500", label: ":9000", sub: "S3-compatible storage" },
                    { name: "faiss-index", color: "bg-purple-500", label: "on-disk", sub: "vector store" },
                    { name: "llama.cpp", color: "bg-gray-800", label: "in-proc", sub: "MiniLM + GGUF model" },
                  ].map((svc) => (
                    <div
                      key={svc.name}
                      className="flex items-center gap-3 rounded-lg border border-white/10 bg-slate-950/60 p-2.5 text-slate-200"
                    >
                      <span className={`h-2 w-2 rounded-full ${svc.color}`} />
                      <span className="font-semibold text-white">{svc.name}</span>
                      <span className="text-slate-400">{svc.label}</span>
                      <span className="ml-auto truncate text-slate-400">{svc.sub}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 border-t border-white/10 pt-4 font-mono text-[11px] text-slate-400">
                  → no external network calls after first model download
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo-600 via-violet-700 to-cyan-600 p-10 text-center shadow-[0_25px_70px_rgba(79,70,229,0.45)] sm:p-16">
            {/* Decorative */}
            <div className="absolute right-0 top-0 h-96 w-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-96 w-96 -translate-x-1/2 translate-y-1/2 rounded-full bg-cyan-300/15 blur-3xl" />

            <div className="relative">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Ready to ground your team?
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-white/80">
                Spin up your business assistant in minutes. Free to self-host,
                no credit card, no vendor lock-in.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="group inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-semibold text-indigo-700 shadow-lg shadow-indigo-900/20 transition-all hover:-translate-y-0.5"
                >
                  Create your business
                  <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-7 py-3.5 font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  Sign in
                </Link>
              </div>

              <p className="mt-8 text-sm text-white/60">
                Already running on Fly.io · Railway · your own box
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}