import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { createLeague, LeagueError } from "@/services/leagues.service";

const schema = z.object({ name: z.string().min(1) });

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  try {
    const league = await createLeague(user.uid, parsed.data.name);
    return NextResponse.json({ ok: true, id: league.id, code: league.code });
  } catch (err) {
    if (err instanceof LeagueError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    return NextResponse.json({ error: "No se pudo crear la liga" }, { status: 500 });
  }
}
