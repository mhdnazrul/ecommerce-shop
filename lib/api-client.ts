export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.message || "Request failed")
  return json.data as T
}
