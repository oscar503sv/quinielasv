import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Tournament } from "@/types";

const COL = "tournament";
export const TOURNAMENT_DOC = "config";

const FALLBACK: Tournament = {
  name: "Quiniela Mundial 2026",
  started: false,
  finished: false,
  predictionsLocked: false,
  champion: null,
  championLockAt: null,
};

function toTournament(data: Record<string, unknown> | undefined): Tournament {
  if (!data) return FALLBACK;
  return {
    name: (data.name as string) ?? FALLBACK.name,
    started: Boolean(data.started),
    finished: Boolean(data.finished),
    predictionsLocked: Boolean(data.predictionsLocked),
    champion: (data.champion as string | null) ?? null,
    championLockAt: (data.championLockAt as number | null) ?? null,
  };
}

export async function getTournament(): Promise<Tournament> {
  const snap = await getDoc(doc(db, COL, TOURNAMENT_DOC));
  return toTournament(snap.exists() ? snap.data() : undefined);
}

export function subscribeTournament(cb: (t: Tournament) => void): () => void {
  return onSnapshot(doc(db, COL, TOURNAMENT_DOC), (snap) => {
    cb(toTournament(snap.exists() ? snap.data() : undefined));
  });
}
