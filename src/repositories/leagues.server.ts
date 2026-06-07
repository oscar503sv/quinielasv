import "server-only";

import { getAdminDb } from "@/lib/firebase/admin";
import type { League } from "@/types";

const COL = "leagues";

// Alfabeto sin caracteres ambiguos (sin 0/O/1/I/L).
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function leagueFromDoc(id: string, data: FirebaseFirestore.DocumentData): League {
  return {
    id,
    name: data.name ?? "",
    code: data.code ?? "",
    ownerUid: data.ownerUid ?? "",
    memberUids: (data.memberUids as string[]) ?? [],
    createdAt: data.createdAt ?? 0,
  };
}

export async function getLeagueById(id: string): Promise<League | null> {
  const snap = await getAdminDb().collection(COL).doc(id).get();
  return snap.exists ? leagueFromDoc(snap.id, snap.data()!) : null;
}

/** Todas las ligas (solo admin, vía Admin SDK), ordenadas por antigüedad. */
export async function getAllLeagues(): Promise<League[]> {
  const snap = await getAdminDb().collection(COL).get();
  return snap.docs
    .map((d) => leagueFromDoc(d.id, d.data()))
    .sort((a, b) => a.createdAt - b.createdAt);
}

/** Ligas que un usuario posee (es `ownerUid`). */
export async function getOwnedLeagues(uid: string): Promise<League[]> {
  const snap = await getAdminDb().collection(COL).where("ownerUid", "==", uid).get();
  return snap.docs.map((d) => leagueFromDoc(d.id, d.data()));
}

/** Ligas en las que un usuario figura como miembro. */
export async function getMemberLeagues(uid: string): Promise<League[]> {
  const snap = await getAdminDb()
    .collection(COL)
    .where("memberUids", "array-contains", uid)
    .get();
  return snap.docs.map((d) => leagueFromDoc(d.id, d.data()));
}

export async function getLeagueByCode(code: string): Promise<League | null> {
  const snap = await getAdminDb().collection(COL).where("code", "==", code).limit(1).get();
  const doc = snap.docs[0];
  return doc ? leagueFromDoc(doc.id, doc.data()) : null;
}

export async function countOwnedLeagues(uid: string): Promise<number> {
  const snap = await getAdminDb().collection(COL).where("ownerUid", "==", uid).get();
  return snap.size;
}

function randomCode(): string {
  let s = "";
  for (let i = 0; i < 5; i++) {
    s += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return `Q-${s}`;
}

/** Genera un código único (reintenta ante el raro caso de colisión). */
export async function generateUniqueCode(): Promise<string> {
  for (let i = 0; i < 8; i++) {
    const code = randomCode();
    const existing = await getLeagueByCode(code);
    if (!existing) return code;
  }
  throw new Error("No se pudo generar un código único.");
}

export async function createLeagueDoc(data: Omit<League, "id">): Promise<League> {
  const ref = await getAdminDb().collection(COL).add(data);
  return { id: ref.id, ...data };
}

export async function updateLeagueDoc(
  id: string,
  patch: Partial<Pick<League, "name" | "memberUids">>,
): Promise<void> {
  await getAdminDb().collection(COL).doc(id).update(patch);
}

export async function deleteLeagueDoc(id: string): Promise<void> {
  await getAdminDb().collection(COL).doc(id).delete();
}
