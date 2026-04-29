import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";
import { LoadingScreen } from "../components/LoadingScreen.jsx";

const TOKEN_KEY = "family-todo-token";

export function PortalLoginPage() {
  const [searchParams] = useSearchParams();
  const portalToken = searchParams.get("portalToken");
  const [error, setError] = useState(
    !portalToken ? "Missing portalToken" : null,
  );
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!portalToken) return;

    let cancelled = false;

    (async () => {
      try {
        const { token, user } = await api.portalLogin(portalToken);
        if (cancelled) return;
        localStorage.setItem(TOKEN_KEY, token);
        sessionStorage.setItem(
          "family-todo.portalAuth",
          JSON.stringify({ token, user }),
        );
        setDone(true);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Portal login failed");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [portalToken]);

  if (done) {
    // Force full reload so AuthContext picks up the new token
    window.location.replace("/");
    return <LoadingScreen label="Signing in..." />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg rounded-3xl bg-white/80 p-10 text-center shadow-glow backdrop-blur">
          <h1 className="font-display text-2xl font-semibold text-midnight-900">
            Portal Login Failed
          </h1>
          <p className="mt-4 text-sm text-red-600">{error}</p>
          <a
            href="/login"
            className="mt-6 inline-block rounded-full bg-midnight-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-midnight-800"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return <LoadingScreen label="Signing in via portal..." />;
}
