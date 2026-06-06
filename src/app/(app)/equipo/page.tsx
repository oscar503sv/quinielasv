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

export default function EquipoPage() {
  const router = useRouter();
  const { uid, profile } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (profile && selected === null) setSelected(profile.support);
  }, [profile, selected]);

  async function confirm() {
    if (!uid || !selected) return;
    setBusy(true);
    try {
      await updateUserDoc(uid, { support: selected });
      fireConfetti();
      router.push("/perfil");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, paddingBottom: 120 }}>
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 8 }}>
        <span className="eyebrow">Tu equipo del corazón · 💙</span>
        <h1 style={{ fontSize: "2rem", margin: 0 }}>¿A quién le vas?</h1>
        <p style={{ color: "var(--text-dim)", maxWidth: 520, margin: "0 auto" }}>
          Elegí la selección que vas a apoyar. Su bandera será tu foto de perfil en
          toda la app. Podés cambiarla cuando quieras.
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
              <span style={{ color: "var(--text-dim)" }}>Elegí tu equipo…</span>
            )}
          </div>
          <div className="sticky-actions-btns">
            <Button variant="ghost" onClick={() => router.back()}>Cancelar</Button>
            <Button variant="gold" disabled={!selected || busy} onClick={confirm}>
              {busy ? "Confirmando…" : "Confirmar equipo"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
