import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Prediction } from "@/types";

const COL = "predictions";

function predId(userId: string, matchId: string): string {
  return `${userId}_${matchId}`;
}

function toPrediction(id: string, data: Record<string, unknown>): Prediction {
  return {
    id,
    userId: data.userId as string,
    matchId: data.matchId as string,
    home: data.home as number,
    away: data.away as number,
    advances: (data.advances as string | null) ?? null,
    updatedAt: (data.updatedAt as number) ?? 0,
  };
}

/** Pronósticos del usuario actual (suscripción en vivo). */
export function subscribeUserPredictions(
  userId: string,
  cb: (preds: Prediction[]) => void,
): () => void {
  const q = query(collection(db, COL), where("userId", "==", userId));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => toPrediction(d.id, d.data())));
  });
}

/** Todos los pronósticos (para calcular ranking/estadísticas). */
export async function getAllPredictions(): Promise<Prediction[]> {
  const snap = await getDocs(collection(db, COL));
  return snap.docs.map((d) => toPrediction(d.id, d.data()));
}

/** Suscripción en vivo a todos los pronósticos. */
export function subscribeAllPredictions(
  cb: (preds: Prediction[]) => void,
): () => void {
  return onSnapshot(collection(db, COL), (snap) => {
    cb(snap.docs.map((d) => toPrediction(d.id, d.data())));
  });
}

/** Crea o actualiza el pronóstico del usuario para un partido. */
export async function upsertPrediction(
  userId: string,
  matchId: string,
  score: { home: number; away: number; advances: string | null },
): Promise<void> {
  const id = predId(userId, matchId);
  await setDoc(doc(db, COL, id), {
    userId,
    matchId,
    home: score.home,
    away: score.away,
    advances: score.advances,
    updatedAt: Date.now(),
  });
}
