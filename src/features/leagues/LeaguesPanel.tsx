"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/AuthProvider";
import { useData } from "@/features/data/DataProvider";
import { createLeague, joinLeague } from "./leagues-client";
import { LeagueCard } from "./LeagueCard";

// Debe coincidir con MAX_OWNED en leagues.service.ts (server-only, no se importa acá).
const MAX_OWNED = 2;

export function LeaguesPanel() {
  const { uid } = useAuth();
  const { myLeagues } = useData();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busyCreate, setBusyCreate] = useState(false);
  const [busyJoin, setBusyJoin] = useState(false);
  const [createErr, setCreateErr] = useState<string | null>(null);
  const [joinErr, setJoinErr] = useState<string | null>(null);

  const ownedCount = myLeagues.filter((l) => l.ownerUid === uid).length;
  const atOwnedLimit = ownedCount >= MAX_OWNED;

  async function handleCreate() {
    if (!name.trim()) return;
    setBusyCreate(true);
    setCreateErr(null);
    try {
      await createLeague(name);
      setName("");
    } catch (e) {
      setCreateErr(e instanceof Error ? e.message : "No se pudo crear la liga.");
    } finally {
      setBusyCreate(false);
    }
  }

  async function handleJoin() {
    if (!code.trim()) return;
    setBusyJoin(true);
    setJoinErr(null);
    try {
      await joinLeague(code);
      setCode("");
    } catch (e) {
      setJoinErr(e instanceof Error ? e.message : "No se pudo unir a la liga.");
    } finally {
      setBusyJoin(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Crear / unirse */}
      <div className="section-grid">
        <Card style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontWeight: 700 }}>Crear una liga</div>
          <p style={{ color: "var(--text-dim)", fontSize: "0.86rem", margin: 0 }}>
            Le ponés nombre y te damos un código para invitar a tus amigos. Podés crear
            hasta {MAX_OWNED}.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              className="input"
              placeholder="Nombre de la liga"
              value={name}
              maxLength={30}
              disabled={atOwnedLimit || busyCreate}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              style={{ flex: 1, minWidth: 160 }}
            />
            <Button variant="gold" disabled={atOwnedLimit || busyCreate || !name.trim()} onClick={handleCreate}>
              {busyCreate ? "Creando…" : "Crear liga"}
            </Button>
          </div>
          {atOwnedLimit && (
            <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
              Ya creaste el máximo de {MAX_OWNED} ligas.
            </span>
          )}
          {createErr && <span className="field-err">{createErr}</span>}
        </Card>

        <Card style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontWeight: 700 }}>Unirme con código</div>
          <p style={{ color: "var(--text-dim)", fontSize: "0.86rem", margin: 0 }}>
            ¿Te pasaron un código? Pegalo acá para unirte a la liga.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              className="input"
              placeholder="Q-3XF65"
              value={code}
              disabled={busyJoin}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              style={{ flex: 1, minWidth: 140, textTransform: "uppercase" }}
            />
            <Button variant="outline" disabled={busyJoin || !code.trim()} onClick={handleJoin}>
              {busyJoin ? "Uniéndome…" : "Unirme"}
            </Button>
          </div>
          {joinErr && <span className="field-err">{joinErr}</span>}
        </Card>
      </div>

      {/* Lista de ligas */}
      {myLeagues.length === 0 ? (
        <Card style={{ padding: 28, textAlign: "center", display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: "2rem" }}>🏆</span>
          <div style={{ fontWeight: 700 }}>Todavía no estás en ninguna liga</div>
          <p style={{ color: "var(--text-dim)", margin: 0, fontSize: "0.9rem" }}>
            Creá una y compartí el código, o unite con el de un amigo.
          </p>
        </Card>
      ) : (
        myLeagues.map((l) => <LeagueCard key={l.id} league={l} />)
      )}
    </div>
  );
}
