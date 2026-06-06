"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { StatTile } from "@/components/ui/StatTile";
import { Flag } from "@/components/ui/Flag";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/AuthProvider";
import { useData } from "@/features/data/DataProvider";
import { teamName } from "@/constants/teams";
import { canPredict } from "@/services/predictions.service";

export default function DashboardPage() {
  const { profile } = useAuth();
  const { matches, myPredictions, standings, myPosition, loading } = useData();

  const me = standings.find((s) => s.me);
  const pending = useMemo(
    () =>
      matches.filter((m) => canPredict(m) && !myPredictions.has(m.id)).length,
    [matches, myPredictions],
  );
  const upcoming = useMemo(
    () => matches.filter((m) => m.status === "upcoming" || m.status === "live").slice(0, 4),
    [matches],
  );
  const top5 = standings.slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <span className="eyebrow">Hola de nuevo</span>
        <h1 style={{ fontSize: "1.9rem", margin: "4px 0 0" }}>
          {profile?.name ?? "Familia Mundialista"} ⚽
        </h1>
        <p style={{ color: "var(--text-dim)", marginTop: 6 }}>
          {loading
            ? "Cargando tu quiniela…"
            : pending > 0
              ? `Tenés ${pending} pronóstico${pending === 1 ? "" : "s"} pendiente${pending === 1 ? "" : "s"} para hoy. ¡No te durmás!`
              : "¡Vas al día! 🎉"}
        </p>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <StatTile
          label="Tu posición"
          value={myPosition ? `#${myPosition}` : "—"}
          hint={`de ${standings.length} jugadores`}
        />
        <StatTile
          label="Puntos totales"
          value={me?.pts ?? 0}
          accent
          hint={`${me?.exact ?? 0} exactos · ${me?.trend ?? 0} tendencias`}
        />
        <Link href="/campeon">
          <Card
            style={{
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              height: "100%",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
              <span style={{ fontSize: "0.74rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-dim)" }}>
                Tu campeón 🏆
              </span>
              <span className="display" style={{ fontSize: "1.2rem" }}>
                {profile?.championPrediction ? teamName(profile.championPrediction) : "Elegí uno"}
              </span>
            </div>
            {profile?.championPrediction ? (
              <Flag code={profile.championPrediction} w={44} h={30} r={6} />
            ) : (
              <span style={{ fontSize: "1.6rem" }}>🏆</span>
            )}
          </Card>
        </Link>
      </div>

      <div className="section-grid">
        {/* Próximos partidos */}
        <Card style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Próximos partidos</h2>
            <Link href="/partidos" className="nav-link">Ver todos →</Link>
          </div>
          {upcoming.length === 0 ? (
            <p style={{ color: "var(--text-dim)" }}>No hay partidos próximos.</p>
          ) : (
            upcoming.map((m) => (
              <div
                key={m.id}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border)" }}
              >
                <Flag code={m.home} w={28} h={20} r={4} />
                <span style={{ fontWeight: 600 }}>{teamName(m.home)}</span>
                <span style={{ color: "var(--text-faint)" }}>vs</span>
                <span style={{ fontWeight: 600 }}>{teamName(m.away)}</span>
                <Flag code={m.away} w={28} h={20} r={4} />
                <span style={{ marginLeft: "auto", fontSize: "0.78rem", color: "var(--text-dim)" }}>
                  {m.status === "live" ? <Pill tone="bad" live>En vivo</Pill> : m.date}
                </span>
              </div>
            ))
          )}
          <Link href="/partidos">
            <Button variant="outline" block>Pronosticar</Button>
          </Link>
        </Card>

        {/* Ranking top 5 */}
        <Card style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Ranking</h2>
            <Link href="/ranking" className="nav-link">Completo →</Link>
          </div>
          {top5.length === 0 ? (
            <p style={{ color: "var(--text-dim)" }}>Sin jugadores aún.</p>
          ) : (
            top5.map((s, i) => (
              <div
                key={s.userId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "7px 10px",
                  borderRadius: 10,
                  background: s.me ? "var(--gold-soft)" : "transparent",
                }}
              >
                <span className="tabular" style={{ width: 22, color: "var(--text-dim)", fontWeight: 700 }}>
                  {i + 1}
                </span>
                <Flag code={s.support} w={24} h={17} r={4} />
                <span style={{ fontWeight: 600 }}>{s.name}</span>
                {s.me && <Pill tone="gold">tú</Pill>}
                {s.championBonus && <span title="Acertó el campeón · +10">🏆</span>}
                <span className="display tabular" style={{ marginLeft: "auto" }}>{s.pts}</span>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}
