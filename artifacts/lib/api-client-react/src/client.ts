let authTokenGetter: (() => string | null) | null = null;

export function setAuthTokenGetter(getter: () => string | null) {
  authTokenGetter = getter;
}

export function getApiBase(): string {
  // Always use relative URLs so the frontend hits the same domain.
  // Vercel rewrites /api/* to the Replit backend via vercel.json.
  // Replit dev server proxies /api to localhost:3001 via vite.config.ts.
  return "";
}

export async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const base = getApiBase();
  const url = `${base}/api/${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authTokenGetter) {
    const token = authTokenGetter();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}
