import "server-only";

import { getAdminDb } from "@/lib/firebase/admin";
import type { Match, Prediction, Tournament } from "@/types";

/** Campos editables de un partido (sin id ni result). */
export interface MatchInput {
  home: string;
  away: string;
  stage: Match["stage"];
  status: Match["status"];
  date: string;
  lockAt: number;
}

function matchFromDoc(id: string, data: FirebaseFirestore.DocumentData): Match {
  return {
    id,
    home: data.home,
    away: data.away,
    stage: data.stage,
    status: data.status,
    date: data.date ?? "",
    lockAt: data.lockAt ?? 0,
    result: data.result ?? null,
  };
}

export async function createMatch(input: MatchInput): Promise<string> {
  const ref = await getAdminDb().collection("matches").add({
    ...input,
    result: null,
  });
  return ref.id;
}

export async function updateMatch(
  id: string,
  patch: Partial<MatchInput>,
): Promise<void> {
  await getAdminDb().collection("matches").doc(id).update(patch);
}

/** Borra el partido y todos los pronósticos asociados (evita huérfanos). */
export async function deleteMatchWithPredictions(
  id: string,
): Promise<{ predictionsDeleted: number }> {
  const db = getAdminDb();
  const preds = await db
    .collection("predictions")
    .where("matchId", "==", id)
    .get();

  const batch = db.batch();
  preds.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(db.collection("matches").doc(id));
  await batch.commit();

  return { predictionsDeleted: preds.size };
}

export async function getMatchById(id: string): Promise<Match | null> {
  const snap = await getAdminDb().collection("matches").doc(id).get();
  return snap.exists ? matchFromDoc(snap.id, snap.data()!) : null;
}

export async function getPredictionsForMatch(
  matchId: string,
): Promise<Prediction[]> {
  const snap = await getAdminDb()
    .collection("predictions")
    .where("matchId", "==", matchId)
    .get();
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      userId: data.userId,
      matchId: data.matchId,
      home: data.home,
      away: data.away,
      updatedAt: data.updatedAt ?? 0,
    };
  });
}

export async function updateTournament(
  patch: Partial<Tournament>,
): Promise<void> {
  await getAdminDb()
    .collection("tournament")
    .doc("config")
    .set(patch, { merge: true });
}

/** Lee el deadline de elección de campeón desde el doc de torneo. */
export async function getChampionLockAt(): Promise<number | null> {
  const snap = await getAdminDb().collection("tournament").doc("config").get();
  return snap.exists ? ((snap.data()?.championLockAt as number | null) ?? null) : null;
}

/** Escribe la predicción de campeón de un jugador (vía Admin SDK). */
export async function setChampionPrediction(
  uid: string,
  champion: string,
): Promise<void> {
  await getAdminDb()
    .collection("users")
    .doc(uid)
    .set({ championPrediction: champion }, { merge: true });
}

export interface AuditEntry {
  action: string;
  entityType: string;
  entityId: string;
  performedBy: string;
  metadata?: Record<string, unknown>;
}

export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  await getAdminDb()
    .collection("audit_logs")
    .add({ ...entry, at: Date.now() });
}
