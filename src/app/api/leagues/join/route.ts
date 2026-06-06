import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { joinLeague, LeagueError } from "@/services/leagues.service";

const schema = z.object({ code: z.string().min(1) });

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  try {
    const league = await joinLeague(user.uid, parsed.data.code);
    return NextResponse.json({ ok: true, id: league.id, name: league.name });
  } catch (err) {
    if (err instanceof LeagueError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    return NextResponse.json({ error: "No se pudo unir a la liga" }, { status: 500 });
  }
}
