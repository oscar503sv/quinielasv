import type { Team } from "@/types";

/**
 * 48 selecciones del Mundial 2026, agrupadas A–L (4 por grupo).
 * `code` es el ISO usado por flagcdn (Inglaterra = "gb-eng", Gales = "gb-wls",
 * Escocia = "gb-sct"). Los grupos son provisionales para el demo.
 */
export const TEAMS: Team[] = [
  // Grupo A
  { code: "mx", name: "México", group: "A" },
  { code: "ca", name: "Canadá", group: "A" },
  { code: "us", name: "Estados Unidos", group: "A" },
  { code: "pa", name: "Panamá", group: "A" },
  // Grupo B
  { code: "ar", name: "Argentina", group: "B" },
  { code: "sa", name: "Arabia Saudita", group: "B" },
  { code: "pl", name: "Polonia", group: "B" },
  { code: "au", name: "Australia", group: "B" },
  // Grupo C
  { code: "fr", name: "Francia", group: "C" },
  { code: "dk", name: "Dinamarca", group: "C" },
  { code: "tn", name: "Túnez", group: "C" },
  { code: "pe", name: "Perú", group: "C" },
  // Grupo D
  { code: "es", name: "España", group: "D" },
  { code: "cr", name: "Costa Rica", group: "D" },
  { code: "de", name: "Alemania", group: "D" },
  { code: "jp", name: "Japón", group: "D" },
  // Grupo E
  { code: "be", name: "Bélgica", group: "E" },
  { code: "ma", name: "Marruecos", group: "E" },
  { code: "hr", name: "Croacia", group: "E" },
  { code: "kr", name: "Corea del Sur", group: "E" },
  // Grupo F
  { code: "br", name: "Brasil", group: "F" },
  { code: "rs", name: "Serbia", group: "F" },
  { code: "ch", name: "Suiza", group: "F" },
  { code: "cm", name: "Camerún", group: "F" },
  // Grupo G
  { code: "gb-eng", name: "Inglaterra", group: "G" },
  { code: "ir", name: "Irán", group: "G" },
  { code: "gb-wls", name: "Gales", group: "G" },
  { code: "ec", name: "Ecuador", group: "G" },
  // Grupo H
  { code: "pt", name: "Portugal", group: "H" },
  { code: "gh", name: "Ghana", group: "H" },
  { code: "uy", name: "Uruguay", group: "H" },
  { code: "sn", name: "Senegal", group: "H" },
  // Grupo I
  { code: "nl", name: "Países Bajos", group: "I" },
  { code: "qa", name: "Catar", group: "I" },
  { code: "gb-sct", name: "Escocia", group: "I" },
  { code: "ci", name: "Costa de Marfil", group: "I" },
  // Grupo J
  { code: "co", name: "Colombia", group: "J" },
  { code: "ng", name: "Nigeria", group: "J" },
  { code: "no", name: "Noruega", group: "J" },
  { code: "dz", name: "Argelia", group: "J" },
  // Grupo K
  { code: "cl", name: "Chile", group: "K" },
  { code: "eg", name: "Egipto", group: "K" },
  { code: "se", name: "Suecia", group: "K" },
  { code: "at", name: "Austria", group: "K" },
  // Grupo L
  { code: "py", name: "Paraguay", group: "L" },
  { code: "ve", name: "Venezuela", group: "L" },
  { code: "ua", name: "Ucrania", group: "L" },
  { code: "it", name: "Italia", group: "L" },
];

/** Acceso directo por código. */
export const TEAM: Record<string, Team> = Object.fromEntries(
  TEAMS.map((t) => [t.code, t]),
);

export function teamName(code: string | null | undefined): string {
  if (!code) return "—";
  return TEAM[code]?.name ?? code.toUpperCase();
}
