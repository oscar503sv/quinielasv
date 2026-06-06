import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Vistas privadas (tras login). Igual redirigen, esto es defensa explícita.
      disallow: [
        "/dashboard",
        "/partidos",
        "/ranking",
        "/estadisticas",
        "/perfil",
        "/equipo",
        "/campeon",
        "/reglas",
        "/admin",
        "/api",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
