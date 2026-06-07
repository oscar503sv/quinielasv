import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { AuthCard } from "@/features/auth/AuthCard";
import { Flag } from "@/components/ui/Flag";
import { Pill } from "@/components/ui/Pill";
import { flagUrl } from "@/lib/utils";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: "es-SV",
  description: SITE_DESCRIPTION,
};

const HERO_FLAGS = [
  "ar", "br", "fr", "gb-eng", "es", "de", "pt", "nl", "mx", "us", "uy", "co",
];

export default async function LandingPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="app-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <main
        className="shell landing-grid"
        style={{ alignItems: "center", minHeight: "100vh" }}
      >
        {/* Hero */}
        <section className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Image
              src="/quinielasv-logo.png"
              alt="Quiniela Mundial 2026"
              width={72}
              height={72}
              priority
              style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,.35))" }}
            />
            <span className="display" style={{ fontSize: "1.5rem", fontWeight: 800 }}>
              Quiniela <span style={{ color: "var(--gold)" }}>2026</span>
            </span>
          </div>
          <span className="eyebrow">Para jugar en familia y con amigos</span>
          <h1 style={{ fontSize: "2.7rem", lineHeight: 1.05, margin: 0 }}>
            Pronosticá el Mundial. Picate con los tuyos. 🌎⚽
          </h1>
          <p style={{ color: "var(--text-dim)", fontSize: "1.05rem", maxWidth: 480 }}>
            Cargá tus marcadores, sumá puntos por fase, elegí tu campeón y subí en
            el ranking del grupo. No te durmás: los pronósticos cierran antes de
            cada partido.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {HERO_FLAGS.map((code) => (
              <Flag key={code} code={code} w={38} h={26} r={6} />
            ))}
            <Pill tone="gold">+48 selecciones</Pill>
          </div>
        </section>

        {/* Auth */}
        <section
          className="fade-up"
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}
        >
          <AuthCard />
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.82rem", color: "var(--text-dim)" }}>
            <span>Hecho desde</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={flagUrl("sv")}
              alt="El Salvador"
              width={20}
              height={14}
              style={{ borderRadius: 3, objectFit: "cover", boxShadow: "0 0 0 1px var(--border)" }}
            />
            <strong style={{ color: "var(--gold)" }}>2026</strong>
          </span>
        </section>
      </main>
    </div>
  );
}
