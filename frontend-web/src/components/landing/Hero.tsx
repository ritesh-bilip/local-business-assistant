import { Link } from "react-router-dom";
import { IconArrowRight, IconCheck, IconSparkles } from "./Icons";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-32 sm:pb-28 sm:pt-40">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.22),_transparent_32%),linear-gradient(180deg,_rgba(15,23,42,1)_0%,_rgba(3,7,18,1)_100%)]" />
        <div className="absolute left-1/2 top-0 h-[900px] w-[900px] -translate-x-1/2 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="absolute right-0 top-40 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Left: copy */}
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/55 px-3 py-1.5 text-xs font-medium text-slate-200 shadow-[0_18px_50px_rgba(15,23,42,0.3)] backdrop-blur-xl">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Open source · Self-hostable · Runs on your hardware
            </div>

            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Your business,
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-300 bg-clip-text text-transparent">
                on tap.
              </span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-slate-300">
              Ingest your documents, policies, and manuals. Get grounded answers,
              auto-generated proposals, and citeable summaries — powered by a
              local LLM that runs entirely on your infrastructure.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                "Answers cite the exact passage they came from",
                "No data leaves your servers — privacy by default",
                "Streams tokens live, like ChatGPT",
              ].map((line) => (
                <li key={line} className="flex items-start gap-3 text-slate-200">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-400/15 ring-1 ring-emerald-400/30">
                    <IconCheck className="h-3.5 w-3.5 text-emerald-300" />
                  </span>
                  <span className="text-[15px]">{line}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 px-6 py-3 font-medium text-white shadow-[0_14px_26px_rgba(99,102,241,0.45)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_30px_rgba(99,102,241,0.5)]"
              >
                Start free
                <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#how"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/55 px-6 py-3 font-medium text-slate-200 shadow-[0_18px_50px_rgba(15,23,42,0.32)] backdrop-blur-xl transition-colors hover:bg-slate-800/80"
              >
                See how it works
              </a>
            </div>

            <p className="mt-6 text-sm text-slate-400">
              No credit card. Deploy on Fly.io, Railway, or your own box.
            </p>
          </div>

          {/* Right: mock UI */}
          <div className="relative">
            <MockConsole />
          </div>
        </div>
      </div>
    </section>
  );
}

// ----- Mock console visual -----
function MockConsole() {
  return (
    <div className="relative">
      {/* Glow */}
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-indigo-500/20 via-violet-500/20 to-transparent blur-2xl" />

      {/* Window */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/65 shadow-[0_25px_70px_rgba(15,23,42,0.6)] backdrop-blur-xl">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-white/10 bg-slate-950/60 px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <span className="ml-3 font-mono text-xs text-slate-400">
            local-business-assistant
          </span>
        </div>

        {/* Body */}
        <div className="space-y-4 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-5">
          {/* User message */}
          <div className="flex justify-end">
            <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-gradient-to-r from-indigo-500 to-violet-500 px-3.5 py-2 text-sm text-white shadow-[0_14px_26px_rgba(99,102,241,0.35)]">
              What's the warranty on main valves?
            </div>
          </div>

          {/* Assistant response */}
          <div className="flex gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 text-[10px] font-semibold text-white shadow-lg shadow-indigo-500/30">
              AI
            </div>
            <div className="min-w-0 flex-1">
              <div className="rounded-2xl rounded-tl-sm bg-slate-800/90 px-3.5 py-2.5 text-sm leading-relaxed text-slate-100">
                Main valves installed by Acme carry a{" "}
                <span className="font-semibold text-cyan-300">24-month warranty</span>{" "}
                from installation date.
                <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-indigo-400 align-text-bottom" />
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400">
                <span>Confidence: 87%</span>
                <span>·</span>
                <span>312ms</span>
              </div>
            </div>
          </div>

          {/* Sources */}
          <div className="mt-1 border-t border-white/10 pt-3">
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Sources
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/60 p-2 text-xs text-slate-200">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-[10px] font-semibold text-white">1</span>
                <span className="truncate text-slate-200">warranty_policy.pdf</span>
                <span className="ml-auto font-mono text-slate-400">0.87</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/60 p-2 text-xs text-slate-200">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 text-[10px] font-semibold text-white">2</span>
                <span className="truncate text-slate-200">service_manual.pdf · p.4</span>
                <span className="ml-auto font-mono text-slate-400">0.61</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <div className="absolute -bottom-5 -left-5 hidden items-center gap-2 rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-200 shadow-[0_18px_50px_rgba(15,23,42,0.32)] backdrop-blur-xl sm:flex">
        <IconSparkles className="h-4 w-4 text-cyan-300" />
        Grounded in your docs
      </div>
    </div>
  );
}