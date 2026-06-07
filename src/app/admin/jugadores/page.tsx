"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { Flag } from "@/components/ui/Flag";
import { useData } from "@/features/data/DataProvider";
import { useAuth } from "@/features/auth/AuthProvider";
import { deleteUser } from "@/features/admin/admin-client";
import { totalPoints, advanceBonus, resolveAdvancer } from "@/lib/scoring";
import { teamName } from "@/constants/teams";
import { STAGES } from "@/constants/stages";
import type { Match, Prediction } from "@/types";

interface Row {
  uid: string;
  name: string;
  email: string;
  support: string | null;
  champion: string | null;
  predCount: number;
  pts: number;
  position: number;
}

function PlayerPredictions({ predictions, matchById }: { predictions: Prediction[]; matchById: Map<string, Match> }) {
  if (predictions.length === 0) {
    return <p style={{ color: "var(--text-dim)", fontSize: "0.86rem" }}>Sin pronósticos.</p>;
  }
  const rows = [...predictions].sort((a, b) => {
    const ma = matchById.get(a.matchId);
    const mb = matchById.get(b.matchId);
    return (ma?.lockAt ?? 0) - (mb?.lockAt ?? 0);
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {rows.map((p) => {
        const m = matchById.get(p.matchId);
        if (!m) return null;
        const finished = m.status === "finished" && m.result;
        const pts = finished
          ? totalPoints({ home: p.home, away: p.away }, m.result!, m.stage) +
            advanceBonus(resolveAdvancer(m.home, m.away, { home: p.home, away: p.away }, p.advances), m.advances)
          : null;
        return (
          <div
            key={p.matchId}
            style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.84rem", flexWrap: "wrap" }}
          >
            <Pill tone="dim">{STAGES[m.stage].label}</Pill>
            <Flag code={m.home} w={22} h={15} r={3} />
            <span className="tabular" style={{ fontWeight: 700 }}>{p.home}–{p.away}</span>
            <Flag code={m.away} w={22} h={15} r={3} />
            <span style={{ color: "var(--text-faint)" }}>
              {teamName(m.home)} vs {teamName(m.away)}
            </span>
            {finished && (
              <span style={{ marginLeft: "auto", color: pts ? "var(--gold)" : "var(--text-faint)", fontWeight: 700 }}>
                +{pts}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AdminJugadoresPage() {
  const { users, predictions, standings, matches, loading } = useData();
  const { uid: myUid } = useAuth();
  const [query, setQuery] = useState("");
  const [openUid, setOpenUid] = useState<string | null>(null);
  const [busyUid, setBusyUid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const matchById = useMemo(() => {
    const map = new Map<string, Match>();
    for (const m of matches) map.set(m.id, m);
    return map;
  }, [matches]);

  const predsByUser = useMemo(() => {
    const map = new Map<string, Prediction[]>();
    for (const p of predictions) {
      const arr = map.get(p.userId) ?? [];
      arr.push(p);
      map.set(p.userId, arr);
    }
    return map;
  }, [predictions]);

  const rows = useMemo<Row[]>(() => {
    const posByUid = new Map(standings.map((s, i) => [s.userId, { pts: s.pts, pos: i + 1 }]));
    const list = users.map((u) => {
      const st = posByUid.get(u.id);
      return {
        uid: u.id,
        name: u.name,
        email: u.email,
        support: u.support,
        champion: u.championPrediction,
        predCount: predsByUser.get(u.id)?.length ?? 0,
        pts: st?.pts ?? 0,
        position: st?.pos ?? standings.length,
      };
    });
    const q = query.trim().toLowerCase();
    const filtered = q
      ? list.filter((r) => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q))
      : list;
    return filtered.sort((a, b) => a.position - b.position);
  }, [users, standings, predsByUser, query]);

  async function onDelete(row: Row) {
    const ok = window.confirm(
      `Eliminar a "${row.name}" borrará su cuenta, su perfil y sus ${row.predCount} pronóstico(s). Esta acción no se puede deshacer. ¿Continuar?`,
    );
    if (!ok) return;
    setBusyUid(row.uid);
    setError(null);
    try {
      await deleteUser(row.uid);
      // La suscripción de usuarios refresca la lista sola.
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo eliminar.");
    } finally {
      setBusyUid(null);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <Pill tone="gold">ADMIN</Pill>
        <h1 style={{ fontSize: "1.8rem", margin: "8px 0 0" }}>Jugadores</h1>
        <p style={{ color: "var(--text-dim)", marginTop: 4, maxWidth: 640 }}>
          {users.length} jugador{users.length === 1 ? "" : "es"} registrado{users.length === 1 ? "" : "s"}.
          Revisá sus pronósticos y, si hace falta, eliminá una cuenta.
        </p>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por nombre o correo…"
        className="input"
        style={{ maxWidth: 360 }}
      />

      {error && <span className="field-err">{error}</span>}

      {loading ? (
        <p style={{ color: "var(--text-dim)" }}>Cargando…</p>
      ) : rows.length === 0 ? (
        <p style={{ color: "var(--text-dim)" }}>No hay jugadores que coincidan.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rows.map((row) => {
            const open = openUid === row.uid;
            const isMe = row.uid === myUid;
            return (
              <Card key={row.uid} style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <span className="tabular" style={{ color: "var(--text-faint)", width: 28, fontWeight: 700 }}>
                    {row.position}º
                  </span>
                  <Flag code={row.support} w={30} h={20} r={4} />
                  <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <span style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                      {row.name}
                      {isMe && <Pill tone="gold">vos</Pill>}
                    </span>
                    <span style={{ color: "var(--text-faint)", fontSize: "0.8rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {row.email}
                    </span>
                  </div>

                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", color: "var(--text-dim)" }}>
                      Campeón:
                      {row.champion ? (
                        <>
                          <Flag code={row.champion} w={20} h={14} r={3} />
                          {teamName(row.champion)}
                        </>
                      ) : (
                        <span style={{ color: "var(--text-faint)" }}>—</span>
                      )}
                    </span>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-dim)" }}>{row.predCount} pron.</span>
                    <span className="tabular" style={{ fontWeight: 800, color: "var(--gold)" }}>{row.pts} pts</span>
                    <Button variant="outline" onClick={() => setOpenUid(open ? null : row.uid)}>
                      {open ? "Ocultar" : "Ver"}
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={isMe || busyUid === row.uid}
                      onClick={() => onDelete(row)}
                      title={isMe ? "No podés eliminarte a vos mismo" : "Eliminar jugador"}
                    >
                      {busyUid === row.uid ? "Eliminando…" : "Eliminar"}
                    </Button>
                  </div>
                </div>

                {open && (
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                    <PlayerPredictions predictions={predsByUser.get(row.uid) ?? []} matchById={matchById} />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
