import type { Tournament } from "@/types";

/**
 * ¿Los jugadores todavía pueden elegir/cambiar su campeón?
 * Abierto hasta `championLockAt` (5 min antes del partido inaugural).
 * Si no hay deadline definido, se considera abierto.
 */
export function isChampionOpen(
  tournament: Pick<Tournament, "championLockAt"> | null | undefined,
  now = Date.now(),
): boolean {
  const lock = tournament?.championLockAt ?? null;
  if (!lock) return true;
  return now < lock;
}
