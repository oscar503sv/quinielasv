import "server-only";

import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebase/admin";
import type { SessionUser } from "@/types";

export const SESSION_COOKIE = "q26_session";
/** 14 días en segundos (límite de createSessionCookie). */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 14;

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}

/**
 * Resuelve el usuario autenticado a partir de la session cookie.
 * Devuelve null si no hay sesión o la cookie es inválida.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const cookie = store.get(SESSION_COOKIE)?.value;
  if (!cookie) return null;

  try {
    const decoded = await getAdminAuth().verifySessionCookie(cookie, true);
    const email = decoded.email ?? "";
    return {
      uid: decoded.uid,
      email,
      name: decoded.name ?? email.split("@")[0] ?? "Jugador",
      isAdmin: isAdminEmail(email),
    };
  } catch {
    return null;
  }
}

/** Devuelve el usuario sólo si es admin; null en cualquier otro caso. */
export async function requireAdmin(): Promise<SessionUser | null> {
  const user = await getCurrentUser();
  return user?.isAdmin ? user : null;
}
