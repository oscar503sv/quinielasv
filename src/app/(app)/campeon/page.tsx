"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Flag } from "@/components/ui/Flag";
import { TeamPicker } from "@/features/profile/TeamPicker";
import { useAuth } from "@/features/auth/AuthProvider";
import { updateUserDoc } from "@/repositories/users.client";
import { teamName } from "@/constants/teams";
import { fireConfetti } from "@/lib/confetti";

export default function CampeonPage() {
  const router = useRouter();
  const { uid, profile } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (profile && selected === null) setSelected(profile.championPrediction);
  }, [profile, selected]);

  async function confirm() {
    if (!uid || !selected) return;
    setBusy(true);
    try {
      await updateUserDoc(uid, { championPrediction: selected });
      fireConfetti();
      router.push("/dashboard");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, paddingBottom: 90 }}>
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 8 }}>
        <span className="eyebrow">Bono campeón · +10 puntos</span>
        <h1 style={{ fontSize: "2rem", margin: 0 }}>¿Quién levantará la copa? 🏆</h1>
        <p style={{ color: "var(--text-dim)", maxWidth: 520, margin: "0 auto" }}>
          Elegí la selección que creés que va a ganar el Mundial. Si acertás, sumás
          +10 puntos al final del torneo.
        </p>
      </div>

      <TeamPicker selected={selected} onSelect={setSelected} />

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
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
            {selected ? (
              <>
                <Flag code={selected} w={34} h={24} r={5} />
                <span style={{ fontWeight: 600 }}>{teamName(selected)}</span>
              </>
            ) : (
              <span style={{ color: "var(--text-dim)" }}>Elegí tu campeón…</span>
            )}
          </div>
          <Button variant="ghost" onClick={() => router.back()}>Cancelar</Button>
          <Button variant="gold" disabled={!selected || busy} onClick={confirm}>
            {busy ? "Confirmando…" : "Confirmar campeón"}
          </Button>
        </div>
      </div>
    </div>
  );
}
