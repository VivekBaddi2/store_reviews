import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api.js";
import { clearSession, readSession, saveSession } from "../lib/session.js";
import { AuthContext } from "./authContext.js";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  useEffect(() => {
    window.addEventListener("session:unauthorized", logout);
    return () => window.removeEventListener("session:unauthorized", logout);
  }, [logout]);

  const login = useCallback(async (email, password) => {
    const result = await api.post("/auth/login", { email, password });
    const nextSession = { token: result.token, user: result.user };
    saveSession(nextSession);
    setSession(nextSession);
    return nextSession.user;
  }, []);

  const value = useMemo(() => ({ session, user: session?.user ?? null, login, logout }), [
    session,
    login,
    logout,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
