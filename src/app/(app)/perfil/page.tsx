"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { Avatar } from "@/components/ui/Avatar";
import { Flag } from "@/components/ui/Flag";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/features/auth/AuthProvider";
import { useData } from "@/features/data/DataProvider";
import { updateUserDoc } from "@/repositories/users.client";
import { logout } from "@/features/auth/auth-client";
import { teamName } from "@/constants/teams";
import { isChampionOpen } from "@/lib/champion";

export default function PerfilPage() {
  const router = useRouter();
  const { uid, email, profile } = useAuth();
  const { standings, myPosition, tournament } = useData();
  const me = standings.find((s) => s.me);
  const championOpen = isChampionOpen(tournament);

  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (profile) setName(profile.name);
  }, [profile]);

  async function saveName() {
    if (!uid || !name.trim()) return;
    setSavingName(true);
    try {
      await updateUserDoc(uid, { name: name.trim() });
    } finally {
      setSavingName(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.replace("/");
    router.refresh();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 760 }}>
      <h1 style={{ fontSize: "1.8rem", margin: 0 }}>Perfil</h1>

      {/* Tarjeta principal */}
      <Card style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Avatar code={profile?.support ?? null} size={64} />
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: "1.3rem" }}>{profile?.name ?? "Jugador"}</h2>
            <span style={{ color: "var(--text-dim)", fontSize: "0.88rem" }}>{email}</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Pill tone="gold">#{myPosition || "—"}</Pill>
            <Pill tone="good">{me?.pts ?? 0} pts</Pill>
          </div>
        </div>

        <div className="field">
          <label htmlFor="name">Nombre</label>
          <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="email">Correo</label>
          <input id="email" className="input" value={email ?? ""} disabled />
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button variant="gold" disabled={savingName} onClick={saveName}>
            {savingName ? "Guardando…" : "Guardar cambios"}
          </Button>
          <ThemeToggle />
        </div>
      </Card>

      {/* Equipo del corazón */}
      <Link href="/equipo">
        <Card style={{ padding: 20, display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: "1.15rem" }}>Tu equipo del corazón 💙</h2>
            <p style={{ color: "var(--text-dim)", marginTop: 4, fontSize: "0.9rem" }}>
              A quién le vas · su bandera es tu foto de perfil.
            </p>
          </div>
          {profile?.support ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              <Flag code={profile.support} w={40} h={28} r={6} />
              <span style={{ fontWeight: 600 }}>{teamName(profile.support)}</span>
              <Pill tone="gold">✎ Cambiar</Pill>
            </span>
          ) : (
            <Pill tone="gold">Elegir →</Pill>
          )}
        </Card>
      </Link>

      {/* Campeón */}
      <Link href="/campeon">
        <Card style={{ padding: 20, display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: "1.15rem" }}>Tu campeón del Mundial 🏆</h2>
            <p style={{ color: "var(--text-dim)", marginTop: 4, fontSize: "0.9rem" }}>
              Quién creés que va a ganar la copa · +10 pts si acertás.
            </p>
          </div>
          {profile?.championPrediction ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              <Flag code={profile.championPrediction} w={40} h={28} r={6} />
              <span style={{ fontWeight: 600 }}>{teamName(profile.championPrediction)}</span>
              <Pill tone={championOpen ? "gold" : "dim"}>
                {championOpen ? "✎ Cambiar" : "🔒 Cerrado"}
              </Pill>
            </span>
          ) : (
            <Pill tone={championOpen ? "gold" : "dim"}>
              {championOpen ? "Elegir →" : "🔒 Cerrado"}
            </Pill>
          )}
        </Card>
      </Link>

      <div>
        <Button variant="outline" onClick={handleLogout}>Cerrar sesión</Button>
      </div>
    </div>
  );
}
