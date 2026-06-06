import { upsertPrediction } from "@/repositories/predictions.client";
import { clampScore } from "@/lib/score-utils";
import { isKnockout } from "@/constants/stages";
import type { Match, Score } from "@/types";

export class PredictionError extends Error {}

/** ¿El partido admite editar pronóstico ahora mismo? */
export function canPredict(match: Match, now = Date.now()): boolean {
  return match.status === "upcoming" && match.lockAt > now;
}

/**
 * Guarda el pronóstico validando que el partido siga abierto (spec §8).
 * En etapa 2 esta validación se replica server-side en Firestore rules /
 * Cloud Function.
 */
export async function savePrediction(
  userId: string,
  match: Match,
  score: Score,
  advances: string | null = null,
  frozen = false,
): Promise<void> {
  if (frozen) {
    throw new PredictionError("Los pronósticos están congelados por el admin.");
  }
  if (!canPredict(match)) {
    throw new PredictionError(
      "El pronóstico ya no se puede editar: el partido está cerrado.",
    );
  }
  const h = clampScore(score.home);
  const a = clampScore(score.away);
  // El "quién avanza" solo se guarda en eliminatorias Y si el marcador es empate
  // (con ganador, avanza el ganador → se deriva del marcador). Evita contradicciones.
  let pick: string | null = null;
  if (isKnockout(match.stage) && h === a && advances) {
    if (advances !== match.home && advances !== match.away) {
      throw new PredictionError("El equipo que avanza no es válido.");
    }
    pick = advances;
  }
  await upsertPrediction(userId, match.id, { home: h, away: a, advances: pick });
}
