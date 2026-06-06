import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { finalizeMatch, AdminError } from "@/services/admin.service";
import { finalizeSchema } from "@/features/admin/schemas";

export async function POST(request: Request) {
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
    const { matchId, home, away, advances } = parsed.data;
    const res = await finalizeMatch(matchId, { home, away }, admin.uid, advances ?? null);
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
