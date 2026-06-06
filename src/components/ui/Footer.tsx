export function Footer() {
  const year = new Date().getFullYear();
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
        <span>Quiniela Mundial 2026</span>
        <span>
          Hecho con 💙 por <strong style={{ color: "var(--gold)" }}>Oscar Aragón</strong> · {year}
        </span>
      </div>
    </footer>
  );
}
