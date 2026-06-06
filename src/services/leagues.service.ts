import "server-only";

import {
  countOwnedLeagues,
  createLeagueDoc,
  deleteLeagueDoc,
  generateUniqueCode,
  getLeagueByCode,
  getLeagueById,
  updateLeagueDoc,
} from "@/repositories/leagues.server";
import { writeAuditLog } from "@/repositories/admin.server";
import type { League } from "@/types";

export class LeagueError extends Error {}

export const MAX_OWNED = 2;
export const MAX_MEMBERS = 50;

/** Normaliza y valida el nombre de una liga (2–30 chars, espacios colapsados). */
function cleanName(name: string): string {
  const n = name.trim().replace(/\s+/g, " ");
  if (n.length < 2 || n.length > 30) {
    throw new LeagueError("El nombre debe tener entre 2 y 30 caracteres.");
  }
  return n;
}

export async function createLeague(uid: string, name: string): Promise<League> {
  const clean = cleanName(name);
  const owned = await countOwnedLeagues(uid);
  if (owned >= MAX_OWNED) {
    throw new LeagueError(`Solo podés crear ${MAX_OWNED} ligas.`);
  }
  const code = await generateUniqueCode();
  const league = await createLeagueDoc({
    name: clean,
    code,
    ownerUid: uid,
    memberUids: [uid],
    createdAt: Date.now(),
  });
  await writeAuditLog({
    action: "create_league",
    entityType: "league",
    entityId: league.id,
    performedBy: uid,
    metadata: { name: clean, code },
  });
  return league;
}

export async function joinLeague(uid: string, code: string): Promise<League> {
  const normalized = code.trim().toUpperCase();
  const league = await getLeagueByCode(normalized);
  if (!league) throw new LeagueError("No existe una liga con ese código.");
  if (league.memberUids.includes(uid)) {
    throw new LeagueError("Ya sos parte de esta liga.");
  }
  if (league.memberUids.length >= MAX_MEMBERS) {
    throw new LeagueError("Esta liga ya está llena.");
  }
  await updateLeagueDoc(league.id, { memberUids: [...league.memberUids, uid] });
  return league;
}

export async function leaveLeague(uid: string, id: string): Promise<void> {
  const league = await getLeagueById(id);
  if (!league) throw new LeagueError("La liga no existe.");
  if (!league.memberUids.includes(uid)) {
    throw new LeagueError("No sos miembro de esta liga.");
  }
  if (league.ownerUid === uid) {
    throw new LeagueError("Sos el dueño: borrá la liga en vez de salir.");
  }
  await updateLeagueDoc(id, { memberUids: league.memberUids.filter((u) => u !== uid) });
}

export async function renameLeague(uid: string, id: string, name: string): Promise<void> {
  const clean = cleanName(name);
  const league = await getLeagueById(id);
  if (!league) throw new LeagueError("La liga no existe.");
  if (league.ownerUid !== uid) throw new LeagueError("Solo el dueño puede renombrarla.");
  await updateLeagueDoc(id, { name: clean });
}

export async function kickMember(uid: string, id: string, targetUid: string): Promise<void> {
  const league = await getLeagueById(id);
  if (!league) throw new LeagueError("La liga no existe.");
  if (league.ownerUid !== uid) throw new LeagueError("Solo el dueño puede expulsar.");
  if (targetUid === league.ownerUid) throw new LeagueError("No podés expulsarte a vos mismo.");
  if (!league.memberUids.includes(targetUid)) {
    throw new LeagueError("Ese jugador no está en la liga.");
  }
  await updateLeagueDoc(id, { memberUids: league.memberUids.filter((u) => u !== targetUid) });
}

export async function deleteLeague(uid: string, id: string): Promise<void> {
  const league = await getLeagueById(id);
  if (!league) throw new LeagueError("La liga no existe.");
  if (league.ownerUid !== uid) throw new LeagueError("Solo el dueño puede borrarla.");
  await deleteLeagueDoc(id);
  await writeAuditLog({
    action: "delete_league",
    entityType: "league",
    entityId: id,
    performedBy: uid,
  });
}
