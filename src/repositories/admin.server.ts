import "server-only";

import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { getMemberLeagues, getOwnedLeagues } from "@/repositories/leagues.server";
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
    advances: data.advances ?? null,
  };
}

export async function createMatch(input: MatchInput): Promise<string> {
  const ref = await getAdminDb().collection("matches").add({
    ...input,
    result: null,
    advances: null,
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
      advances: data.advances ?? null,
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

/**
 * Borra por completo a un jugador: sus pronósticos, su doc de perfil, su cuenta
 * de Auth y sus rastros en las ligas (lo saca de las que es miembro y borra las
 * que él creó). La eliminación de la cuenta de Auth es best-effort (puede no
 * existir si ya fue borrada).
 */
export async function deleteUserCascade(
  uid: string,
): Promise<{ predictionsDeleted: number; leaguesDeleted: number; leaguesLeft: number }> {
  const db = getAdminDb();
  const preds = await db
    .collection("predictions")
    .where("userId", "==", uid)
    .get();

  // Ligas: borrar las propias, salir de las ajenas (sin duplicar las propias).
  const owned = await getOwnedLeagues(uid);
  const member = await getMemberLeagues(uid);
  const ownedIds = new Set(owned.map((l) => l.id));

  const batch = db.batch();
  preds.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(db.collection("users").doc(uid));
  for (const l of owned) {
    batch.delete(db.collection("leagues").doc(l.id));
  }
  for (const l of member) {
    if (ownedIds.has(l.id)) continue; // ya se borra entera
    batch.update(db.collection("leagues").doc(l.id), {
      memberUids: l.memberUids.filter((u) => u !== uid),
    });
  }
  await batch.commit();

  try {
    await getAdminAuth().deleteUser(uid);
  } catch {
    // La cuenta de Auth ya no existe: ignorar.
  }

  return {
    predictionsDeleted: preds.size,
    leaguesDeleted: owned.length,
    leaguesLeft: member.filter((l) => !ownedIds.has(l.id)).length,
  };
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
