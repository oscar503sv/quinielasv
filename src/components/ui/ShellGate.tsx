"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/features/auth/AuthProvider";
import { useData } from "@/features/data/DataProvider";
import { tournamentOpen } from "@/lib/tournament";
import { Card } from "./Card";

function Banner({ tone, children }: { tone: "gold" | "blue"; children: ReactNode }) {
  const isGold = tone === "gold";
  return (
    <div
      className="card"
      style={{
        padding: "12px 16px",
        marginBottom: 18,
        textAlign: "center",
        fontSize: "0.9rem",
        fontWeight: 600,
        background: isGold ? "var(--gold-soft)" : "var(--surface-2)",
        borderColor: isGold ? "var(--gold-border)" : "var(--border)",
        color: isGold ? "var(--gold)" : "var(--text-dim)",
      }}
    >
      {children}
    </div>
  );
}

/**
 * Gatea las páginas de usuario según el estado del torneo:
 * - si el torneo no está iniciado y no sos admin → pantalla "no abierta";
 * - banner si el torneo está finalizado o los pronósticos están congelados.
 */
export function ShellGate({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth();
  const { tournament, loading } = useData();

  if (!loading && !tournamentOpen(tournament) && !isAdmin) {
    return (
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 40 }}>
        <Card style={{ padding: 32, maxWidth: 440, textAlign: "center", display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ fontSize: "2.4rem" }}>⏳</span>
          <h2 style={{ margin: 0, fontSize: "1.3rem" }}>La quiniela todavía no está abierta</h2>
          <p style={{ color: "var(--text-dim)", margin: 0 }}>
            El administrador está terminando de prepararla. Volvé pronto. ⚽
          </p>
        </Card>
      </div>
    );
  }

  return (
    <>
      {tournament?.finished ? (
        <Banner tone="gold">🏁 Torneo finalizado · el ranking es definitivo</Banner>
      ) : tournament?.predictionsLocked ? (
        <Banner tone="blue">🔒 Los pronósticos están congelados por el administrador</Banner>
      ) : null}
      {children}
    </>
  );
}
