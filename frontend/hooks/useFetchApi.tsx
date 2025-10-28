// src/hooks/useFetchApi.ts
import { useCallback, useState } from "react";
import { tokenManager } from "../lib/TokenManagerService";

export interface ApiOptions extends Omit<RequestInit, "body"> {
  url?: string;
  skipAuth?: boolean;
}

export interface ApiMethods<T> {
  data?: T | null;
  loading: boolean;
  error?: Error | null;
  get: (options?: ApiOptions) => Promise<T | null>;
  post: (body?: unknown, options?: ApiOptions) => Promise<T | null>;
}

interface FetchState<T> {
  data?: T | null;
  loading: boolean;
  error?: Error | null;
}

export function useFetchApi<T = unknown>(
  baseUrl: string,
  defaultOptions?: RequestInit
): ApiMethods<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (
      method: string,
      body?: unknown,
      options?: ApiOptions
    ): Promise<T | null> => {
      const { url, skipAuth, ...restOptions } = options || {};
      const fetchUrl = url ?? baseUrl;

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          ...(defaultOptions?.headers as Record<string, string>),
          ...(options?.headers as Record<string, string>),
        };

        // ✅ Only access token on the client (inside async function, after hydration)
        if (!skipAuth) {
          // tokenManager.getToken() already checks `typeof window`
          const token = tokenManager.getToken();
          if (token) {
            headers["Authorization"] = `Bearer ${token}`;
          }
        }

        const response = await fetch(fetchUrl, {
          method,
          ...(defaultOptions ?? {}),
          ...restOptions,
          headers,
          body: body === undefined ? undefined : JSON.stringify(body),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `HTTP error! status: ${response.status}, message: ${errorText}`
          );
        }

        const contentType = response.headers.get("content-type") ?? "";
        const parsedData = contentType.includes("application/json")
          ? await response.json()
          : await response.text();

        setState({ data: parsedData as T, loading: false, error: null });
        return parsedData as T;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setState({ data: null, loading: false, error: err });
        return null;
      }
    },
    [baseUrl, defaultOptions]
  );

  const get = useCallback(
    (options?: ApiOptions) => execute("GET", undefined, options),
    [execute]
  );

  const post = useCallback(
    (body?: unknown, options?: ApiOptions) => execute("POST", body, options),
    [execute]
  );

  return {
    ...state,
    get,
    post,
  };
}