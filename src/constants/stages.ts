import type { MatchStage, Stage } from "@/types";

/** Fases y sus multiplicadores de puntos (spec §3 / PRD). */
export const STAGES: Record<MatchStage, Stage> = {
  group: { label: "Fase de grupos", mult: 1 },
  round_of_32: { label: "Dieciseisavos", mult: 2 },
  round_of_16: { label: "Octavos", mult: 2 },
  quarterfinal: { label: "Cuartos", mult: 2 },
  third_place: { label: "Tercer lugar", mult: 3 },
  semifinal: { label: "Semifinal", mult: 3 },
  final: { label: "Final", mult: 3 },
};

export const STAGE_ORDER: MatchStage[] = [
  "group",
  "round_of_32",
  "round_of_16",
  "quarterfinal",
  "third_place",
  "semifinal",
  "final",
];
