"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { Flag } from "@/components/ui/Flag";
import { ScoreStepper } from "@/components/ui/ScoreStepper";
import { useData } from "@/features/data/DataProvider";
import { finalizeMatch } from "@/features/admin/admin-client";
import { teamName } from "@/constants/teams";
import { STAGES, isKnockout } from "@/constants/stages";
import { fireConfetti } from "@/lib/confetti";
import { clampScore } from "@/lib/score-utils";
import type { Match } from "@/types";

function ResultCard({ match }: { match: Match }) {
  const [home, setHome] = useState(match.result?.home ?? 0);
  const [away, setAway] = useState(match.result?.away ?? 0);
  const [advances, setAdvances] = useState<string | null>(match.advances ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const knockout = isKnockout(match.stage);
  const advanceLabel =
    match.stage === "final" || match.stage === "third_place"
      ? "¿Quién gana la llave?"
      : "¿Quién avanza?";

  async function finalize() {
    if (knockout && !advances) {
      setError("Indicá qué equipo avanza/gana.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await finalizeMatch(match.id, { home, away }, knockout ? advances : null);
      fireConfetti();
      // El partido pasará a `finished` y desaparecerá de esta lista (suscripción).
      void res;
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo finalizar.");
      setBusy(false);
    }
  }

  return (
    <Card style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Pill tone="gold">{STAGES[match.stage].label}</Pill>
        {match.status === "live" ? <Pill tone="bad" live>En juego</Pill> : <Pill tone="dim">{match.date}</Pill>}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Flag code={match.home} w={44} h={30} r={6} />
          <ScoreStepper value={home} onDelta={(d) => setHome((v) => clampScore(v + d))} disabled={busy} label={teamName(match.home)} />
        </div>
        <span style={{ color: "var(--text-faint)", fontWeight: 700 }}>VS</span>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Flag code={match.away} w={44} h={30} r={6} />
          <ScoreStepper value={away} onDelta={(d) => setAway((v) => clampScore(v + d))} disabled={busy} label={teamName(match.away)} />
        </div>
      </div>

      {knockout && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
            {advanceLabel} <span style={{ color: "var(--text-faint)" }}>(define el bono de avance)</span>
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            {[match.home, match.away].map((code) => {
              const active = advances === code;
              return (
                <button
                  key={code}
                  type="button"
                  disabled={busy}
                  onClick={() => setAdvances(code)}
                  className="card"
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 10px",
                    cursor: busy ? "not-allowed" : "pointer",
                    borderColor: active ? "var(--gold-border)" : "var(--border)",
                    background: active ? "var(--gold-soft)" : "var(--surface)",
                  }}
                >
                  <Flag code={code} w={26} h={18} r={4} />
                  <span style={{ fontWeight: 600, fontSize: "0.84rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {teamName(code)}
                  </span>
                  {active && <span style={{ marginLeft: "auto", color: "var(--gold)", fontWeight: 800 }}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {error && <span className="field-err">{error}</span>}
      <Button variant="gold" block disabled={busy} onClick={finalize}>
        {busy ? "Finalizando…" : "Finalizar partido"}
      </Button>
    </Card>
  );
}

const KICKOFF_OFFSET_MS = 5 * 60 * 1000; // lockAt + 5min = inicio del partido
const PER_PAGE = 24;

/** ¿Mostrar este partido en Resultados? Live siempre; upcoming solo si ya empezó (o showAll). */
function isFinalizable(m: Match, showAll: boolean): boolean {
  if (m.status === "live") return true;
  if (m.status !== "upcoming") return false;
  return showAll || Date.now() >= m.lockAt + KICKOFF_OFFSET_MS;
}

export default function AdminResultadosPage() {
  const { matches, loading } = useData();
  const [showAll, setShowAll] = useState(false);
  const [page, setPage] = useState(0);

  const visible = useMemo(
    () => matches.filter((m) => isFinalizable(m, showAll)).sort((a, b) => a.lockAt - b.lockAt),
    [matches, showAll],
  );

  const pageCount = Math.max(1, Math.ceil(visible.length / PER_PAGE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = visible.slice(safePage * PER_PAGE, safePage * PER_PAGE + PER_PAGE);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <Pill tone="gold">ADMIN</Pill>
        <h1 style={{ fontSize: "1.8rem", margin: "8px 0 0" }}>Registrar resultados</h1>
        <p style={{ color: "var(--text-dim)", marginTop: 4, maxWidth: 640 }}>
          Capturá el marcador oficial y finalizá. Al finalizar se calculan los puntos
          de todos los jugadores y se actualiza el ranking.
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <Button variant={showAll ? "gold" : "outline"} onClick={() => { setShowAll((v) => !v); setPage(0); }}>
          {showAll ? "Ver solo jugados" : "Mostrar todos los próximos"}
        </Button>
        <span style={{ color: "var(--text-dim)", fontSize: "0.86rem" }}>
          {visible.length} partido{visible.length === 1 ? "" : "s"}
        </span>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-dim)" }}>Cargando…</p>
      ) : visible.length === 0 ? (
        <p style={{ color: "var(--text-dim)" }}>
          No hay partidos jugados pendientes de finalizar. Usá “Mostrar todos los próximos” para ver los que vienen.
        </p>
      ) : (
        <>
          <div className="match-grid">
            {pageRows.map((m) => (
              <ResultCard key={m.id} match={m} />
            ))}
          </div>
          {pageCount > 1 && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <Button variant="outline" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
                ← Anterior
              </Button>
              <span className="tabular" style={{ color: "var(--text-dim)", fontSize: "0.9rem" }}>
                Página {safePage + 1} de {pageCount}
              </span>
              <Button variant="outline" disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)}>
                Siguiente →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
