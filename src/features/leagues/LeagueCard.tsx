"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { Flag } from "@/components/ui/Flag";
import { useAuth } from "@/features/auth/AuthProvider";
import { useData } from "@/features/data/DataProvider";
import { computeStandings } from "@/services/standings.service";
import {
  deleteLeague,
  kickMember,
  leaveLeague,
  renameLeague,
} from "./leagues-client";
import type { League } from "@/types";

export function LeagueCard({ league }: { league: League }) {
  const { uid } = useAuth();
  const { matches, predictions, users, tournament } = useData();
  const isOwner = league.ownerUid === uid;

  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(league.name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const standings = useMemo(() => {
    const set = new Set(league.memberUids);
    const members = users.filter((u) => set.has(u.id));
    return computeStandings(matches, predictions, members, uid ?? undefined, tournament);
  }, [league.memberUids, users, matches, predictions, uid, tournament]);

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo completar la acción.");
    } finally {
      setBusy(false);
    }
  }

  function copyCode() {
    navigator.clipboard?.writeText(league.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <Card style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        {editing ? (
          <>
            <input
              className="input"
              value={nameDraft}
              maxLength={30}
              onChange={(e) => setNameDraft(e.target.value)}
              style={{ flex: 1, minWidth: 160 }}
            />
            <Button
              variant="gold"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  await renameLeague(league.id, nameDraft);
                  setEditing(false);
                })
              }
            >
              Guardar
            </Button>
            <Button variant="ghost" disabled={busy} onClick={() => { setEditing(false); setNameDraft(league.name); }}>
              Cancelar
            </Button>
          </>
        ) : (
          <>
            <h3 style={{ margin: 0, fontSize: "1.1rem", flex: 1, minWidth: 0 }}>{league.name}</h3>
            <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
              {league.memberUids.length} {league.memberUids.length === 1 ? "miembro" : "miembros"}
            </span>
          </>
        )}
      </div>

      {/* Código + acciones */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={copyCode}
          className="card"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 12px",
            cursor: "pointer",
            background: "var(--surface-2)",
          }}
          title="Copiar código"
        >
          <span style={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>Código</span>
          <strong className="tabular" style={{ color: "var(--gold)", letterSpacing: "0.04em" }}>{league.code}</strong>
          <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>{copied ? "¡Copiado! ✓" : "📋"}</span>
        </button>
        <span style={{ flex: 1 }} />
        {isOwner ? (
          !editing && (
            <>
              <Button variant="ghost" disabled={busy} onClick={() => setEditing(true)}>Renombrar</Button>
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() => {
                  if (confirm(`¿Borrar la liga "${league.name}"? No se puede deshacer.`)) {
                    run(() => deleteLeague(league.id));
                  }
                }}
                style={{ color: "var(--bad)" }}
              >
                Borrar
              </Button>
            </>
          )
        ) : (
          <Button
            variant="ghost"
            disabled={busy}
            onClick={() => {
              if (confirm(`¿Salir de "${league.name}"?`)) run(() => leaveLeague(league.id));
            }}
            style={{ color: "var(--bad)" }}
          >
            Salir
          </Button>
        )}
      </div>

      {error && <span className="field-err">{error}</span>}

      {/* Tabla de posiciones */}
      <table className="rank-table" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>#</th>
            <th>Jugador</th>
            <th style={{ textAlign: "right" }}>
              <span className="col-full">Puntos</span><span className="col-abbr">Pts</span>
            </th>
            {isOwner && <th />}
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => (
            <tr
              key={s.userId}
              style={{
                borderTop: "1px solid var(--border)",
                background: s.me ? "var(--gold-soft)" : "transparent",
              }}
            >
              <td className="tabular" style={{ fontWeight: 700, color: "var(--text-dim)" }}>{i + 1}</td>
              <td>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
                  <Flag code={s.support} w={24} h={17} r={4} />
                  <span style={{ fontWeight: 600 }}>{s.name}</span>
                  {s.me && <Pill tone="gold">tú</Pill>}
                  {s.userId === league.ownerUid && <Pill tone="dim">dueño</Pill>}
                </span>
              </td>
              <td className="display tabular" style={{ textAlign: "right" }}>{s.pts}</td>
              {isOwner && (
                <td style={{ textAlign: "right" }}>
                  {s.userId !== league.ownerUid && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        if (confirm(`¿Expulsar a ${s.name}?`)) run(() => kickMember(league.id, s.userId));
                      }}
                      title="Expulsar"
                      style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-faint)", fontSize: "1rem" }}
                    >
                      ✕
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
