type ApiError = {
  detail?: string;
  message?: string;
  error?: string;
};

export type ApiFetchOptions = RequestInit & {
  authToken?: string;
  extraHeaders?: Record<string, string>;
};

export function getBackendUrl(): string {
  const configuredBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_BACKEND_URL?.trim() ||
    "http://127.0.0.1:8000";

  return configuredBaseUrl.replace(/\/$/, "");
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const baseUrl = getBackendUrl();

  const { authToken, ...fetchOptions } = options;

  const { extraHeaders, ...restFetchOptions } = fetchOptions;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${baseUrl}${path}`, {
    ...restFetchOptions,
    headers,
  });

  if (!res.ok) {
    let parsedErrorMessage: string | null = null;
    try {
      const data = (await res.json()) as ApiError | { detail?: Array<{ msg?: string }> };
      if (typeof data.detail === "string") {
        parsedErrorMessage = data.detail;
      } else if (Array.isArray(data.detail)) {
        parsedErrorMessage = data.detail.map((entry) => entry?.msg).filter(Boolean).join("; ");
      } else if (typeof (data as ApiError).message === "string") {
        parsedErrorMessage = (data as ApiError).message as string;
      } else if (typeof (data as ApiError).error === "string") {
        parsedErrorMessage = (data as ApiError).error as string;
      }
    } catch {
      // ignore non-json
    }
    throw new Error(parsedErrorMessage || `Request failed (${res.status})`);
  }

  return (await res.json()) as T;
}
