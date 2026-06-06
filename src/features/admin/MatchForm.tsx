"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TEAMS, TBD } from "@/constants/teams";
import { STAGES, STAGE_ORDER } from "@/constants/stages";
import type { MatchInput } from "@/repositories/admin.server";
import type { Match, MatchStatus } from "@/types";

const STATUSES: { value: MatchStatus; label: string }[] = [
  { value: "upcoming", label: "Programado" },
  { value: "live", label: "En vivo" },
  { value: "finished", label: "Finalizado" },
  { value: "locked", label: "Bloqueado" },
];

const pad = (n: number) => String(n).padStart(2, "0");

/** Los pronósticos cierran 5 minutos antes del inicio del partido. */
const LOCK_LEAD_MS = 5 * 60 * 1000;

/** ms epoch → { date: 'YYYY-MM-DD', time: 'HH:mm' } en hora local. */
function splitDateTime(ms: number): { date: string; time: string } {
  if (!ms) return { date: "", time: "" };
  const d = new Date(ms);
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

/** Texto legible en español a partir del inicio del partido. Ej: "vie 5 jun · 18:00". */
function formatDisplay(ms: number): string {
  const d = new Date(ms);
  const fecha = new Intl.DateTimeFormat("es", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(d);
  return `${fecha} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface MatchFormProps {
  initial?: Match | null;
  busy?: boolean;
  onSubmit: (values: MatchInput) => void;
  onCancel: () => void;
}

export function MatchForm({ initial, busy, onSubmit, onCancel }: MatchFormProps) {
  // El partido inicia 5 min después del cierre guardado; reconstruimos el inicio.
  const initKickoff = initial?.lockAt ? initial.lockAt + LOCK_LEAD_MS : 0;
  const initDT = splitDateTime(initKickoff);
  const [home, setHome] = useState(initial?.home ?? TEAMS[0].code);
  const [away, setAway] = useState(initial?.away ?? TEAMS[1].code);
  const [stage, setStage] = useState<Match["stage"]>(initial?.stage ?? "group");
  const [status, setStatus] = useState<MatchStatus>(initial?.status ?? "upcoming");
  const [date, setDate] = useState(initDT.date);
  const [time, setTime] = useState(initDT.time);
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    if (home === away && home !== TBD) {
      setError("Local y visitante deben ser distintos.");
      return;
    }
    if (!date || !time) {
      setError("Elegí la fecha y la hora del partido.");
      return;
    }
    const kickoff = new Date(`${date}T${time}`).getTime();
    if (!kickoff) {
      setError("Fecha u hora inválida.");
      return;
    }
    // El texto muestra el inicio; los pronósticos cierran 5 min antes.
    onSubmit({
      home,
      away,
      stage,
      status,
      date: formatDisplay(kickoff),
      lockAt: kickoff - LOCK_LEAD_MS,
    });
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
            <option value={TBD}>— Por definir —</option>
            {TEAMS.map((t) => (
              <option key={t.code} value={t.code}>{t.name}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Visitante</label>
          <select className="input" value={away} onChange={(e) => setAway(e.target.value)}>
            <option value={TBD}>— Por definir —</option>
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
          <label>Fecha del partido</label>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="field">
          <label>Hora del partido</label>
          <input type="time" className="input" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
      </div>

      <p style={{ color: "var(--text-dim)", fontSize: "0.82rem", margin: 0 }}>
        Los pronósticos se cierran automáticamente 5 minutos antes del inicio.
      </p>

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
