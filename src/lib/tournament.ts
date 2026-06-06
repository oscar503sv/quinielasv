import type { Tournament } from "@/types";

/** ¿Está congelada la edición de pronósticos en toda la quiniela? */
export function predictionsFrozen(
  t: Pick<Tournament, "predictionsLocked" | "finished"> | null | undefined,
): boolean {
  return !!(t?.predictionsLocked || t?.finished);
}

/** ¿La quiniela está abierta para los jugadores? (default abierto si no hay doc). */
export function tournamentOpen(
  t: Pick<Tournament, "started"> | null | undefined,
): boolean {
  return t?.started !== false;
}
