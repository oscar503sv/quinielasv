"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { Flag } from "@/components/ui/Flag";
import { ScoreStepper } from "@/components/ui/ScoreStepper";
import { STAGES } from "@/constants/stages";
import { teamName } from "@/constants/teams";
import { resultKind, totalPoints } from "@/lib/scoring";
import { lockLabel } from "@/lib/utils";
import { clampScore } from "@/lib/score-utils";
import { fireConfetti } from "@/lib/confetti";
import { useAuth } from "@/features/auth/AuthProvider";
import { savePrediction, canPredict } from "@/services/predictions.service";
import type { Match, Prediction } from "@/types";

interface MatchCardProps {
  match: Match;
  myPrediction?: Prediction;
}

function TeamRow({ code, score }: { code: string; score?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
      <Flag code={code} w={34} h={24} r={5} />
      <span style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {teamName(code)}
      </span>
      {score !== undefined && (
        <span className="display tabular" style={{ marginLeft: "auto", fontSize: "1.4rem" }}>
          {score}
        </span>
      )}
    </div>
  );
}

export function MatchCard({ match, myPrediction }: MatchCardProps) {
  const { uid } = useAuth();
  const stage = STAGES[match.stage];
  const open = canPredict(match);

  const [home, setHome] = useState(myPrediction?.home ?? 0);
  const [away, setAway] = useState(myPrediction?.away ?? 0);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sincroniza si llega/actualiza el pronóstico desde Firestore.
  useEffect(() => {
    if (myPrediction) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHome(myPrediction.home);
      setAway(myPrediction.away);
    }
  }, [myPrediction]);

  const dirty =
    !myPrediction || myPrediction.home !== home || myPrediction.away !== away;

  async function handleSave() {
    if (!uid) return;
    setBusy(true);
    setError(null);
    try {
      await savePrediction(uid, match, { home, away });
      setSaved(true);
      fireConfetti();
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Encabezado: fase + estado */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Pill tone="gold">{stage.label}</Pill>
          {stage.mult > 1 && <span className="badge-mult">x{stage.mult}</span>}
        </div>
        {match.status === "live" ? (
          <Pill tone="bad" live>
            En juego
          </Pill>
        ) : match.status === "finished" ? (
          <Pill tone="dim">Final</Pill>
        ) : match.status === "locked" ? (
          <Pill tone="dim">🔒 Bloqueado</Pill>
        ) : (
          <span style={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>{lockLabel(match.lockAt)}</span>
        )}
      </div>

      <span style={{ fontSize: "0.82rem", color: "var(--text-dim)" }}>{match.date}</span>

      {/* ---- Estado: upcoming (editable) ---- */}
      {match.status === "upcoming" && open && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <Flag code={match.home} w={44} h={30} r={6} />
              <ScoreStepper
                value={home}
                onDelta={(d) => setHome((v) => clampScore(v + d))}
                disabled={busy}
                saved={saved}
                label={teamName(match.home)}
              />
            </div>
            <span style={{ color: "var(--text-faint)", fontWeight: 700 }}>VS</span>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <Flag code={match.away} w={44} h={30} r={6} />
              <ScoreStepper
                value={away}
                onDelta={(d) => setAway((v) => clampScore(v + d))}
                disabled={busy}
                saved={saved}
                label={teamName(match.away)}
              />
            </div>
          </div>
          {error && <span className="field-err">{error}</span>}
          {saved ? (
            <Button variant="gold" block disabled>
              ¡Guardado! 🎉
            </Button>
          ) : (
            <Button variant="gold" block disabled={busy || !dirty} onClick={handleSave}>
              {busy
                ? "Guardando…"
                : myPrediction
                  ? "Actualizar pronóstico"
                  : "Guardar pronóstico"}
            </Button>
          )}
          {myPrediction && (
            <span
              style={{
                textAlign: "center",
                fontSize: "0.8rem",
                color: "var(--text-dim)",
              }}
            >
              Guardado:{" "}
              <strong style={{ color: "var(--gold)" }}>
                {myPrediction.home}–{myPrediction.away}
              </strong>{" "}
              · podés editar hasta el cierre
            </span>
          )}
        </>
      )}

      {/* ---- Estado: bloqueado (aún sin definir) ---- */}
      {match.status === "locked" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <TeamRow code={match.home} />
          <TeamRow code={match.away} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, color: "var(--text-dim)", fontSize: "0.84rem" }}>
            🔒 Aún no disponible para pronosticar
          </div>
        </div>
      )}

      {/* ---- Estado: upcoming pero ya cerró el pronóstico ---- */}
      {match.status === "upcoming" && !open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <TeamRow code={match.home} />
          <TeamRow code={match.away} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              marginTop: 6,
            }}
          >
            <Pill tone="dim">⏳ Cerrado</Pill>
            {myPrediction ? (
              <span style={{ fontSize: "0.84rem", color: "var(--text-dim)" }}>
                Tu pronóstico:{" "}
                <strong style={{ color: "var(--gold)" }}>
                  {myPrediction.home}–{myPrediction.away}
                </strong>
              </span>
            ) : (
              <span style={{ fontSize: "0.84rem", color: "var(--text-faint)" }}>
                No pronosticaste
              </span>
            )}
          </div>
        </div>
      )}

      {/* ---- Estado: live (sin marcador oficial; mostramos el pronóstico) ---- */}
      {match.status === "live" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <TeamRow code={match.home} />
          <TeamRow code={match.away} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              marginTop: 6,
            }}
          >
            <Pill tone="bad" live>En juego</Pill>
            {myPrediction ? (
              <span style={{ fontSize: "0.84rem", color: "var(--text-dim)" }}>
                Tu pronóstico:{" "}
                <strong style={{ color: "var(--gold)" }}>
                  {myPrediction.home}–{myPrediction.away}
                </strong>
              </span>
            ) : (
              <span style={{ fontSize: "0.84rem", color: "var(--text-faint)" }}>
                No pronosticaste
              </span>
            )}
          </div>
        </div>
      )}

      {/* ---- Estado: finished ---- */}
      {match.status === "finished" && match.result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <TeamRow code={match.home} score={match.result.home} />
          <TeamRow code={match.away} score={match.result.away} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 6 }}>
            <span style={{ fontSize: "0.82rem", color: "var(--text-dim)" }}>
              {myPrediction
                ? `Tu pronóstico: ${myPrediction.home}–${myPrediction.away}`
                : "Sin pronóstico"}
            </span>
            {myPrediction ? (
              <FinishedResult match={match} pred={myPrediction} />
            ) : null}
          </div>
        </div>
      )}
    </Card>
  );
}

function FinishedResult({ match, pred }: { match: Match; pred: Prediction }) {
  if (!match.result) return null;
  const kind = resultKind({ home: pred.home, away: pred.away }, match.result);
  const pts = totalPoints({ home: pred.home, away: pred.away }, match.result, match.stage);
  const tone = kind === "fallo" ? "bad" : "good";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Pill tone={tone}>{kind}</Pill>
      <span
        className="display tabular"
        style={{ color: pts > 0 ? "var(--good)" : "var(--text-faint)", fontWeight: 800 }}
      >
        +{pts}
      </span>
    </div>
  );
}
