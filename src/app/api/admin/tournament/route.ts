import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { updateTournament, writeAuditLog } from "@/repositories/admin.server";
import { tournamentSchema } from "@/features/admin/schemas";

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const parsed = tournamentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await updateTournament(parsed.data);
  await writeAuditLog({
    action: "update_tournament",
    entityType: "tournament",
    entityId: "config",
    performedBy: admin.uid,
    metadata: parsed.data,
  });
  return NextResponse.json({ ok: true });
}
