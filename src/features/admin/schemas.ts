import { z } from "zod";
import { TBD } from "@/constants/teams";

const STAGE = z.enum([
  "group",
  "round_of_32",
  "round_of_16",
  "quarterfinal",
  "third_place",
  "semifinal",
  "final",
]);

const STATUS = z.enum(["upcoming", "live", "finished", "locked"]);

const score = z.number().int().min(0).max(20);

const matchFields = z.object({
  home: z.string().min(1),
  away: z.string().min(1),
  stage: STAGE,
  status: STATUS,
  date: z.string().min(1, "Ingresá fecha/hora"),
  lockAt: z.number().int().positive(),
});

export const matchInputSchema = matchFields.refine(
  // Permite "Por definir" en ambos (cruce de eliminatoria sin definir).
  (d) => d.home !== d.away || d.home === TBD,
  { message: "Los equipos deben ser distintos", path: ["away"] },
);

// `.partial()` sobre el objeto base (sin el refine, que Zod no permite partializar).
export const matchPatchSchema = matchFields.partial();

export const finalizeSchema = z.object({
  matchId: z.string().min(1),
  home: score,
  away: score,
  advances: z.string().min(1).nullable().optional(),
});

export const tournamentSchema = z.object({
  name: z.string().min(1).optional(),
  started: z.boolean().optional(),
  finished: z.boolean().optional(),
  predictionsLocked: z.boolean().optional(),
  champion: z.string().nullable().optional(),
  championLockAt: z.number().int().positive().nullable().optional(),
});

export type MatchFormValues = z.infer<typeof matchInputSchema>;
