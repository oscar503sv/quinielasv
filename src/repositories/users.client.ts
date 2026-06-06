import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { User } from "@/types";

const COL = "users";

function toUser(id: string, data: Record<string, unknown>): User {
  return {
    id,
    name: (data.name as string) ?? "Jugador",
    email: (data.email as string) ?? "",
    support: (data.support as string | null) ?? null,
    championPrediction: (data.championPrediction as string | null) ?? null,
  };
}

/** Crea el doc de usuario si no existe (primer login). */
export async function ensureUserDoc(
  uid: string,
  defaults: { name: string; email: string },
): Promise<User> {
  const ref = doc(db, COL, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const data = {
      name: defaults.name,
      email: defaults.email,
      support: null,
      championPrediction: null,
    };
    await setDoc(ref, data);
    return toUser(uid, data);
  }
  return toUser(uid, snap.data());
}

export function subscribeUser(
  uid: string,
  cb: (user: User | null) => void,
): () => void {
  return onSnapshot(doc(db, COL, uid), (snap) => {
    cb(snap.exists() ? toUser(uid, snap.data()) : null);
  });
}

export async function getAllUsers(): Promise<User[]> {
  const snap = await getDocs(collection(db, COL));
  return snap.docs.map((d) => toUser(d.id, d.data()));
}

export function subscribeAllUsers(cb: (users: User[]) => void): () => void {
  return onSnapshot(collection(db, COL), (snap) => {
    cb(snap.docs.map((d) => toUser(d.id, d.data())));
  });
}

export async function updateUserDoc(
  uid: string,
  patch: Partial<Pick<User, "name" | "support" | "championPrediction">>,
): Promise<void> {
  await updateDoc(doc(db, COL, uid), patch);
}
