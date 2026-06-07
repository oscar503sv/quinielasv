import { flagUrl } from "@/lib/utils";

export function Footer() {
  return (
    <footer
      style={{
        flexShrink: 0,
        borderTop: "1px solid var(--border)",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          width: "100%",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
          fontSize: "0.84rem",
          color: "var(--text-dim)",
        }}
      >
        <span>Quiniela Mundialista</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span>Hecho desde</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={flagUrl("sv")}
            alt="El Salvador"
            width={20}
            height={14}
            style={{ borderRadius: 3, objectFit: "cover", boxShadow: "0 0 0 1px var(--border)" }}
          />
          <strong style={{ color: "var(--gold)" }}>2026</strong>
        </span>
      </div>
    </footer>
  );
}
