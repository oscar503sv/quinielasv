import "server-only";

import { getAdminDb } from "@/lib/firebase/admin";
import { basePoints, totalPoints } from "@/lib/scoring";
import { STAGES } from "@/constants/stages";
import {
  getMatchById,
  getPredictionsForMatch,
  writeAuditLog,
} from "@/repositories/admin.server";
import type { Score } from "@/types";

export class AdminError extends Error {}

/**
 * Finaliza un partido: setea el resultado oficial, calcula y persiste los
 * puntos de cada pronóstico y marca el partido como `finished`. Registra
 * auditoría. Todo en un batch atómico (Admin SDK, ignora las reglas).
 */
export async function finalizeMatch(
  matchId: string,
  result: Score,
  performedBy: string,
): Promise<{ predictionsScored: number }> {
  const match = await getMatchById(matchId);
  if (!match) throw new AdminError("El partido no existe.");
  if (match.status === "finished") {
    throw new AdminError("El partido ya está finalizado.");
  }

  const predictions = await getPredictionsForMatch(matchId);
  const db = getAdminDb();
  const batch = db.batch();
  const mult = STAGES[match.stage].mult;

  for (const p of predictions) {
    const pred = { home: p.home, away: p.away };
    batch.update(db.collection("predictions").doc(p.id), {
      basePoints: basePoints(pred, result),
      multiplier: mult,
      pointsEarned: totalPoints(pred, result, match.stage),
    });
  }

  batch.update(db.collection("matches").doc(matchId), {
    result: { home: result.home, away: result.away },
    status: "finished",
  });

  await batch.commit();

  await writeAuditLog({
    action: "finalize_match",
    entityType: "match",
    entityId: matchId,
    performedBy,
    metadata: { result, predictionsScored: predictions.length },
  });

  return { predictionsScored: predictions.length };
}
