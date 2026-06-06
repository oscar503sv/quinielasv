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

export default function PartidosPage() {
  const { matches, myPredictions, loading } = useData();
  const [filter, setFilter] = useState<Filter>("todo-pronosticar");

  const visible = useMemo(() => {
    return matches.filter((m: Match) => {
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
      ) : visible.length === 0 ? (
        <p style={{ color: "var(--text-dim)" }}>No hay partidos en esta categoría.</p>
      ) : (
        <div className="match-grid">
          {visible.map((m) => (
            <MatchCard key={m.id} match={m} myPrediction={myPredictions.get(m.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
