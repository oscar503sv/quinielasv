import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

export type NotificationType =
  | "reminder30"
  | "champion"
  | "points"
  | "newmatch"
  | "leader";

export interface NotificationInput {
  /** Id determinista del doc → idempotencia (no se reenvía si ya existe). */
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string | null;
}

/** Mapa código de equipo → nombre, para mensajes legibles. */
export async function loadTeams(): Promise<Record<string, string>> {
  const db = getFirestore();
  const snap = await db.collection("teams").get();
  const map: Record<string, string> = {};
  for (const d of snap.docs) {
    map[d.id] = (d.data().name as string) ?? d.id;
  }
  return map;
}

/** Códigos de error de FCM que indican un token muerto que hay que borrar. */
const DEAD_TOKEN_CODES = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
  "messaging/invalid-argument",
]);

async function sendPush(uid: string, n: NotificationInput): Promise<void> {
  const db = getFirestore();
  const tokensSnap = await db
    .collection("users")
    .doc(uid)
    .collection("fcmTokens")
    .get();
  const tokens = tokensSnap.docs.map((d) => d.id);
  if (tokens.length === 0) return;

  const res = await getMessaging().sendEachForMulticast({
    tokens,
    // Data-only: el service worker arma la notificación (sin duplicados).
    data: {
      title: n.title,
      body: n.body,
      link: n.link ?? "/dashboard",
      tag: n.id,
    },
    webpush: { fcmOptions: { link: n.link ?? "/dashboard" } },
  });

  const cleanups: Promise<unknown>[] = [];
  res.responses.forEach((r, i) => {
    if (!r.success && r.error && DEAD_TOKEN_CODES.has(r.error.code)) {
      cleanups.push(tokensSnap.docs[i].ref.delete());
    }
  });
  await Promise.all(cleanups);
}

/**
 * Crea la notificación in-app (id determinista → idempotente) y, si es nueva,
 * envía el push a los dispositivos del usuario. Si el doc ya existía, no hace
 * nada (evita duplicados entre corridas del cron o reintentos).
 */
export async function sendNotification(
  uid: string,
  n: NotificationInput,
): Promise<void> {
  const db = getFirestore();
  const ref = db
    .collection("users")
    .doc(uid)
    .collection("notifications")
    .doc(n.id);
  try {
    await ref.create({
      type: n.type,
      title: n.title,
      body: n.body,
      link: n.link ?? null,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (e: unknown) {
    // code 6 = ALREADY_EXISTS → ya se envió, no duplicar.
    if ((e as { code?: number }).code === 6) return;
    throw e;
  }
  await sendPush(uid, n);
}
