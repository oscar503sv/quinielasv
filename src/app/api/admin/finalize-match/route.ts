import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { finalizeMatch, AdminError } from "@/services/admin.service";
import { finalizeSchema } from "@/features/admin/schemas";
import { rateLimit, clientIp, tooMany } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limit = rateLimit(`admin:${clientIp(request)}`, 60, 60_000);
  if (!limit.ok) return tooMany(limit.retryAfter);

  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const parsed = finalizeSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const { matchId, home, away, advances, correction } = parsed.data;
    const res = await finalizeMatch(
      matchId,
      { home, away },
      admin.uid,
      advances ?? null,
      correction ?? false,
    );
    return NextResponse.json({ ok: true, ...res });
  } catch (err) {
    if (err instanceof AdminError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    return NextResponse.json(
      { error: "No se pudo finalizar el partido" },
      { status: 500 },
    );
  }
}
