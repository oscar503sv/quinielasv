import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { adminRenameLeague, adminDeleteLeague, LeagueError } from "@/services/leagues.service";
import { rateLimit, clientIp, tooMany } from "@/lib/rate-limit";

const renameSchema = z.object({ name: z.string().min(1) });

function fail(err: unknown, fallback: string) {
  if (err instanceof LeagueError) {
    return NextResponse.json({ error: err.message }, { status: 409 });
  }
  return NextResponse.json({ error: fallback }, { status: 500 });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const limit = rateLimit(`admin:${clientIp(request)}`, 60, 60_000);
  if (!limit.ok) return tooMany(limit.retryAfter);

  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { id } = await params;
  const parsed = renameSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  try {
    await adminRenameLeague(id, parsed.data.name, admin.uid);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return fail(err, "No se pudo renombrar la liga");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const limit = rateLimit(`admin:${clientIp(request)}`, 60, 60_000);
  if (!limit.ok) return tooMany(limit.retryAfter);

  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { id } = await params;
  try {
    await adminDeleteLeague(id, admin.uid);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return fail(err, "No se pudo borrar la liga");
  }
}
