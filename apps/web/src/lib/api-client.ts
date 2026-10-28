import { useAuth } from "@clerk/tanstack-react-start";
import { useCallback } from "react";

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

const apiBaseUrl = (
  import.meta.env?.VITE_API_BASE_URL ?? "http://localhost:3001/api"
).replace(/\/+$/, "");

export async function apiRequest<T>(
  path: string,
  getToken: () => Promise<string | null>,
  init?: RequestInit,
): Promise<T> {
  const token = await getToken();
  if (!token) throw new ApiRequestError("Authentication required", 401);

  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${apiBaseUrl}/${path.replace(/^\/+/, "")}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new ApiRequestError(
      `API request failed with status ${response.status}`,
      response.status,
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function useApiClient() {
  const { getToken } = useAuth();
  return useCallback(
    <T>(path: string, init?: RequestInit) =>
      apiRequest<T>(path, getToken, init),
    [getToken],
  );
}
