import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import {
  deleteLeague,
  kickMember,
  leaveLeague,
  renameLeague,
  LeagueError,
} from "@/services/leagues.service";

const renameSchema = z.object({ name: z.string().min(1) });
const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("leave") }),
  z.object({ action: z.literal("kick"), targetUid: z.string().min(1) }),
]);

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
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const parsed = renameSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  try {
    await renameLeague(user.uid, id, parsed.data.name);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return fail(err, "No se pudo renombrar la liga");
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const parsed = actionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  try {
    if (parsed.data.action === "leave") {
      await leaveLeague(user.uid, id);
    } else {
      await kickMember(user.uid, id, parsed.data.targetUid);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return fail(err, "No se pudo completar la acción");
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  try {
    await deleteLeague(user.uid, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return fail(err, "No se pudo borrar la liga");
  }
}
