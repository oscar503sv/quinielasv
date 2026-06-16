"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/features/auth/AuthProvider";
import {
  markAllNotificationsRead,
  markNotificationRead,
  subscribeNotifications,
} from "@/repositories/notifications.client";
import {
  currentPermission,
  isPushSupported,
  requestPermissionAndToken,
} from "@/lib/firebase/messaging";
import type { AppNotification } from "@/types";

type PushState = NotificationPermission | "unsupported" | "loading";

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  push: PushState;
  enablePush: () => Promise<boolean>;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { uid } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [push, setPush] = useState<PushState>("loading");

  // Suscripción a la campana del usuario.
  useEffect(() => {
    if (!uid) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNotifications([]);
      return;
    }
    return subscribeNotifications(uid, setNotifications);
  }, [uid]);

  // Estado inicial del permiso; si ya está concedido, refrescamos el token
  // silenciosamente (los tokens FCM rotan).
  useEffect(() => {
    let active = true;
    (async () => {
      if (!(await isPushSupported())) {
        if (active) setPush("unsupported");
        return;
      }
      const perm = currentPermission() ?? "default";
      if (active) setPush(perm);
      if (perm === "granted" && uid) {
        await requestPermissionAndToken(uid).catch(() => {});
      }
    })();
    return () => {
      active = false;
    };
  }, [uid]);

  const enablePush = useCallback(async (): Promise<boolean> => {
    if (!uid) return false;
    const token = await requestPermissionAndToken(uid).catch(() => null);
    setPush(currentPermission() ?? "default");
    return Boolean(token);
  }, [uid]);

  const markRead = useCallback(
    (id: string) => {
      if (uid) markNotificationRead(uid, id).catch(() => {});
    },
    [uid],
  );

  const markAllRead = useCallback(() => {
    if (!uid) return;
    const unread = notifications.filter((n) => !n.read).map((n) => n.id);
    markAllNotificationsRead(uid, unread).catch(() => {});
  }, [uid, notifications]);

  const unreadCount = useMemo(
    () => notifications.reduce((acc, n) => acc + (n.read ? 0 : 1), 0),
    [notifications],
  );

  const value = useMemo(
    () => ({ notifications, unreadCount, push, enablePush, markRead, markAllRead }),
    [notifications, unreadCount, push, enablePush, markRead, markAllRead],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications debe usarse dentro de NotificationsProvider");
  return ctx;
}
