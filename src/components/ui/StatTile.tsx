import type { ReactNode } from "react";
import { Card } from "./Card";

interface StatTileProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  /** Resalta el valor con el color de acento. */
  accent?: boolean;
}

export function StatTile({ label, value, hint, accent }: StatTileProps) {
  return (
    <Card style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
      <span
        style={{
          fontSize: "0.74rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--text-dim)",
        }}
      >
        {label}
      </span>
      <span
        className="display"
        style={{
          fontSize: "1.9rem",
          lineHeight: 1,
          color: accent ? "var(--gold)" : "var(--text)",
        }}
      >
        {value}
      </span>
      {hint ? (
        <span style={{ fontSize: "0.82rem", color: "var(--text-dim)" }}>{hint}</span>
      ) : null}
    </Card>
  );
}
