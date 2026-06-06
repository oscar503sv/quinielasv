async function send<T>(url: string, method: "POST" | "PATCH" | "DELETE", body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "Error del servidor");
  }
  return data as T;
}

export function createLeague(name: string) {
  return send<{ ok: true; id: string; code: string }>("/api/leagues", "POST", { name });
}

export function joinLeague(code: string) {
  return send<{ ok: true; id: string; name: string }>("/api/leagues/join", "POST", { code });
}

export function renameLeague(id: string, name: string) {
  return send<{ ok: true }>(`/api/leagues/${id}`, "PATCH", { name });
}

export function deleteLeague(id: string) {
  return send<{ ok: true }>(`/api/leagues/${id}`, "DELETE");
}

export function leaveLeague(id: string) {
  return send<{ ok: true }>(`/api/leagues/${id}`, "POST", { action: "leave" });
}

export function kickMember(id: string, targetUid: string) {
  return send<{ ok: true }>(`/api/leagues/${id}`, "POST", { action: "kick", targetUid });
}
