import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Proxy (antes "middleware", renombrado en Next 16). Defensa en profundidad:
// rechaza el acceso a /admin y /api/admin si NO viene la cookie de sesión, antes
// de tocar la ruta. La verificación real (firma de la cookie + allowlist de admins)
// sigue en requireAdmin()/getCurrentUser() dentro de cada handler: esto solo evita
// que una ruta admin nueva quede expuesta por olvido. No usa el Admin SDK (debe ser
// liviano y sin estado compartido, según la guía de Next).

// Mismo valor que SESSION_COOKIE en src/lib/auth/session.ts. Se inlinea para no
// arrastrar el módulo server-only (firebase-admin) al bundle del proxy.
const SESSION_COOKIE = "q26_session";

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE);
  if (hasSession) return NextResponse.next();

  const { pathname } = request.nextUrl;

  // Sin sesión: las rutas de API responden 401 JSON; las páginas redirigen al inicio.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
