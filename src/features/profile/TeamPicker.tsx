"use client";

import { Flag } from "@/components/ui/Flag";
import { TEAMS } from "@/constants/teams";

interface TeamPickerProps {
  selected: string | null;
  onSelect: (code: string) => void;
}

/** Grid de las 48 selecciones; la elegida se resalta con borde dorado + ✓. */
export function TeamPicker({ selected, onSelect }: TeamPickerProps) {
  return (
    <div className="team-grid">
      {TEAMS.map((t) => {
        const active = t.code === selected;
        return (
          <button
            key={t.code}
            type="button"
            onClick={() => onSelect(t.code)}
            className="card"
            style={{
              padding: "12px 10px",
              display: "flex",
              alignItems: "center",
              gap: 9,
              cursor: "pointer",
              textAlign: "left",
              borderColor: active ? "var(--gold-border)" : "var(--border)",
              background: active ? "var(--gold-soft)" : "var(--surface)",
            }}
          >
            <Flag code={t.code} w={30} h={21} r={4} />
            <span style={{ fontWeight: 600, fontSize: "0.88rem", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {t.name}
            </span>
            {active && <span style={{ color: "var(--gold)", fontWeight: 800 }}>✓</span>}
          </button>
        );
      })}
    </div>
  );
}
