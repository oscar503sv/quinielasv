"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Flag } from "@/components/ui/Flag";
import { Pill } from "@/components/ui/Pill";
import { TeamPicker } from "@/features/profile/TeamPicker";
import { useAuth } from "@/features/auth/AuthProvider";
import { useData } from "@/features/data/DataProvider";
import { setChampion } from "@/features/profile/champion-client";
import { teamName } from "@/constants/teams";
import { isChampionOpen } from "@/lib/champion";
import { fireConfetti } from "@/lib/confetti";

function formatDeadline(ms: number): string {
  return new Intl.DateTimeFormat("es", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(ms));
}

export default function CampeonPage() {
  const router = useRouter();
  const { uid, profile } = useAuth();
  const { tournament } = useData();
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = isChampionOpen(tournament);
  const lockAt = tournament?.championLockAt ?? null;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (profile && selected === null) setSelected(profile.championPrediction);
  }, [profile, selected]);

  async function confirm() {
    if (!uid || !selected) return;
    setBusy(true);
    setError(null);
    try {
      await setChampion(selected);
      fireConfetti();
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar tu campeón.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, paddingBottom: 120 }}>
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 8 }}>
        <span className="eyebrow">Bono campeón · +10 puntos</span>
        <h1 style={{ fontSize: "2rem", margin: 0 }}>¿Quién levantará la copa? 🏆</h1>
        <p style={{ color: "var(--text-dim)", maxWidth: 520, margin: "0 auto" }}>
          Elegí la selección que creés que va a ganar el Mundial. Si acertás, sumás
          +10 puntos al final del torneo.
        </p>
        {open && lockAt && (
          <span style={{ fontSize: "0.84rem", color: "var(--text-dim)" }}>
            Podés elegir o cambiarlo hasta el <strong>{formatDeadline(lockAt)}</strong>.
          </span>
        )}
      </div>

      {!open && (
        <div
          className="card"
          style={{
            padding: 16,
            textAlign: "center",
            borderColor: "var(--gold-border)",
            background: "var(--gold-soft)",
          }}
        >
          🔒 El plazo para elegir o cambiar tu campeón ya cerró
          {profile?.championPrediction ? (
            <>
              {" "}· tu campeón es <strong>{teamName(profile.championPrediction)}</strong>.
            </>
          ) : (
            <> y no elegiste ninguno.</>
          )}
        </div>
      )}

      <TeamPicker selected={selected} onSelect={setSelected} disabled={!open} />

      {/* Barra sticky */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          borderTop: "1px solid var(--border)",
          background: "var(--bg-solid)",
          padding: "14px 20px",
          zIndex: 30,
        }}
      >
        <div className="sticky-actions">
          <div className="sticky-actions-info">
            {selected ? (
              <>
                <Flag code={selected} w={34} h={24} r={5} />
                <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {teamName(selected)}
                </span>
              </>
            ) : (
              <span style={{ color: "var(--text-dim)" }}>Elegí tu campeón…</span>
            )}
            {!open && <Pill tone="dim">🔒 Cerrado</Pill>}
          </div>
          {error && <span className="field-err">{error}</span>}
          <div className="sticky-actions-btns">
            <Button variant="ghost" onClick={() => router.back()}>
              {open ? "Cancelar" : "Volver"}
            </Button>
            {open && (
              <Button variant="gold" disabled={!selected || busy} onClick={confirm}>
                {busy ? "Confirmando…" : "Confirmar campeón"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
