import { Menu, Plus, Power, StickyNote } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

function NavItem({ to, children, onClick }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
          isActive
            ? "bg-midnight-900 text-white shadow-lg shadow-midnight-900/20"
            : "text-midnight-700 hover:bg-white/70"
        }`
      }
      onClick={onClick}
    >
      {children}
    </NavLink>
  );
}

export function AppShell() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(68,92,128,0.08),_transparent_55%),_#f8f5f0]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-midnight-900 text-white shadow-glow">
            <StickyNote className="h-6 w-6" />
          </span>
          <div className="hidden md:block">
            <p className="font-display text-lg tracking-tight text-midnight-900">
              Family Tasks
            </p>
            <p className="text-sm text-midnight-500">
              Shared chores with receipts of love
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-3 md:flex">
          <NavItem to="/tasks">Tasks</NavItem>
          <NavItem to="/tasks/new">
            <Plus className="h-4 w-4" /> New Task
          </NavItem>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <div className="rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-midnight-700 shadow">
            {user?.displayName}
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-midnight-700 shadow hover:bg-white"
          >
            <Power className="h-4 w-4" /> Logout
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 shadow md:hidden"
        >
          <Menu className="h-5 w-5 text-midnight-800" />
        </button>
      </header>

      <div
        className={`mx-6 mt-[-1rem] flex flex-col gap-4 rounded-3xl bg-white/80 px-6 py-5 shadow-glow backdrop-blur md:hidden ${
          menuOpen ? "opacity-100" : "hidden"
        }`}
      >
        <NavItem to="/tasks" onClick={() => setMenuOpen(false)}>
          Tasks
        </NavItem>
        <NavItem to="/tasks/new" onClick={() => setMenuOpen(false)}>
          <Plus className="h-4 w-4" /> New Task
        </NavItem>
        <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-2 text-sm text-midnight-600">
          <span>{user?.displayName}</span>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 rounded-full bg-midnight-900 px-4 py-2 text-xs font-semibold text-white"
          >
            <Power className="h-3 w-3" /> Logout
          </button>
        </div>
      </div>

      <main className="mx-auto min-h-[calc(100vh-10rem)] max-w-6xl px-6 pb-16">
        <Outlet />
      </main>
    </div>
  );
}
