import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

export const API_URL: string =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  "https://orbitfuture.replit.app";

const TOKEN_KEY = "orbitfuture_token";

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // ignore
  }
}

export async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API_URL}/api/${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        const err = await response.json();
        errorMessage = err.error ?? err.message ?? errorMessage;
      } else {
        errorMessage = response.statusText || errorMessage;
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(errorMessage);
  }

  // Handle empty 204 responses
  if (response.status === 204) return {} as T;

  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
}
