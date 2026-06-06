import { upsertPrediction } from "@/repositories/predictions.client";
import { clampScore } from "@/lib/score-utils";
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
  await upsertPrediction(userId, match.id, {
    home: clampScore(score.home),
    away: clampScore(score.away),
  });
}
