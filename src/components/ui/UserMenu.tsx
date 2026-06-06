"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/features/auth/AuthProvider";
import { logout } from "@/features/auth/auth-client";
import { Avatar } from "./Avatar";

export function UserMenu() {
  const router = useRouter();
  const { profile, email, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic afuera o con Escape.
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

  async function handleLogout() {
    setOpen(false);
    await logout();
    router.replace("/");
    router.refresh();
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menú de usuario"
        style={{
          display: "inline-flex",
          padding: 0,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          borderRadius: "50%",
          boxShadow: open ? "0 0 0 2px var(--gold-border)" : "none",
        }}
      >
        <Avatar code={profile?.support ?? null} size={40} />
      </button>

      {open && (
        <div
          role="menu"
          className="card"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            minWidth: 200,
            padding: 6,
            zIndex: 40,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <div
            style={{
              padding: "8px 12px 10px",
              borderBottom: "1px solid var(--border)",
              marginBottom: 4,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>
              {profile?.name ?? "Jugador"}
            </div>
            <div
              style={{
                fontSize: "0.78rem",
                color: "var(--text-dim)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {email}
            </div>
          </div>

          <Link
            href="/perfil"
            role="menuitem"
            className="nav-link"
            style={{ display: "flex", alignItems: "center", gap: 9 }}
            onClick={() => setOpen(false)}
          >
            👤 Perfil
          </Link>
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              role="menuitem"
              className="nav-link"
              style={{ display: "flex", alignItems: "center", gap: 9, color: "var(--gold)" }}
              onClick={() => setOpen(false)}
            >
              🛠 Panel admin
            </Link>
          )}
          <button
            type="button"
            role="menuitem"
            className="nav-link"
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              textAlign: "left",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "var(--bad)",
            }}
          >
            🚪 Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
