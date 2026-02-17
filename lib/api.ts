type ApiError = {
  detail?: string;
};

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!baseUrl) throw new Error("NEXT_PUBLIC_BACKEND_URL is missing in .env");

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
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
