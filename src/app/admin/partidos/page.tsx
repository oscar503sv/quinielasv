"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { Flag } from "@/components/ui/Flag";
import { MatchForm } from "@/features/admin/MatchForm";
import { useData } from "@/features/data/DataProvider";
import { createMatch, updateMatch, deleteMatch } from "@/features/admin/admin-client";
import { teamName } from "@/constants/teams";
import { STAGES } from "@/constants/stages";
import type { MatchInput } from "@/repositories/admin.server";
import type { Match, MatchStatus } from "@/types";

const STATUS_PILL: Record<MatchStatus, { label: string; tone: "good" | "bad" | "blue" | "dim" }> = {
  finished: { label: "Finalizado", tone: "good" },
  live: { label: "En vivo", tone: "bad" },
  upcoming: { label: "Programado", tone: "blue" },
  locked: { label: "Bloqueado", tone: "dim" },
};

type Editing = { mode: "create" } | { mode: "edit"; match: Match } | null;

export default function AdminPartidosPage() {
  const { matches, loading } = useData();
  const [editing, setEditing] = useState<Editing>(null);
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(m: Match) {
    const ok = window.confirm(
      `¿Eliminar ${teamName(m.home)} vs ${teamName(m.away)}?\n\nSe borrarán también todos los pronósticos de ese partido. Esta acción no se puede deshacer.`,
    );
    if (!ok) return;
    setDeletingId(m.id);
    try {
      await deleteMatch(m.id);
      if (editing?.mode === "edit" && editing.match.id === m.id) setEditing(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSubmit(values: MatchInput) {
    setBusy(true);
    try {
      if (editing?.mode === "edit") {
        await updateMatch(editing.match.id, values);
      } else {
        await createMatch(values);
      }
      setEditing(null);
    } catch (e) {
      // El error se muestra dentro del form vía throw; acá lo dejamos pasar.
      alert(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <Pill tone="gold">ADMIN</Pill>
          <h1 style={{ fontSize: "1.8rem", margin: "8px 0 0" }}>Gestionar partidos</h1>
        </div>
        {!editing && (
          <Button variant="gold" onClick={() => setEditing({ mode: "create" })}>
            ＋ Crear partido
          </Button>
        )}
      </div>

      {editing && (
        <MatchForm
          initial={editing.mode === "edit" ? editing.match : null}
          busy={busy}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      )}

      {loading ? (
        <p style={{ color: "var(--text-dim)" }}>Cargando…</p>
      ) : (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--text-dim)", fontSize: "0.76rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                <th style={{ padding: "12px 14px" }}>Partido</th>
                <th style={{ padding: "12px 14px" }}>Fase</th>
                <th style={{ padding: "12px 14px" }}>Fecha</th>
                <th style={{ padding: "12px 14px" }}>Estado</th>
                <th style={{ padding: "12px 14px" }}></th>
              </tr>
            </thead>
            <tbody>
              {matches.map((m) => {
                const sp = STATUS_PILL[m.status];
                return (
                  <tr key={m.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <Flag code={m.home} w={24} h={17} r={3} />
                        <span style={{ fontWeight: 600 }}>{teamName(m.home)}</span>
                        <span style={{ color: "var(--text-faint)" }}>vs</span>
                        <span style={{ fontWeight: 600 }}>{teamName(m.away)}</span>
                        <Flag code={m.away} w={24} h={17} r={3} />
                        {m.result && (
                          <span className="tabular" style={{ color: "var(--gold)", marginLeft: 4 }}>
                            {m.result.home}–{m.result.away}
                          </span>
                        )}
                      </span>
                    </td>
                    <td style={{ padding: "11px 14px", color: "var(--text-dim)", fontSize: "0.86rem" }}>
                      {STAGES[m.stage].label} ·×{STAGES[m.stage].mult}
                    </td>
                    <td style={{ padding: "11px 14px", color: "var(--text-dim)", fontSize: "0.86rem" }}>{m.date}</td>
                    <td style={{ padding: "11px 14px" }}>
                      <Pill tone={sp.tone}>{sp.label}</Pill>
                    </td>
                    <td style={{ padding: "11px 14px", textAlign: "right" }}>
                      <span style={{ display: "inline-flex", gap: 8, justifyContent: "flex-end" }}>
                        <Button variant="outline" onClick={() => setEditing({ mode: "edit", match: m })}>
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          disabled={deletingId === m.id}
                          onClick={() => handleDelete(m)}
                          style={{ color: "var(--bad)" }}
                        >
                          {deletingId === m.id ? "Eliminando…" : "🗑"}
                        </Button>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
