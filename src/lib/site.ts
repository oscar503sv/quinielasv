/** Constantes del sitio para SEO/metadata. El dominio es configurable por env. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://quinielasv.xyz"
).replace(/\/$/, "");

export const SITE_NAME = "Quiniela Mundial 2026";

export const SITE_DESCRIPTION =
  "Pronosticá los partidos del Mundial FIFA 2026 y picate con tus amigos y familia. " +
  "Sumá puntos, creá tu liga privada y subí en el ranking.";
