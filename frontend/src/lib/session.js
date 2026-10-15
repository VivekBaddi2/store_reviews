const SESSION_KEY = "store-reviews-session";

export function readSession() {
  const value = localStorage.getItem(SESSION_KEY);
  if (!value) return null;

  try {
    const session = JSON.parse(value);
    return session?.token && session?.user ? session : null;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
