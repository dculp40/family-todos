/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";

export const AuthContext = createContext(null);

const TOKEN_KEY = "family-todo-token";
const PORTAL_AUTH_KEY = "family-todo.portalAuth";

function getInitialAuthState() {
  const portalAuth = sessionStorage.getItem(PORTAL_AUTH_KEY);

  if (!portalAuth) {
    const token = localStorage.getItem(TOKEN_KEY);
    return { token, user: null, loading: !!token };
  }

  sessionStorage.removeItem(PORTAL_AUTH_KEY);

  try {
    const parsed = JSON.parse(portalAuth);
    if (parsed?.token && parsed?.user) {
      localStorage.setItem(TOKEN_KEY, parsed.token);
      return { token: parsed.token, user: parsed.user, loading: false };
    }
  } catch {
    return { token: null, user: null, loading: false };
  }

  const token = localStorage.getItem(TOKEN_KEY);
  return { token, user: null, loading: !!token };
}

export function AuthProvider({ children }) {
  const [initialAuthState] = useState(getInitialAuthState);
  const [token, setToken] = useState(initialAuthState.token);
  const [user, setUser] = useState(initialAuthState.user);
  const [loading, setLoading] = useState(initialAuthState.loading);

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const data = await api.me(token);
        if (!cancelled) {
          setUser(data);
        }
      } catch {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      async login(username, password) {
        setLoading(true);
        try {
          const { token: newToken, user: userData } = await api.login(
            username,
            password,
          );
          localStorage.setItem(TOKEN_KEY, newToken);
          setToken(newToken);
          setUser(userData);
        } finally {
          setLoading(false);
        }
      },
      logout() {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
        setLoading(false);
      },
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
