import { readSession } from "./session.js";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/+$/, "");

export async function apiRequest(path, options = {}) {
  const session = readSession();
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (session?.token) {
    headers.set("Authorization", `Bearer ${session.token}`);
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error("Could not reach the server. Check your connection and try again.", { cause: error });
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      window.dispatchEvent(new CustomEvent("session:unauthorized"));
    }
    throw new Error(payload.message || "The request could not be completed.");
  }

  return payload;
}

export const api = {
  get: (path, options) => apiRequest(path, options),
  post: (path, body, options = {}) =>
    apiRequest(path, { ...options, method: "POST", body: JSON.stringify(body) }),
};
