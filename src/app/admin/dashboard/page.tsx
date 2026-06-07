"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { StatTile } from "@/components/ui/StatTile";
import { Pill } from "@/components/ui/Pill";
import { useData } from "@/features/data/DataProvider";
import { useNow } from "@/lib/use-now";
import { TBD } from "@/constants/teams";

const LINKS = [
  { href: "/admin/partidos", title: "Gestionar partidos", desc: "Crear y editar partidos del torneo.", icon: "📋" },
  { href: "/admin/resultados", title: "Registrar resultados", desc: "Cargar marcadores y finalizar partidos.", icon: "✅" },
  { href: "/admin/jugadores", title: "Jugadores", desc: "Ver pronósticos y gestionar cuentas.", icon: "👥" },
  { href: "/admin/torneo", title: "Gestionar torneo", desc: "Estado, bloqueos y campeón oficial.", icon: "🏆" },
];

const KICKOFF_OFFSET_MS = 5 * 60 * 1000; // lockAt + 5min = inicio del partido

export default function AdminDashboardPage() {
  const { matches, predictions, tournament, users } = useData();
  const now = useNow();

  const counts = useMemo(() => {
    // Pendiente de finalizar: en vivo, o ya empezó (kickoff pasado) y sin finalizar.
    const pendingFinalize = matches.filter(
      (m) =>
        m.status !== "finished" &&
        (m.status === "live" || now >= m.lockAt + KICKOFF_OFFSET_MS),
    ).length;
    // Eliminatorias con cruce sin definir (algún equipo "Por definir").
    const undefinedKnockouts = matches.filter(
      (m) => m.stage !== "group" && (m.home === TBD || m.away === TBD),
    ).length;
    return {
      total: matches.length,
      finished: matches.filter((m) => m.status === "finished").length,
      live: matches.filter((m) => m.status === "live").length,
      upcoming: matches.filter((m) => m.status === "upcoming" || m.status === "locked").length,
      pendingFinalize,
      undefinedKnockouts,
    };
  }, [matches, now]);

  const engagement = useMemo(() => {
    const activeUids = new Set(predictions.map((p) => p.userId));
    const active = users.filter((u) => activeUids.has(u.id)).length;
    const rate = users.length > 0 ? Math.round((active / users.length) * 100) : 0;
    return { players: users.length, active, rate, predictions: predictions.length };
  }, [users, predictions]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <Pill tone="gold">ADMIN</Pill>
        <h1 style={{ fontSize: "1.9rem", margin: "8px 0 0" }}>Centro de control</h1>
        <p style={{ color: "var(--text-dim)", marginTop: 4 }}>
          {tournament?.name ?? "Quiniela Mundial 2026"} · {users.length} jugadores
        </p>
      </div>

      <div className="stat-grid-4">
        <StatTile label="Partidos totales" value={counts.total} accent />
        <StatTile label="Finalizados" value={counts.finished} />
        <StatTile label="En vivo" value={counts.live} />
        <StatTile label="Por jugar" value={counts.upcoming} />
      </div>

      <div className="stat-grid-4">
        <StatTile label="Jugadores" value={engagement.players} accent />
        <StatTile label="Activos" value={`${engagement.active} · ${engagement.rate}%`} />
        <StatTile label="Pronósticos" value={engagement.predictions} />
        <StatTile label="Sin finalizar" value={counts.pendingFinalize} />
      </div>

      {counts.undefinedKnockouts > 0 && (
        <p style={{ color: "var(--text-dim)", fontSize: "0.86rem" }}>
          ⚠️ {counts.undefinedKnockouts} partido(s) de eliminatoria con equipos “Por definir”.
        </p>
      )}

      <div className="stat-grid">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href}>
            <Card style={{ padding: 22, display: "flex", flexDirection: "column", gap: 8, height: "100%", cursor: "pointer" }}>
              <span style={{ fontSize: "1.8rem" }}>{l.icon}</span>
              <span className="display" style={{ fontSize: "1.15rem" }}>{l.title}</span>
              <span style={{ color: "var(--text-dim)", fontSize: "0.9rem" }}>{l.desc}</span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
