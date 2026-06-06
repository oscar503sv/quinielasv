"use client";

import { cn } from "@/lib/utils";

interface ScoreStepperProps {
  value: number;
  /** Recibe el delta (+1 / −1), nunca el valor absoluto (spec §6.3). */
  onDelta: (delta: 1 | -1) => void;
  disabled?: boolean;
  /** Resalta el marcador en dorado tras guardar. */
  saved?: boolean;
  label?: string;
}

const MIN = 0;
const MAX = 20;

export function ScoreStepper({
  value,
  onDelta,
  disabled,
  saved,
  label,
}: ScoreStepperProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      {label ? (
        <span style={{ fontSize: "0.8rem", color: "var(--text-dim)", fontWeight: 600 }}>
          {label}
        </span>
      ) : null}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          type="button"
          className="step-btn"
          aria-label="Restar"
          disabled={disabled || value <= MIN}
          onClick={() => onDelta(-1)}
        >
          −
        </button>
        <span className={cn("score-box", saved && "saved")}>{value}</span>
        <button
          type="button"
          className="step-btn"
          aria-label="Sumar"
          disabled={disabled || value >= MAX}
          onClick={() => onDelta(1)}
        >
          +
        </button>
      </div>
    </div>
  );
}
