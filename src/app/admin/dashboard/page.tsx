"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { StatTile } from "@/components/ui/StatTile";
import { Pill } from "@/components/ui/Pill";
import { useData } from "@/features/data/DataProvider";

const LINKS = [
  { href: "/admin/partidos", title: "Gestionar partidos", desc: "Crear y editar partidos del torneo.", icon: "📋" },
  { href: "/admin/resultados", title: "Registrar resultados", desc: "Cargar marcadores y finalizar partidos.", icon: "✅" },
  { href: "/admin/torneo", title: "Gestionar torneo", desc: "Estado, bloqueos y campeón oficial.", icon: "🏆" },
];

export default function AdminDashboardPage() {
  const { matches, tournament, users } = useData();

  const counts = useMemo(() => {
    return {
      total: matches.length,
      finished: matches.filter((m) => m.status === "finished").length,
      live: matches.filter((m) => m.status === "live").length,
      upcoming: matches.filter((m) => m.status === "upcoming" || m.status === "locked").length,
    };
  }, [matches]);

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
