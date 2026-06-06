"use client";

import { Card } from "@/components/ui/Card";
import { StatTile } from "@/components/ui/StatTile";
import { useData } from "@/features/data/DataProvider";

interface BreakdownRow {
  label: string;
  value: number;
  color: string;
}

function Bar({ label, value, total, color }: BreakdownRow & { total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem" }}>
        <span>{label}</span>
        <span className="tabular" style={{ color: "var(--text-dim)" }}>{value}</span>
      </div>
      <div style={{ height: 9, borderRadius: 999, background: "var(--surface-2)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 999, transition: "width .4s ease" }} />
      </div>
    </div>
  );
}

function Donut({ rate }: { rate: number }) {
  const R = 52;
  const C = 2 * Math.PI * R;
  const dash = (rate / 100) * C;
  return (
    <svg width={140} height={140} viewBox="0 0 140 140">
      <circle cx={70} cy={70} r={R} fill="none" stroke="var(--surface-2)" strokeWidth={14} />
      <circle
        cx={70}
        cy={70}
        r={R}
        fill="none"
        stroke="var(--gold)"
        strokeWidth={14}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${C - dash}`}
        transform="rotate(-90 70 70)"
      />
      <text x={70} y={70} textAnchor="middle" dominantBaseline="central" className="display" fill="var(--text)" fontSize={26}>
        {rate}%
      </text>
    </svg>
  );
}

export default function EstadisticasPage() {
  const { standings, myPosition, loading } = useData();
  const me = standings.find((s) => s.me);

  const exact = me?.exact ?? 0;
  const gd = me?.gd ?? 0;
  const trend = me?.trend ?? 0;
  const miss = me?.miss ?? 0;
  const played = me?.played ?? 0;
  const scoring = exact + gd + trend;
  const rate = played > 0 ? Math.round((scoring / played) * 100) : 0;

  const rows: BreakdownRow[] = [
    { label: "Exacto (5 pts)", value: exact, color: "var(--gold)" },
    { label: "Dif. exacta (3 pts)", value: gd, color: "var(--good)" },
    { label: "Tendencia (1 pt)", value: trend, color: "var(--blue)" },
    { label: "Fallo (0 pts)", value: miss, color: "var(--bad)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <h1 style={{ fontSize: "1.8rem", margin: 0 }}>Estadísticas</h1>

      {loading ? (
        <p style={{ color: "var(--text-dim)" }}>Cargando…</p>
      ) : (
        <>
          <div className="stat-grid-4">
            <StatTile label="Puntos totales" value={me?.pts ?? 0} accent />
            <StatTile label="Marcadores exactos" value={exact} />
            <StatTile label="Tendencias" value={trend} />
            <StatTile label="Posición actual" value={myPosition ? `#${myPosition}` : "—"} />
          </div>

          <div className="section-grid">
            <Card style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
              <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Desglose de aciertos</h2>
              {rows.map((r) => (
                <Bar key={r.label} {...r} total={played} />
              ))}
            </Card>

            <Card style={{ padding: 22, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <h2 style={{ fontSize: "1.1rem", margin: 0, alignSelf: "flex-start" }}>Tasa de acierto</h2>
              <Donut rate={rate} />
              <span style={{ color: "var(--text-dim)", fontSize: "0.86rem", textAlign: "center" }}>
                {scoring} de {played} pronósticos sumaron puntos.
              </span>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
