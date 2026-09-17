import { Link } from "react-router-dom";
import { IconLogo } from "./Icons";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/80">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center gap-2.5">
              <IconLogo className="w-8 h-8" />
              <span className="font-semibold text-white">
                Local Business Assistant
              </span>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-slate-300">
              Grounded RAG for small businesses. Self-hosted, privacy-first,
              and cited end-to-end.
            </p>
          </div>

          <div>
            <div className="mb-4 text-sm font-semibold text-white">Product</div>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><a href="#features" className="transition-colors hover:text-white">Features</a></li>
              <li><a href="#how" className="transition-colors hover:text-white">How it works</a></li>
              <li><a href="#usecases" className="transition-colors hover:text-white">Use cases</a></li>
              <li><a href="#security" className="transition-colors hover:text-white">Security</a></li>
            </ul>
          </div>

          <div>
            <div className="mb-4 text-sm font-semibold text-white">Account</div>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><Link to="/login" className="transition-colors hover:text-white">Sign in</Link></li>
              <li><Link to="/register" className="transition-colors hover:text-white">Register</Link></li>
              <li><Link to="/dashboard" className="transition-colors hover:text-white">Dashboard</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Local Business Assistant. Open source.
          </p>
          <p className="text-xs text-slate-500">
            Built with Django · React · FAISS · llama.cpp
          </p>
        </div>
      </div>
    </footer>
  );
}