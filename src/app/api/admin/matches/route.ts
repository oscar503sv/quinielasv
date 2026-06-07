import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { createMatch } from "@/repositories/admin.server";
import { writeAuditLog } from "@/repositories/admin.server";
import { matchInputSchema } from "@/features/admin/schemas";
import { rateLimit, clientIp, tooMany } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limit = rateLimit(`admin:${clientIp(request)}`, 60, 60_000);
  if (!limit.ok) return tooMany(limit.retryAfter);

  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const parsed = matchInputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const id = await createMatch(parsed.data);
  await writeAuditLog({
    action: "create_match",
    entityType: "match",
    entityId: id,
    performedBy: admin.uid,
    metadata: { home: parsed.data.home, away: parsed.data.away },
  });
  return NextResponse.json({ ok: true, id });
}
