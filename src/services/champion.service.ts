import "server-only";

import {
  getChampionLockAt,
  setChampionPrediction,
  writeAuditLog,
} from "@/repositories/admin.server";
import { isChampionOpen } from "@/lib/champion";

export class ChampionError extends Error {}

/**
 * Setea la predicción de campeón de un jugador validando el deadline en el
 * servidor (5 min antes del partido inaugural). Sirve tanto para elegir por
 * primera vez como para cambiar; ambos casos quedan bloqueados tras el cierre.
 */
export async function setChampion(uid: string, champion: string): Promise<void> {
  const championLockAt = await getChampionLockAt();
  if (!isChampionOpen({ championLockAt })) {
    throw new ChampionError(
      "El plazo para elegir o cambiar tu campeón ya cerró.",
    );
  }
  await setChampionPrediction(uid, champion);
  await writeAuditLog({
    action: "set_champion_prediction",
    entityType: "user",
    entityId: uid,
    performedBy: uid,
    metadata: { champion },
  });
}
