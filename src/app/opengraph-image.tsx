import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Quiniela Mundial 2026 — Pronosticá el Mundial con los tuyos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logo = await readFile(join(process.cwd(), "public/quinielasv-logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 26,
          padding: 72,
          color: "#eaf1fb",
          background: "#0a1830",
          backgroundImage:
            "radial-gradient(1100px 750px at 84% -16%, #16345f 0%, rgba(10,24,48,0) 60%)",
        }}
      >
        <img
          src={logoSrc}
          alt=""
          width={196}
          height={196}
          style={{ borderRadius: 28 }}
        />

        <div style={{ display: "flex", gap: 18, fontSize: 74, fontWeight: 800, letterSpacing: -1 }}>
          <span>Quiniela Mundial</span>
          <span style={{ color: "#f2c14e" }}>2026</span>
        </div>

        <div style={{ display: "flex", fontSize: 34, color: "rgba(234,241,251,0.72)" }}>
          Pronosticá el Mundial y picate con los tuyos
        </div>

        <div style={{ display: "flex", gap: 14, marginTop: 6 }}>
          {["Pronósticos", "Ligas privadas", "Ranking"].map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                fontSize: 26,
                color: "#f2c14e",
                padding: "8px 22px",
                borderRadius: 999,
                border: "2px solid rgba(242,193,78,0.40)",
                background: "rgba(242,193,78,0.10)",
              }}
            >
              {t}
            </div>
          ))}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            fontSize: 26,
            letterSpacing: 1,
            color: "#f2c14e",
          }}
        >
          www.quinielasv.xyz
        </div>
      </div>
    ),
    { ...size },
  );
}
