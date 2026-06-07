"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { Flag } from "@/components/ui/Flag";
import { useData } from "@/features/data/DataProvider";
import { computeStandings } from "@/services/standings.service";
import { listLeagues, renameLeagueAdmin, deleteLeagueAdmin } from "@/features/admin/admin-client";
import type { League, User } from "@/types";

function fmtDate(ms: number): string {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("es-SV", { day: "2-digit", month: "short", year: "numeric" });
}

function LeagueRow({
  league,
  usersById,
  onChanged,
}: {
  league: League;
  usersById: Map<string, User>;
  onChanged: () => void;
}) {
  const { matches, predictions, users, tournament } = useData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(league.name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const owner = usersById.get(league.ownerUid);

  const standings = useMemo(() => {
    const set = new Set(league.memberUids);
    const members = users.filter((u) => set.has(u.id));
    return computeStandings(matches, predictions, members, undefined, tournament);
  }, [league.memberUids, users, matches, predictions, tournament]);

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo completar la acción.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
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
              onClick={() => run(async () => {
                await renameLeagueAdmin(league.id, nameDraft);
                setEditing(false);
              })}
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
            <strong className="tabular" style={{ color: "var(--gold)", letterSpacing: "0.04em" }}>{league.code}</strong>
          </>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", fontSize: "0.84rem", color: "var(--text-dim)" }}>
        <span>Dueño: <strong style={{ color: "var(--text)" }}>{owner?.name ?? "Desconocido"}</strong></span>
        <span>{league.memberUids.length} miembro{league.memberUids.length === 1 ? "" : "s"}</span>
        <span>Creada {fmtDate(league.createdAt)}</span>
        <span style={{ flex: 1 }} />
        <Button variant="outline" onClick={() => setOpen((v) => !v)}>{open ? "Ocultar" : "Ver"}</Button>
        {!editing && (
          <>
            <Button variant="ghost" disabled={busy} onClick={() => setEditing(true)}>Renombrar</Button>
            <Button
              variant="ghost"
              disabled={busy}
              style={{ color: "var(--bad)" }}
              onClick={() => {
                if (window.confirm(`¿Borrar la liga "${league.name}"? No se puede deshacer.`)) {
                  run(() => deleteLeagueAdmin(league.id));
                }
              }}
            >
              {busy ? "…" : "Borrar"}
            </Button>
          </>
        )}
      </div>

      {error && <span className="field-err">{error}</span>}

      {open && (
        <table className="rank-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>#</th>
              <th>Jugador</th>
              <th style={{ textAlign: "right" }}>Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s, i) => (
              <tr key={s.userId} style={{ borderTop: "1px solid var(--border)" }}>
                <td className="tabular" style={{ fontWeight: 700, color: "var(--text-dim)" }}>{i + 1}</td>
                <td>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
                    <Flag code={s.support} w={24} h={17} r={4} />
                    <span style={{ fontWeight: 600 }}>{s.name}</span>
                    {s.userId === league.ownerUid && <Pill tone="dim">dueño</Pill>}
                  </span>
                </td>
                <td className="display tabular" style={{ textAlign: "right" }}>{s.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

export default function AdminLigasPage() {
  const { users } = useData();
  const [leagues, setLeagues] = useState<League[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const refetch = useCallback(() => {
    listLeagues()
      .then(setLeagues)
      .catch((e) => setError(e instanceof Error ? e.message : "No se pudieron cargar las ligas."));
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const usersById = useMemo(() => {
    const map = new Map<string, User>();
    for (const u of users) map.set(u.id, u);
    return map;
  }, [users]);

  const visible = useMemo(() => {
    if (!leagues) return [];
    const q = query.trim().toLowerCase();
    if (!q) return leagues;
    return leagues.filter((l) => l.name.toLowerCase().includes(q) || l.code.toLowerCase().includes(q));
  }, [leagues, query]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <Pill tone="gold">ADMIN</Pill>
        <h1 style={{ fontSize: "1.8rem", margin: "8px 0 0" }}>Ligas</h1>
        <p style={{ color: "var(--text-dim)", marginTop: 4, maxWidth: 640 }}>
          {leagues ? `${leagues.length} liga${leagues.length === 1 ? "" : "s"} en total. ` : ""}
          Revisá los miembros y la clasificación, o moderá un nombre con renombrar/borrar.
        </p>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por nombre o código…"
        className="input"
        style={{ maxWidth: 360 }}
      />

      {error && <span className="field-err">{error}</span>}

      {leagues === null ? (
        <p style={{ color: "var(--text-dim)" }}>Cargando…</p>
      ) : visible.length === 0 ? (
        <p style={{ color: "var(--text-dim)" }}>
          {leagues.length === 0 ? "Todavía no hay ligas creadas." : "No hay ligas que coincidan."}
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {visible.map((l) => (
            <LeagueRow key={l.id} league={l} usersById={usersById} onChanged={refetch} />
          ))}
        </div>
      )}
    </div>
  );
}
