"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Flag } from "@/components/ui/Flag";
import { Pill } from "@/components/ui/Pill";
import { useData } from "@/features/data/DataProvider";
import { LeaguesPanel } from "@/features/leagues/LeaguesPanel";
import { CHAMPION_BONUS } from "@/lib/scoring";
import type { Standing } from "@/types";

const PODIUM_ORDER = [1, 0, 2]; // columnas visuales: 2.º · 1.º · 3.º
const PODIUM_THEME = [
  { height: 132, medal: "🥇", accent: "var(--gold)", border: "var(--gold-border)",
    grad: "linear-gradient(180deg, rgba(245,197,66,.18), rgba(245,197,66,.03))" },
  { height: 104, medal: "🥈", accent: "#c8cfdb", border: "rgba(200,207,219,.4)",
    grad: "linear-gradient(180deg, rgba(200,207,219,.16), rgba(200,207,219,.03))" },
  { height: 80,  medal: "🥉", accent: "#cd8e5e", border: "rgba(205,142,94,.4)",
    grad: "linear-gradient(180deg, rgba(205,142,94,.16), rgba(205,142,94,.03))" },
];
const PER_PAGE = 25;

function PodiumSpot({ s, rank }: { s: Standing; rank: number }) {
  const t = PODIUM_THEME[rank];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1 }}>
      <div style={{ position: "relative" }}>
        <Flag code={s.support} w={56} h={40} r={8} />
        <span
          title={`${rank + 1}.º puesto`}
          style={{
            position: "absolute",
            right: -8,
            bottom: -8,
            width: 26,
            height: 26,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.95rem",
            borderRadius: "50%",
            background: "var(--bg-solid)",
            border: `1px solid ${t.border}`,
          }}
        >
          {t.medal}
        </span>
      </div>
      <span style={{ fontWeight: 700, fontSize: "0.9rem", textAlign: "center" }}>
        {s.name} {s.championBonus && <span title={`Acertó el campeón · +${CHAMPION_BONUS}`}>🏆</span>}
      </span>
      <span className="display tabular" style={{ color: t.accent }}>{s.pts}</span>
      <div
        className="card"
        style={{
          width: "100%",
          height: t.height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderTopLeftRadius: 14,
          borderTopRightRadius: 14,
          background: t.grad,
          borderColor: t.border,
        }}
      >
        <span
          className="display tabular"
          style={{ fontSize: "clamp(1.8rem, 6vw, 2.6rem)", fontWeight: 800, color: t.accent, opacity: 0.85 }}
        >
          {rank + 1}
        </span>
      </div>
    </div>
  );
}

export default function RankingPage() {
  const { standings, tournament, loading } = useData();
  const [page, setPage] = useState(0);
  const [tab, setTab] = useState<"general" | "ligas">("general");
  const podium = PODIUM_ORDER.map((i) => standings[i]).filter(Boolean) as Standing[];

  // Paginación derivada en render (clamp por si la lista cambia en vivo).
  const pageCount = Math.max(1, Math.ceil(standings.length / PER_PAGE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = standings.slice(safePage * PER_PAGE, safePage * PER_PAGE + PER_PAGE);

  const myIndex = standings.findIndex((s) => s.me);
  const myPage = myIndex === -1 ? -1 : Math.floor(myIndex / PER_PAGE);
  const canJumpToMe = myIndex !== -1 && myPage !== safePage;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <h1 style={{ fontSize: "1.8rem", margin: 0 }}>Ranking</h1>
        <p style={{ color: "var(--text-dim)", marginTop: 4 }}>
          {tournament?.name ?? "Quiniela Mundial 2026"} · {standings.length} jugadores
        </p>
      </div>

      <div className="tabs">
        <button type="button" className="tab" data-active={tab === "general"} onClick={() => setTab("general")}>
          General
        </button>
        <button type="button" className="tab" data-active={tab === "ligas"} onClick={() => setTab("ligas")}>
          Mis ligas
        </button>
      </div>

      {tab === "ligas" ? (
        <LeaguesPanel />
      ) : loading ? (
        <p style={{ color: "var(--text-dim)" }}>Cargando ranking…</p>
      ) : standings.length === 0 ? (
        <p style={{ color: "var(--text-dim)" }}>Sin jugadores aún.</p>
      ) : (
        <>
          {/* Podio */}
          {podium.length >= 3 && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 14, maxWidth: 560, width: "100%", margin: "0 auto" }}>
              {PODIUM_ORDER.map((idx, visual) => {
                const s = standings[idx];
                return s ? <PodiumSpot key={s.userId} s={s} rank={idx} /> : <div key={visual} style={{ flex: 1 }} />;
              })}
            </div>
          )}

          {/* Tabla */}
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <table className="rank-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Jugador</th>
                  <th style={{ textAlign: "right" }}>
                    <span className="col-full">Puntos</span><span className="col-abbr">Pts</span>
                  </th>
                  <th style={{ textAlign: "right" }}>
                    <span className="col-full">Exactos</span><span className="col-abbr">Exac.</span>
                  </th>
                  <th style={{ textAlign: "right" }}>
                    <span className="col-full">Tendencias</span><span className="col-abbr">Tend.</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((s, i) => (
                  <tr
                    key={s.userId}
                    style={{
                      borderTop: "1px solid var(--border)",
                      background: s.me ? "var(--gold-soft)" : "transparent",
                    }}
                  >
                    <td className="tabular" style={{ fontWeight: 700, color: "var(--text-dim)" }}>
                      {safePage * PER_PAGE + i + 1}
                    </td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
                        <Flag code={s.support} w={26} h={18} r={4} />
                        <span style={{ fontWeight: 600 }}>{s.name}</span>
                        {s.me && <Pill tone="gold">tú</Pill>}
                        {s.championBonus && (
                          <Pill tone="gold" title={`Acertó el campeón · +${CHAMPION_BONUS} pts`}>🏆 +{CHAMPION_BONUS}</Pill>
                        )}
                      </span>
                    </td>
                    <td className="display tabular" style={{ textAlign: "right" }}>{s.pts}</td>
                    <td className="tabular" style={{ textAlign: "right" }}>{s.exact}</td>
                    <td className="tabular" style={{ textAlign: "right" }}>{s.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <p style={{ color: "var(--text-dim)", fontSize: "0.8rem", margin: 0 }}>
            En caso de empate: más exactos → más diferencias exactas → mejor % de aciertos.
          </p>

          {/* Paginación */}
          {pageCount > 1 && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <Button variant="outline" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
                ← Anterior
              </Button>
              <span className="tabular" style={{ color: "var(--text-dim)", fontSize: "0.9rem" }}>
                Página {safePage + 1} de {pageCount}
              </span>
              <Button
                variant="outline"
                disabled={safePage >= pageCount - 1}
                onClick={() => setPage(safePage + 1)}
              >
                Siguiente →
              </Button>
              {canJumpToMe && (
                <Button variant="ghost" onClick={() => setPage(myPage)} style={{ marginLeft: "auto" }}>
                  Ir a mi posición (#{myIndex + 1})
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
