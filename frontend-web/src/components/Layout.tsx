import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const navLink = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
    isActive
      ? "bg-blue-50 text-blue-700 shadow-sm"
      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
  }`;

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.08),transparent_24%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.06),transparent_28%)]" />

      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/85 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 font-black text-white shadow-lg shadow-blue-500/25">
              L
            </div>
            <span className="text-lg font-semibold tracking-tight text-slate-900">
              Local Business Assistant
            </span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1 md:flex">
            <NavLink to="/dashboard" className={navLink}>
              Dashboard
            </NavLink>
            <NavLink to="/documents" className={navLink}>
              Documents
            </NavLink>
            <NavLink to="/qa" className={navLink}>
              Ask
            </NavLink>
            <NavLink to="/proposal" className={navLink}>
              New proposal
            </NavLink>
            <NavLink to="/proposals" className={navLink}>
              Saved
            </NavLink>
            <NavLink to="/history" className={navLink}>
              History
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <div className="text-right text-sm">
              <div className="font-semibold text-slate-900">
                {user?.business_name}
              </div>
              <div className="text-xs text-slate-500">{user?.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-7xl flex-1 px-4 py-6">
        <div className="w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}