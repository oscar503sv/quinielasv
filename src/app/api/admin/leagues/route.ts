import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getAllLeagues } from "@/repositories/leagues.server";
import { rateLimit, clientIp, tooMany } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const limit = rateLimit(`admin:${clientIp(request)}`, 60, 60_000);
  if (!limit.ok) return tooMany(limit.retryAfter);

  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const leagues = await getAllLeagues();
  return NextResponse.json({ leagues });
}
