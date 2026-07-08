const TOKEN_KEY = "jdlearn_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

// In production the frontend and backend may live on different origins.
// Set VITE_API_URL (e.g. https://your-backend.railway.app) at build time.
// In local dev it stays empty and Vite proxies /api to localhost:4000.
const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export async function api(path, { method = "GET", body } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers["Content-Type"] = "application/json";

  let res;
  try {
    res = await fetch(`${API_BASE}/api${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the server. Check your connection.");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    // Non-JSON error (e.g. 404 from a missing backend) → clearer hint.
    if (!data) throw new Error(`Server error (${res.status}). Is the backend running?`);
    throw new Error(data.error || "Request failed");
  }
  return data;
}

// Separate from api() because file uploads need multipart/form-data —
// the browser sets its own Content-Type boundary, so we must NOT set one.
export async function uploadFile(file) {
  const token = getToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const form = new FormData();
  form.append("file", file);

  let res;
  try {
    res = await fetch(`${API_BASE}/api/upload`, { method: "POST", headers, body: form });
  } catch {
    throw new Error("Cannot reach the server. Check your connection.");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || "Upload failed");
  return data;
}
