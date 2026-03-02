const DEFAULT_ADMIN_API_BASE_URL = "http://localhost:4000";

export const ADMIN_API_BASE_URL = import.meta.env.VITE_ADMIN_API_BASE_URL || DEFAULT_ADMIN_API_BASE_URL;

function buildUrl(path: string) {
  return new URL(path, ADMIN_API_BASE_URL).toString();
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(buildUrl(path));
  if (!response.ok) throw new Error(`GET ${path} failed: ${response.status}`);
  return (await response.json()) as T;
}

export async function apiPost<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(`POST ${path} failed: ${response.status}`);
  return (await response.json()) as T;
}

export async function apiPatch<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(`PATCH ${path} failed: ${response.status}`);
  return (await response.json()) as T;
}
