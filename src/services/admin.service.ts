import "server-only";

import { getAdminDb } from "@/lib/firebase/admin";
import { basePoints, totalPoints, advanceBonus, resolveAdvancer } from "@/lib/scoring";
import { STAGES, isKnockout } from "@/constants/stages";
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
 *
 * Con `correction: true` permite re-finalizar un partido YA finalizado para
 * corregir un marcador mal cargado: el batch es idempotente (reescribe puntos y
 * resultado) y el ranking se recalcula solo desde `match.result`.
 */
export async function finalizeMatch(
  matchId: string,
  result: Score,
  performedBy: string,
  advances: string | null = null,
  correction = false,
): Promise<{ predictionsScored: number }> {
  const match = await getMatchById(matchId);
  if (!match) throw new AdminError("El partido no existe.");
  if (match.status === "finished" && !correction) {
    throw new AdminError("El partido ya está finalizado.");
  }
  if (match.status !== "finished" && correction) {
    throw new AdminError("El partido todavía no está finalizado.");
  }

  // En eliminatorias el que avanza se deriva del marcador; solo si el resultado
  // oficial es empate (se definió por tiempo extra/penales) hay que indicarlo.
  let advanced: string | null = null;
  if (isKnockout(match.stage)) {
    const draw = result.home === result.away;
    if (draw && advances !== match.home && advances !== match.away) {
      throw new AdminError("Empate en los 90': indicá qué equipo avanza (penales).");
    }
    advanced = resolveAdvancer(match.home, match.away, result, draw ? advances : null);
  }

  const predictions = await getPredictionsForMatch(matchId);
  const db = getAdminDb();
  const batch = db.batch();
  const mult = STAGES[match.stage].mult;

  for (const p of predictions) {
    const pred = { home: p.home, away: p.away };
    const bonus = advanceBonus(
      resolveAdvancer(match.home, match.away, pred, p.advances),
      advanced,
    );
    batch.update(db.collection("predictions").doc(p.id), {
      basePoints: basePoints(pred, result),
      multiplier: mult,
      advanceBonus: bonus,
      pointsEarned: totalPoints(pred, result, match.stage) + bonus,
    });
  }

  batch.update(db.collection("matches").doc(matchId), {
    result: { home: result.home, away: result.away },
    advances: advanced,
    status: "finished",
  });

  await batch.commit();

  await writeAuditLog({
    action: correction ? "correct_match" : "finalize_match",
    entityType: "match",
    entityId: matchId,
    performedBy,
    metadata: { result, advances: advanced, predictionsScored: predictions.length },
  });

  return { predictionsScored: predictions.length };
}
