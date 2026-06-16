import { getApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type MessagePayload,
  type Messaging,
} from "firebase/messaging";
import { deleteDoc, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./client";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
const SW_URL = "/firebase-messaging-sw.js";

async function getSupportedMessaging(): Promise<Messaging | null> {
  if (typeof window === "undefined") return null;
  if (!(await isSupported().catch(() => false))) return null;
  return getMessaging(getApp());
}

/** ¿El navegador soporta push (FCM + Notification API)? */
export async function isPushSupported(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  return isSupported().catch(() => false);
}

/** Estado actual del permiso de notificaciones, o null si no aplica. */
export function currentPermission(): NotificationPermission | null {
  if (typeof window === "undefined" || !("Notification" in window)) return null;
  return Notification.permission;
}

/**
 * Pide permiso, obtiene el token FCM y lo guarda en `users/{uid}/fcmTokens/{token}`.
 * Devuelve el token, o null si no es soportado o el usuario no concedió permiso.
 */
export async function requestPermissionAndToken(
  uid: string,
): Promise<string | null> {
  const messaging = await getSupportedMessaging();
  if (!messaging || !VAPID_KEY) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const registration = await navigator.serviceWorker.register(SW_URL);
  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration,
  });
  if (!token) return null;

  await setDoc(doc(db, "users", uid, "fcmTokens", token), {
    token,
    userAgent: navigator.userAgent,
    createdAt: serverTimestamp(),
  });
  return token;
}

/** Borra el token de este dispositivo de Firestore (al desactivar push). */
export async function removeToken(uid: string, token: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "fcmTokens", token));
}

/** Suscribe a mensajes en foreground (app abierta). Devuelve un unsubscribe. */
export async function onForegroundMessage(
  cb: (payload: MessagePayload) => void,
): Promise<() => void> {
  const messaging = await getSupportedMessaging();
  if (!messaging) return () => {};
  return onMessage(messaging, cb);
}
