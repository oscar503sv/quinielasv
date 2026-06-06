import { collection, getDocs, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Match, MatchStage, MatchStatus, Score } from "@/types";

const COL = "matches";

function toMatch(id: string, data: Record<string, unknown>): Match {
  const result = data.result as { home: number; away: number } | null | undefined;
  return {
    id,
    home: data.home as string,
    away: data.away as string,
    stage: data.stage as MatchStage,
    status: data.status as MatchStatus,
    date: (data.date as string) ?? "",
    lockAt: (data.lockAt as number) ?? 0,
    result: result ? ({ home: result.home, away: result.away } as Score) : null,
  };
}

export async function getMatches(): Promise<Match[]> {
  const q = query(collection(db, COL), orderBy("lockAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => toMatch(d.id, d.data()));
}

export function subscribeMatches(cb: (matches: Match[]) => void): () => void {
  const q = query(collection(db, COL), orderBy("lockAt", "asc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => toMatch(d.id, d.data())));
  });
}
