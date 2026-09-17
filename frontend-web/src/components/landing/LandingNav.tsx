import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IconLogo } from "./Icons";

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-slate-950/75 shadow-[0_12px_30px_rgba(15,23,42,0.5)] backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <IconLogo className="w-8 h-8" />
            <span className="font-semibold tracking-tight text-white">
              Local Business Assistant
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="transition-colors hover:text-white">Features</a>
            <a href="#how" className="transition-colors hover:text-white">How it works</a>
            <a href="#usecases" className="transition-colors hover:text-white">Use cases</a>
            <a href="#security" className="transition-colors hover:text-white">Security</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 px-4 py-2 text-sm font-medium text-white shadow-[0_14px_26px_rgba(99,102,241,0.45)] transition hover:-translate-y-0.5"
            >
              Get started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}