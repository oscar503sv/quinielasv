"use client";

import { useMemo, useState } from "react";
import { useData } from "@/features/data/DataProvider";
import { MatchCard } from "@/features/matches/MatchCard";
import type { Match } from "@/types";

type Filter = "todo-pronosticar" | "vivo" | "finalizados" | "todos";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "todo-pronosticar", label: "Por pronosticar" },
  { key: "vivo", label: "En vivo" },
  { key: "finalizados", label: "Finalizados" },
  { key: "todos", label: "Todos" },
];

// Los pronósticos cierran 5 min antes del inicio; reconstruimos el kickoff.
const KICKOFF_OFFSET_MS = 5 * 60 * 1000;

const startOfDay = (ms: number) => {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

function dayKey(m: Match): string {
  if (m.status === "locked") return "tbd";
  const d = new Date(m.lockAt + KICKOFF_OFFSET_MS);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayLabel(m: Match, now = Date.now()): string {
  if (m.status === "locked") return "Por definir";
  const ms = m.lockAt + KICKOFF_OFFSET_MS;
  const diff = Math.round((startOfDay(ms) - startOfDay(now)) / 86_400_000);
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Mañana";
  if (diff === -1) return "Ayer";
  const text = new Intl.DateTimeFormat("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(ms));
  return text.charAt(0).toUpperCase() + text.slice(1);
}

interface DayGroup {
  key: string;
  label: string;
  matches: Match[];
}

/** Agrupa por día preservando el orden cronológico; "Por definir" al final. */
function groupByDay(list: Match[]): DayGroup[] {
  const groups: DayGroup[] = [];
  const byKey = new Map<string, DayGroup>();
  for (const m of list) {
    const key = dayKey(m);
    let g = byKey.get(key);
    if (!g) {
      g = { key, label: dayLabel(m), matches: [] };
      byKey.set(key, g);
      groups.push(g);
    }
    g.matches.push(m);
  }
  return groups.sort((a, b) => {
    if (a.key === "tbd") return 1;
    if (b.key === "tbd") return -1;
    return 0;
  });
}

export default function PartidosPage() {
  const { matches, myPredictions, loading } = useData();
  const [filter, setFilter] = useState<Filter>("todo-pronosticar");

  const groups = useMemo(() => {
    const visible = matches.filter((m: Match) => {
      switch (filter) {
        case "todo-pronosticar":
          return m.status === "upcoming";
        case "vivo":
          return m.status === "live";
        case "finalizados":
          return m.status === "finished";
        default:
          return true;
      }
    });
    return groupByDay(visible);
  }, [matches, filter]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: "1.8rem", margin: 0 }}>Partidos</h1>
        <p style={{ color: "var(--text-dim)", marginTop: 4 }}>
          Ajustá tu marcador con + / − y guardá antes del cierre.
        </p>
      </div>

      <div className="tabs">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className="tab"
            data-active={filter === f.key}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "var(--text-dim)" }}>Cargando partidos…</p>
      ) : groups.length === 0 ? (
        <p style={{ color: "var(--text-dim)" }}>No hay partidos en esta categoría.</p>
      ) : (
        groups.map((g) => (
          <section key={g.key} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                paddingBottom: 6,
                borderBottom: "1px solid var(--border)",
              }}
            >
              <h2 style={{ fontSize: "1.05rem", margin: 0 }}>{g.label}</h2>
              <span style={{ fontSize: "0.82rem", color: "var(--text-dim)" }}>
                {g.matches.length} {g.matches.length === 1 ? "partido" : "partidos"}
              </span>
            </div>
            <div className="match-grid">
              {g.matches.map((m) => (
                <MatchCard key={m.id} match={m} myPrediction={myPredictions.get(m.id)} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
