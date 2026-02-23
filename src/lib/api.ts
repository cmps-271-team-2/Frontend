type ApiError = {
  detail?: string;
};

type ApiFetchOptions = RequestInit & {
  authToken?: string;
};

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is missing in .env");
  }

  const { authToken, ...fetchOptions } = options;

  const res = await fetch(`${baseUrl}${path}`, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(fetchOptions.headers || {}),
    },
  });

  if (!res.ok) {
    let data: ApiError = {};
    try {
      data = await res.json();
    } catch {
      // ignore non-json
    }
    throw new Error(data.detail || `Request failed (${res.status})`);
  }

  return (await res.json()) as T;
}
