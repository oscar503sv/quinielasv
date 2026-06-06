"use client";

import { Card } from "@/components/ui/Card";
import { Flag } from "@/components/ui/Flag";
import { Pill } from "@/components/ui/Pill";
import { useData } from "@/features/data/DataProvider";
import type { Standing } from "@/types";

const MEDALS = ["🥇", "🥈", "🥉"];
const PODIUM_ORDER = [1, 0, 2]; // visual 2-1-3
const PODIUM_HEIGHT = [96, 130, 76];

function PodiumSpot({ s, place }: { s: Standing; place: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1 }}>
      <Flag code={s.support} w={48} h={34} r={7} />
      <span style={{ fontWeight: 700, fontSize: "0.9rem", textAlign: "center" }}>
        {s.name} {s.championBonus && <span title="Acertó el campeón · +10">🏆</span>}
      </span>
      <span className="display tabular" style={{ color: "var(--gold)" }}>{s.pts}</span>
      <div
        className="card"
        style={{
          width: "100%",
          height: PODIUM_HEIGHT[place],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.8rem",
          background: place === 1 ? "var(--gold-soft)" : "var(--surface)",
          borderColor: place === 1 ? "var(--gold-border)" : "var(--border)",
        }}
      >
        {MEDALS[place]}
      </div>
    </div>
  );
}

export default function RankingPage() {
  const { standings, tournament, loading } = useData();
  const podium = PODIUM_ORDER.map((i) => standings[i]).filter(Boolean) as Standing[];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <h1 style={{ fontSize: "1.8rem", margin: 0 }}>Ranking</h1>
        <p style={{ color: "var(--text-dim)", marginTop: 4 }}>
          {tournament?.name ?? "Quiniela Mundial 2026"} · {standings.length} jugadores
        </p>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-dim)" }}>Cargando ranking…</p>
      ) : standings.length === 0 ? (
        <p style={{ color: "var(--text-dim)" }}>Sin jugadores aún.</p>
      ) : (
        <>
          {/* Podio */}
          {podium.length >= 3 && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 14, maxWidth: 560 }}>
              {PODIUM_ORDER.map((idx, visual) => {
                const s = standings[idx];
                return s ? <PodiumSpot key={s.userId} s={s} place={idx} /> : <div key={visual} style={{ flex: 1 }} />;
              })}
            </div>
          )}

          {/* Tabla */}
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--text-dim)", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  <th style={{ padding: "12px 14px" }}>#</th>
                  <th style={{ padding: "12px 14px" }}>Jugador</th>
                  <th style={{ padding: "12px 14px", textAlign: "right" }}>Puntos</th>
                  <th style={{ padding: "12px 14px", textAlign: "right" }}>Exactos</th>
                  <th style={{ padding: "12px 14px", textAlign: "right" }}>Tendencias</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s, i) => (
                  <tr
                    key={s.userId}
                    style={{
                      borderTop: "1px solid var(--border)",
                      background: s.me ? "var(--gold-soft)" : "transparent",
                    }}
                  >
                    <td className="tabular" style={{ padding: "11px 14px", fontWeight: 700, color: "var(--text-dim)" }}>{i + 1}</td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
                        <Flag code={s.support} w={26} h={18} r={4} />
                        <span style={{ fontWeight: 600 }}>{s.name}</span>
                        {s.me && <Pill tone="gold">tú</Pill>}
                        {s.championBonus && (
                          <Pill tone="gold" title="Acertó el campeón · +10 pts">🏆 +10</Pill>
                        )}
                      </span>
                    </td>
                    <td className="display tabular" style={{ padding: "11px 14px", textAlign: "right" }}>{s.pts}</td>
                    <td className="tabular" style={{ padding: "11px 14px", textAlign: "right" }}>{s.exact}</td>
                    <td className="tabular" style={{ padding: "11px 14px", textAlign: "right" }}>{s.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}
