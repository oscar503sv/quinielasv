import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { League } from "@/types";

const COL = "leagues";

function toLeague(id: string, data: Record<string, unknown>): League {
  return {
    id,
    name: (data.name as string) ?? "",
    code: (data.code as string) ?? "",
    ownerUid: (data.ownerUid as string) ?? "",
    memberUids: (data.memberUids as string[]) ?? [],
    createdAt: (data.createdAt as number) ?? 0,
  };
}

/** Ligas en las que el usuario es miembro (suscripción en vivo). */
export function subscribeMyLeagues(
  uid: string,
  cb: (leagues: League[]) => void,
): () => void {
  const q = query(collection(db, COL), where("memberUids", "array-contains", uid));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => toLeague(d.id, d.data()));
    list.sort((a, b) => a.createdAt - b.createdAt);
    cb(list);
  });
}
