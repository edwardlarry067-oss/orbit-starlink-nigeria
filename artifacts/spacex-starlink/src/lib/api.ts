const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function getApiUrl(path: string): string {
  return `${BASE}/api/${path}`;
}
