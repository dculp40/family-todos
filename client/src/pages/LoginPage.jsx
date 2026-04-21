import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";

export function LoginPage() {
  const { user, login, loading } = useAuth();
  const location = useLocation();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    const redirectTo = location.state?.from || "/tasks";
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(form.username.trim(), form.password);
    } catch (err) {
      setError(err.message || "Unable to login");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg rounded-3xl bg-white/80 p-10 shadow-glow backdrop-blur">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-midnight-900 text-white shadow-lg">
            <LogIn className="h-8 w-8" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-midnight-900">Welcome back</h1>
          <p className="mt-2 text-sm text-midnight-500">
            Sign in with the shared family username and password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <label className="flex flex-col gap-2 text-left">
            <span className="text-sm font-semibold text-midnight-700">Username</span>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))}
              className="w-full rounded-2xl border border-transparent bg-white px-4 py-3 text-midnight-900 shadow-sm outline-none ring-2 ring-transparent transition focus:ring-midnight-300"
              placeholder="danny"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-left">
            <span className="text-sm font-semibold text-midnight-700">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              className="w-full rounded-2xl border border-transparent bg-white px-4 py-3 text-midnight-900 shadow-sm outline-none ring-2 ring-transparent transition focus:ring-midnight-300"
              placeholder="••••••"
              required
            />
          </label>

          {error && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 shadow-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-midnight-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-midnight-900/20 transition hover:bg-midnight-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting || loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
