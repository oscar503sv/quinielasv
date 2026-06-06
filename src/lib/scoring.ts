import { STAGES } from "@/constants/stages";
import type { MatchStage, ResultKind, Score } from "@/types";

const sign = (n: number): number => (n > 0 ? 1 : n < 0 ? -1 : 0);

/**
 * Puntos base por partido (spec §4):
 *  - 5: marcador exacto
 *  - 3: ganador correcto + diferencia de goles exacta
 *  - 1: tendencia (acierta quién gana/empata)
 *  - 0: fallo
 */
export function basePoints(pred: Score, res: Score): number {
  if (pred.home === res.home && pred.away === res.away) return 5;
  const pd = pred.home - pred.away;
  const rd = res.home - res.away;
  if (sign(pd) === sign(rd)) return pd === rd ? 3 : 1;
  return 0;
}

/** Puntos totales = base × multiplicador de la fase. */
export function totalPoints(pred: Score, res: Score, stage: MatchStage): number {
  return basePoints(pred, res) * STAGES[stage].mult;
}

/** Etiqueta del tipo de acierto. */
export function resultKind(pred: Score, res: Score): ResultKind {
  const base = basePoints(pred, res);
  if (base === 5) return "exacto";
  if (base === 3) return "dif. exacta";
  if (base === 1) return "tendencia";
  return "fallo";
}

/** Bono por acertar el campeón del Mundial (spec §4). */
export const CHAMPION_BONUS = 25;

/** Bono por acertar quién avanza/gana en un partido de eliminatoria. */
export const ADVANCE_BONUS = 5;

/**
 * Equipo que avanza según un marcador: el ganador del marcador; si es empate,
 * el desempate elegido (tiempo extra/penales). Devuelve null si el empate no
 * tiene desempate definido. Así "quién avanza" nunca contradice el marcador.
 */
export function resolveAdvancer(
  home: string,
  away: string,
  score: Score,
  tieBreak: string | null,
): string | null {
  if (score.home > score.away) return home;
  if (score.away > score.home) return away;
  return tieBreak;
}

/**
 * Bono de avance: se otorga si el partido ya tiene definido quién avanzó
 * (`actual`) y el jugador acertó ese equipo. En grupos `actual` es null → 0.
 */
export function advanceBonus(pred: string | null, actual: string | null): number {
  return actual != null && pred === actual ? ADVANCE_BONUS : 0;
}
