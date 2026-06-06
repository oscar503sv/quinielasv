"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TEAMS } from "@/constants/teams";
import { STAGES, STAGE_ORDER } from "@/constants/stages";
import type { MatchInput } from "@/repositories/admin.server";
import type { Match, MatchStatus } from "@/types";

const STATUSES: { value: MatchStatus; label: string }[] = [
  { value: "upcoming", label: "Programado" },
  { value: "live", label: "En vivo" },
  { value: "finished", label: "Finalizado" },
  { value: "locked", label: "Bloqueado" },
];

/** ms epoch → valor para <input type="datetime-local"> en hora local. */
function toLocalInput(ms: number): string {
  if (!ms) return "";
  const d = new Date(ms - new Date().getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 16);
}

interface MatchFormProps {
  initial?: Match | null;
  busy?: boolean;
  onSubmit: (values: MatchInput) => void;
  onCancel: () => void;
}

export function MatchForm({ initial, busy, onSubmit, onCancel }: MatchFormProps) {
  const [home, setHome] = useState(initial?.home ?? TEAMS[0].code);
  const [away, setAway] = useState(initial?.away ?? TEAMS[1].code);
  const [stage, setStage] = useState<Match["stage"]>(initial?.stage ?? "group");
  const [status, setStatus] = useState<MatchStatus>(initial?.status ?? "upcoming");
  const [date, setDate] = useState(initial?.date ?? "");
  const [lockLocal, setLockLocal] = useState(toLocalInput(initial?.lockAt ?? 0));
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    if (home === away) {
      setError("Local y visitante deben ser distintos.");
      return;
    }
    const lockAt = lockLocal ? new Date(lockLocal).getTime() : 0;
    if (!lockAt) {
      setError("Definí el cierre de pronósticos.");
      return;
    }
    onSubmit({ home, away, stage, status, date: date || "Por definir", lockAt });
  }

  return (
    <Card style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
      <h2 style={{ margin: 0, fontSize: "1.15rem" }}>
        {initial ? "Editar partido" : "Crear partido"}
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="field">
          <label>Local</label>
          <select className="input" value={home} onChange={(e) => setHome(e.target.value)}>
            {TEAMS.map((t) => (
              <option key={t.code} value={t.code}>{t.name}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Visitante</label>
          <select className="input" value={away} onChange={(e) => setAway(e.target.value)}>
            {TEAMS.map((t) => (
              <option key={t.code} value={t.code}>{t.name}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Fase (multiplicador)</label>
          <select
            className="input"
            value={stage}
            onChange={(e) => setStage(e.target.value as Match["stage"])}
          >
            {STAGE_ORDER.map((s) => (
              <option key={s} value={s}>
                {STAGES[s].label} · ×{STAGES[s].mult}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Estado</label>
          <select
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value as MatchStatus)}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Texto de fecha</label>
          <input
            className="input"
            placeholder="Hoy · 18:00"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Cierre de pronósticos</label>
          <input
            type="datetime-local"
            className="input"
            value={lockLocal}
            onChange={(e) => setLockLocal(e.target.value)}
          />
        </div>
      </div>

      {error && <span className="field-err">{error}</span>}

      <div style={{ display: "flex", gap: 10 }}>
        <Button variant="gold" disabled={busy} onClick={submit}>
          {busy ? "Guardando…" : initial ? "Guardar cambios" : "Crear partido"}
        </Button>
        <Button variant="ghost" disabled={busy} onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </Card>
  );
}
