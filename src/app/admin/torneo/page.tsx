"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { Flag } from "@/components/ui/Flag";
import { TeamPicker } from "@/features/profile/TeamPicker";
import { useData } from "@/features/data/DataProvider";
import { updateTournament } from "@/features/admin/admin-client";
import { teamName } from "@/constants/teams";
import { fireConfetti } from "@/lib/confetti";
import type { Tournament } from "@/types";

interface ToggleProps {
  label: string;
  desc: string;
  value: boolean;
  busy: boolean;
  onChange: (v: boolean) => void;
}

function Toggle({ label, desc, value, busy, onChange }: ToggleProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600 }}>{label}</div>
        <div style={{ color: "var(--text-dim)", fontSize: "0.85rem" }}>{desc}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        disabled={busy}
        onClick={() => onChange(!value)}
        style={{
          width: 52,
          height: 30,
          borderRadius: 999,
          border: "1px solid var(--border)",
          background: value ? "var(--gold)" : "var(--surface-2)",
          position: "relative",
          cursor: busy ? "not-allowed" : "pointer",
          transition: "background .2s ease",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: value ? 25 : 3,
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: value ? "var(--gold-ink)" : "var(--text-dim)",
            transition: "left .2s ease",
          }}
        />
      </button>
    </div>
  );
}

export default function AdminTorneoPage() {
  const { tournament } = useData();
  const [busy, setBusy] = useState(false);
  const [champion, setChampion] = useState<string | null>(null);
  const [savingChamp, setSavingChamp] = useState(false);

  const selectedChampion = champion ?? tournament?.champion ?? null;

  async function patch(field: keyof Tournament, value: boolean) {
    setBusy(true);
    try {
      await updateTournament({ [field]: value });
    } finally {
      setBusy(false);
    }
  }

  async function defineChampion() {
    if (!selectedChampion) return;
    setSavingChamp(true);
    try {
      await updateTournament({ champion: selectedChampion });
      fireConfetti();
    } finally {
      setSavingChamp(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 820 }}>
      <div>
        <Pill tone="gold">ADMIN</Pill>
        <h1 style={{ fontSize: "1.8rem", margin: "8px 0 0" }}>Gestionar torneo</h1>
      </div>

      <Card style={{ padding: 22 }}>
        <Toggle
          label="Torneo iniciado"
          desc="Habilita la quiniela para los jugadores."
          value={tournament?.started ?? false}
          busy={busy}
          onChange={(v) => patch("started", v)}
        />
        <Toggle
          label="Bloquear todos los pronósticos"
          desc="Congela la edición de pronósticos en todos los partidos."
          value={tournament?.predictionsLocked ?? false}
          busy={busy}
          onChange={(v) => patch("predictionsLocked", v)}
        />
        <div style={{ borderBottom: "none" }}>
          <Toggle
            label="Torneo finalizado"
            desc="Cierra la quiniela. El ranking queda definitivo."
            value={tournament?.finished ?? false}
            busy={busy}
            onChange={(v) => patch("finished", v)}
          />
        </div>
      </Card>

      <Card style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.15rem" }}>Campeón oficial 🏆</h2>
          <p style={{ color: "var(--text-dim)", marginTop: 4, fontSize: "0.9rem" }}>
            Al definir el campeón se otorgan +10 puntos a quienes lo acertaron.
          </p>
        </div>
        {tournament?.champion && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "var(--text-dim)" }}>Actual:</span>
            <Flag code={tournament.champion} w={30} h={21} r={4} />
            <strong>{teamName(tournament.champion)}</strong>
          </div>
        )}
        <TeamPicker selected={selectedChampion} onSelect={setChampion} />
        <Button
          variant="gold"
          disabled={!selectedChampion || savingChamp || selectedChampion === tournament?.champion}
          onClick={defineChampion}
        >
          {savingChamp ? "Otorgando…" : "Definir campeón y otorgar bonos"}
        </Button>
      </Card>
    </div>
  );
}
