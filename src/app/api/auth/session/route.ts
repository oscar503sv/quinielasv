import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "@/lib/auth/session";

/** Crea la session cookie a partir del idToken del Client SDK. */
export async function POST(request: Request) {
  const { idToken } = (await request.json()) as { idToken?: string };
  if (!idToken) {
    return NextResponse.json({ error: "Falta idToken" }, { status: 400 });
  }

  try {
    const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE * 1000,
    });
    const store = await cookies();
    store.set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "No se pudo crear la sesión" },
      { status: 401 },
    );
  }
}

/** Cierra sesión limpiando la cookie. */
export async function DELETE() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
