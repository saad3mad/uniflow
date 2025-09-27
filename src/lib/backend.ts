export function getBackendUrl() {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not set. Please set it to your .NET API base URL (e.g., https://api.example.com or http://localhost:5000)");
  }
  return url.replace(/\/$/, "");
}

export async function apiFetch<T = any>(userId: string, path: string, init: RequestInit = {}) {
  const base = getBackendUrl();
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": userId,
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.ok === false) {
    const errMsg = data?.error || `Request failed (${res.status})`;
    throw new Error(errMsg);
  }
  return data as T;
}
