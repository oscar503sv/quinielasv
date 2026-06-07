import { NextResponse } from "next/server";
import { requireAdmin, isAdminEmail } from "@/lib/auth/session";
import { getAdminAuth } from "@/lib/firebase/admin";
import { deleteUserCascade, writeAuditLog } from "@/repositories/admin.server";
import { rateLimit, clientIp, tooMany } from "@/lib/rate-limit";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const limit = rateLimit(`admin:${clientIp(request)}`, 60, 60_000);
  if (!limit.ok) return tooMany(limit.retryAfter);

  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { id } = await params;

  if (id === admin.uid) {
    return NextResponse.json({ error: "No podés eliminar tu propia cuenta." }, { status: 400 });
  }

  // No permitir borrar a otro admin (su email está en la allowlist).
  try {
    const target = await getAdminAuth().getUser(id);
    if (isAdminEmail(target.email)) {
      return NextResponse.json(
        { error: "No se puede eliminar a un administrador." },
        { status: 400 },
      );
    }
  } catch {
    // La cuenta de Auth ya no existe; seguimos para limpiar Firestore igual.
  }

  const res = await deleteUserCascade(id);
  await writeAuditLog({
    action: "delete_user",
    entityType: "user",
    entityId: id,
    performedBy: admin.uid,
    metadata: res,
  });
  return NextResponse.json({ ok: true, ...res });
}
