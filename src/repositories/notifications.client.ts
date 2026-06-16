import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { AppNotification, NotificationType } from "@/types";

const MAX = 30;

function toNotification(id: string, data: Record<string, unknown>): AppNotification {
  const ts = data.createdAt as { toMillis?: () => number } | number | undefined;
  const createdAt =
    typeof ts === "number"
      ? ts
      : typeof ts?.toMillis === "function"
        ? ts.toMillis()
        : Date.now();
  return {
    id,
    type: (data.type as NotificationType) ?? "points",
    title: (data.title as string) ?? "",
    body: (data.body as string) ?? "",
    link: (data.link as string | null) ?? null,
    read: (data.read as boolean) ?? false,
    createdAt,
  };
}

export function subscribeNotifications(
  uid: string,
  cb: (items: AppNotification[]) => void,
): () => void {
  const q = query(
    collection(db, "users", uid, "notifications"),
    orderBy("createdAt", "desc"),
    limit(MAX),
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => toNotification(d.id, d.data())));
  });
}

export async function markNotificationRead(uid: string, id: string): Promise<void> {
  await updateDoc(doc(db, "users", uid, "notifications", id), { read: true });
}

export async function markAllNotificationsRead(
  uid: string,
  ids: string[],
): Promise<void> {
  if (ids.length === 0) return;
  const batch = writeBatch(db);
  for (const id of ids) {
    batch.update(doc(db, "users", uid, "notifications", id), { read: true });
  }
  await batch.commit();
}
