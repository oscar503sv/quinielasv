export const SCORE_MIN = 0;
export const SCORE_MAX = 20;

/** Acota un marcador al rango válido 0–20 (spec §6.3). */
export function clampScore(n: number): number {
  return Math.max(SCORE_MIN, Math.min(SCORE_MAX, Math.round(n)));
}
