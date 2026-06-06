"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { Flag } from "@/components/ui/Flag";
import { ScoreStepper } from "@/components/ui/ScoreStepper";
import { useData } from "@/features/data/DataProvider";
import { finalizeMatch } from "@/features/admin/admin-client";
import { teamName } from "@/constants/teams";
import { STAGES } from "@/constants/stages";
import { fireConfetti } from "@/lib/confetti";
import { clampScore } from "@/lib/score-utils";
import type { Match } from "@/types";

function ResultCard({ match }: { match: Match }) {
  const [home, setHome] = useState(match.result?.home ?? 0);
  const [away, setAway] = useState(match.result?.away ?? 0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function finalize() {
    setBusy(true);
    setError(null);
    try {
      const res = await finalizeMatch(match.id, { home, away });
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

      {error && <span className="field-err">{error}</span>}
      <Button variant="gold" block disabled={busy} onClick={finalize}>
        {busy ? "Finalizando…" : "Finalizar partido"}
      </Button>
    </Card>
  );
}

export default function AdminResultadosPage() {
  const { matches, loading } = useData();
  const pending = matches.filter((m) => m.status === "live" || m.status === "upcoming");

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

      {loading ? (
        <p style={{ color: "var(--text-dim)" }}>Cargando…</p>
      ) : pending.length === 0 ? (
        <p style={{ color: "var(--text-dim)" }}>No hay partidos en vivo o por finalizar.</p>
      ) : (
        <div className="match-grid">
          {pending.map((m) => (
            <ResultCard key={m.id} match={m} />
          ))}
        </div>
      )}
    </div>
  );
}
