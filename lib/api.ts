type ApiError = {
  detail?: string;
  message?: string;
  error?: string;
};

type ApiFetchOptions = RequestInit & {
  authToken?: string;
};

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.unitok.app";
  const baseUrl = configuredBaseUrl.replace(/\/$/, "");

  const { authToken, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${baseUrl}${path}`, {
    ...fetchOptions,
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
