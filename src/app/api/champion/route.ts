import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { setChampion, ChampionError } from "@/services/champion.service";
import { rateLimit, clientIp, tooMany } from "@/lib/rate-limit";

const schema = z.object({ champion: z.string().min(1) });

export async function POST(request: Request) {
  const limit = rateLimit(`champion:${clientIp(request)}`, 30, 60_000);
  if (!limit.ok) return tooMany(limit.retryAfter);

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  try {
    await setChampion(user.uid, parsed.data.champion);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ChampionError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    return NextResponse.json(
      { error: "No se pudo guardar tu campeón" },
      { status: 500 },
    );
  }
}
