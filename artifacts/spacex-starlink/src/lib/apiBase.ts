const VITE_API_URL = import.meta.env.VITE_API_URL as string | undefined;

export const API_BASE = VITE_API_URL
  ? VITE_API_URL.replace(/\/$/, "")
  : import.meta.env.BASE_URL.replace(/\/$/, "");
