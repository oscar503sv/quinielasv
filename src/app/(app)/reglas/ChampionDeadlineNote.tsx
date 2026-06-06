"use client";

import { useData } from "@/features/data/DataProvider";
import { isChampionOpen } from "@/lib/champion";

/** Nota dinámica con el cierre real de elección de campeón (si está definido). */
export function ChampionDeadlineNote() {
  const { tournament } = useData();
  const lock = tournament?.championLockAt ?? null;
  if (!lock) return null;

  const open = isChampionOpen(tournament);
  const date = new Intl.DateTimeFormat("es", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(lock));

  return (
    <div
      style={{
        marginTop: 4,
        padding: "10px 14px",
        borderRadius: 12,
        border: "1px solid var(--border)",
        background: "var(--surface-2)",
        fontSize: "0.88rem",
        color: "var(--text-dim)",
      }}
    >
      {open ? (
        <>
          ⏰ Podés elegir o cambiar tu campeón hasta el{" "}
          <strong style={{ color: "var(--text)" }}>{date}</strong>.
        </>
      ) : (
        <>🔒 El plazo para elegir campeón ya cerró ({date}).</>
      )}
    </div>
  );
}
