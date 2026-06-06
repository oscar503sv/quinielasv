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
