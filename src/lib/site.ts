/**
 * Constantes del sitio para SEO/metadata. El dominio es configurable por env.
 * Default con `www`: es el host que sirve directo (el dominio pelado redirige a
 * www con 308, y WhatsApp no sigue redirects para og:image).
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.quinielasv.xyz"
).replace(/\/$/, "");

export const SITE_NAME = "Quiniela Mundial 2026";

export const SITE_DESCRIPTION =
  "Pronosticá los partidos del Mundial FIFA 2026 y picate con tus amigos y familia. " +
  "Sumá puntos, creá tu liga privada y subí en el ranking.";
