"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useNotifications } from "@/features/notifications/NotificationsProvider";
import type { AppNotification, NotificationType } from "@/types";

const ICON: Record<NotificationType, string> = {
  reminder30: "⏰",
  champion: "🏆",
  points: "🎯",
  newmatch: "🆕",
  leader: "👑",
};

function timeAgo(ms: number): string {
  const s = Math.max(0, Math.round((Date.now() - ms) / 1000));
  if (s < 60) return "ahora";
  const m = Math.round(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  return `hace ${d} d`;
}

export function NotificationBell() {
  const router = useRouter();
  const { notifications, unreadCount, push, enablePush, markRead, markAllRead } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const [enabling, setEnabling] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function handleClickItem(n: AppNotification) {
    if (!n.read) markRead(n.id);
    if (n.link) {
      setOpen(false);
      router.push(n.link);
    }
  }

  async function handleEnable() {
    setEnabling(true);
    await enablePush();
    setEnabling(false);
  }

  const showEnableCta = push !== "granted" && push !== "unsupported" && push !== "loading";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        className="icon-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Notificaciones${unreadCount ? ` (${unreadCount} sin leer)` : ""}`}
        style={{ position: "relative" }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            aria-hidden
            style={{
              position: "absolute",
              top: -5,
              right: -5,
              minWidth: 18,
              height: 18,
              padding: "0 5px",
              borderRadius: 999,
              background: "var(--bad)",
              color: "#fff",
              fontSize: "0.66rem",
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid var(--bg-solid)",
              lineHeight: 1,
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="card"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            width: 320,
            maxWidth: "calc(100vw - 32px)",
            padding: 6,
            zIndex: 40,
            display: "flex",
            flexDirection: "column",
            background: "var(--bg-solid)",
            boxShadow: "0 20px 50px -16px rgba(0,0,0,.55)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 10px 10px",
              borderBottom: "1px solid var(--border)",
              marginBottom: 4,
            }}
          >
            <span style={{ fontWeight: 700, fontSize: "0.92rem" }}>Notificaciones</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "var(--gold)",
                  cursor: "pointer",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                }}
              >
                Marcar todas
              </button>
            )}
          </div>

          {showEnableCta && (
            <button
              type="button"
              onClick={handleEnable}
              disabled={enabling}
              className="nav-link"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                textAlign: "left",
                border: "1px solid var(--gold-border)",
                background: "var(--gold-soft)",
                color: "var(--gold)",
                cursor: "pointer",
                margin: "0 2px 6px",
              }}
            >
              {enabling ? "Activando…" : "🔔 Activar notificaciones push"}
            </button>
          )}

          <div style={{ maxHeight: 360, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
            {notifications.length === 0 ? (
              <p style={{ color: "var(--text-dim)", fontSize: "0.86rem", padding: "16px 10px", textAlign: "center" }}>
                No tenés notificaciones todavía.
              </p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  role="menuitem"
                  onClick={() => handleClickItem(n)}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    textAlign: "left",
                    width: "100%",
                    padding: "9px 10px",
                    border: "none",
                    borderRadius: 9,
                    cursor: "pointer",
                    background: n.read ? "transparent" : "var(--surface-2)",
                  }}
                >
                  <span style={{ fontSize: "1.1rem", lineHeight: 1.2 }}>{ICON[n.type] ?? "🔔"}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontWeight: 600, fontSize: "0.86rem" }}>{n.title}</span>
                    <span style={{ display: "block", fontSize: "0.8rem", color: "var(--text-dim)" }}>{n.body}</span>
                    <span style={{ display: "block", fontSize: "0.72rem", color: "var(--text-faint)", marginTop: 2 }}>
                      {timeAgo(n.createdAt)}
                    </span>
                  </span>
                  {!n.read && (
                    <span
                      aria-hidden
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "var(--gold)",
                        flexShrink: 0,
                        marginTop: 6,
                      }}
                    />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
