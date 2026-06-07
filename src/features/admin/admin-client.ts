import type { MatchInput } from "@/repositories/admin.server";
import type { Score, Tournament } from "@/types";

async function send<T>(
  url: string,
  method: "POST" | "PATCH",
  body: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "Error del servidor");
  }
  return data as T;
}

export function createMatch(input: MatchInput) {
  return send<{ ok: true; id: string }>("/api/admin/matches", "POST", input);
}

export function updateMatch(id: string, patch: Partial<MatchInput>) {
  return send<{ ok: true }>(`/api/admin/matches/${id}`, "PATCH", patch);
}

export async function deleteMatch(id: string) {
  const res = await fetch(`/api/admin/matches/${id}`, { method: "DELETE" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "Error del servidor");
  }
  return data as { ok: true; predictionsDeleted: number };
}

export function finalizeMatch(
  matchId: string,
  result: Score,
  advances: string | null = null,
  correction = false,
) {
  return send<{ ok: true; predictionsScored: number }>(
    "/api/admin/finalize-match",
    "POST",
    { matchId, ...result, advances, correction },
  );
}

export function updateTournament(patch: Partial<Tournament>) {
  return send<{ ok: true }>("/api/admin/tournament", "PATCH", patch);
}

export async function deleteUser(uid: string) {
  const res = await fetch(`/api/admin/users/${uid}`, { method: "DELETE" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "Error del servidor");
  }
  return data as { ok: true; predictionsDeleted: number };
}
