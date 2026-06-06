import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import {
  deleteMatchWithPredictions,
  updateMatch,
  writeAuditLog,
} from "@/repositories/admin.server";
import { matchPatchSchema } from "@/features/admin/schemas";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { id } = await params; // params es async en Next 16
  const parsed = matchPatchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await updateMatch(id, parsed.data);
  await writeAuditLog({
    action: "update_match",
    entityType: "match",
    entityId: id,
    performedBy: admin.uid,
    metadata: parsed.data,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { id } = await params;
  const res = await deleteMatchWithPredictions(id);
  await writeAuditLog({
    action: "delete_match",
    entityType: "match",
    entityId: id,
    performedBy: admin.uid,
    metadata: res,
  });
  return NextResponse.json({ ok: true, ...res });
}
