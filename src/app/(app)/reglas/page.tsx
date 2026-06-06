import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { STAGES } from "@/constants/stages";
import { CHAMPION_BONUS, ADVANCE_BONUS } from "@/lib/scoring";
import { ChampionDeadlineNote } from "./ChampionDeadlineNote";
import type { MatchStage } from "@/types";

export const metadata = { title: "Cómo se juega · Quiniela 2026" };

interface Tier {
  pts: number;
  title: string;
  desc: string;
  color: string;
  pred: string;
  res: string;
}

const TIERS: Tier[] = [
  {
    pts: 5,
    title: "Marcador exacto",
    desc: "Clavaste el resultado tal cual: goles del local y del visitante.",
    color: "var(--gold)",
    pred: "2–1",
    res: "2–1",
  },
  {
    pts: 3,
    title: "Diferencia exacta",
    desc: "Acertaste quién gana y por cuántos goles, pero no el marcador justo.",
    color: "var(--good)",
    pred: "2–1",
    res: "3–2",
  },
  {
    pts: 1,
    title: "Tendencia",
    desc: "Acertaste sólo quién gana (o el empate), no la diferencia.",
    color: "var(--blue)",
    pred: "2–0",
    res: "1–0",
  },
  {
    pts: 0,
    title: "Fallo",
    desc: "Otro resultado. Tranquilo, viene la revancha el próximo partido.",
    color: "var(--bad)",
    pred: "1–2",
    res: "2–0",
  },
];

const TIEBREAKS: { title: string; desc: string }[] = [
  { title: "Más puntos", desc: "El total acumulado en toda la quiniela." },
  { title: "Más marcadores exactos", desc: "Quién clavó más resultados justos (5 pts)." },
  { title: "Más diferencias exactas", desc: "Quién acertó más veces ganador y diferencia (3 pts)." },
  { title: "Mejor porcentaje de aciertos", desc: "Aciertos (5/3/1 pts) sobre el total de pronósticos que hiciste." },
  { title: "Orden alfabético", desc: "Si todo lo anterior empata, por nombre." },
];

const MULT_GROUPS: { mult: number; stages: MatchStage[] }[] = [
  { mult: 1, stages: [] },
  { mult: 2, stages: [] },
  { mult: 3, stages: [] },
];
(Object.keys(STAGES) as MatchStage[]).forEach((s) => {
  const g = MULT_GROUPS.find((m) => m.mult === STAGES[s].mult);
  g?.stages.push(s);
});

function MiniScore({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <span style={{ fontSize: "0.66rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-faint)" }}>
        {label}
      </span>
      <span className="display tabular" style={{ fontSize: "1.4rem", color: color ?? "var(--text)" }}>
        {value}
      </span>
    </div>
  );
}

function Section({ title, eyebrow, children }: { title: string; eyebrow?: string; children: ReactNode }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 style={{ fontSize: "1.3rem", margin: 0 }}>{title}</h2>
      {children}
    </section>
  );
}

export default function ReglasPage() {
  return (
    <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 920 }}>
      {/* Encabezado */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span className="eyebrow">Cómo sumás puntos</span>
        <h1 style={{ fontSize: "2.2rem", margin: 0 }}>El sistema de puntaje 🎯</h1>
        <p style={{ color: "var(--text-dim)", fontSize: "1.05rem", maxWidth: 620 }}>
          Pronosticá el marcador de cada partido. Mientras más cerca quedes del
          resultado real, más puntos sumás. Y cuanto más avanza el Mundial, más
          valen. Acá te lo explicamos de una.
        </p>
      </div>

      {/* Puntos base */}
      <Section eyebrow="Paso 1" title="Puntos base por partido">
        <div className="stat-grid-4">
          {TIERS.map((t) => (
            <Card key={t.pts} style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12, borderColor: "var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="display" style={{ fontSize: "2.6rem", lineHeight: 1, color: t.color }}>
                  {t.pts}
                </span>
                <Pill style={{ borderColor: t.color, color: t.color, background: "transparent" }}>
                  {t.pts === 1 ? "punto" : "puntos"}
                </Pill>
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>{t.title}</div>
                <p style={{ color: "var(--text-dim)", fontSize: "0.86rem", margin: "4px 0 0" }}>{t.desc}</p>
              </div>
              <div
                style={{
                  marginTop: "auto",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 18,
                  padding: "10px 0 2px",
                  borderTop: "1px solid var(--border)",
                }}
              >
                <MiniScore label="Pronóstico" value={t.pred} color={t.color} />
                <span style={{ color: "var(--text-faint)", fontWeight: 700 }}>vs</span>
                <MiniScore label="Resultado" value={t.res} />
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Multiplicadores */}
      <Section eyebrow="Paso 2" title="Multiplicadores por fase">
        <p style={{ color: "var(--text-dim)", marginTop: -4 }}>
          Tus puntos base se multiplican según la fase del partido. Una final pesa
          el triple que un partido de grupos.
        </p>
        <div className="stat-grid">
          {MULT_GROUPS.map((g) => (
            <Card key={g.mult} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span className="display" style={{ fontSize: "2.2rem", color: "var(--gold)" }}>×{g.mult}</span>
                <span style={{ color: "var(--text-dim)", fontSize: "0.86rem" }}>
                  {g.mult === 1 ? "valor normal" : g.mult === 2 ? "doble" : "triple"}
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {g.stages.map((s) => (
                  <Pill key={s} tone="gold">{STAGES[s].label}</Pill>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Bono campeón */}
      <Section eyebrow="Paso 3" title="Bono campeón">
        <Card
          style={{
            padding: 24,
            display: "flex",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
            background: "var(--gold-soft)",
            borderColor: "var(--gold-border)",
          }}
        >
          <span style={{ fontSize: "2.8rem" }}>🏆</span>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>
              +{CHAMPION_BONUS} puntos si acertás el campeón
            </div>
            <p style={{ color: "var(--text-dim)", margin: "4px 0 0", fontSize: "0.92rem" }}>
              Elegí quién creés que va a levantar la copa. Si acertás, se te suman al
              final del torneo. Es independiente de tu equipo del corazón.
            </p>
          </div>
          <span className="display tabular" style={{ fontSize: "2.6rem", color: "var(--gold)" }}>
            +{CHAMPION_BONUS}
          </span>
        </Card>

        <Card style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontWeight: 700 }}>¿Hasta cuándo podés elegirlo?</div>
          <p style={{ color: "var(--text-dim)", margin: 0, fontSize: "0.92rem" }}>
            Podés elegir tu campeón —y cambiarlo las veces que quieras— hasta{" "}
            <strong style={{ color: "var(--text)" }}>5 minutos antes del partido inaugural</strong>.
            Cuando arranca el Mundial, tu elección queda <strong style={{ color: "var(--text)" }}>bloqueada</strong>:
            no se puede cambiar, y quien se sume después de esa fecha ya no podrá elegir.
            Así que no te durmás. 😉
          </p>
          <ChampionDeadlineNote />
        </Card>
      </Section>

      {/* Eliminatorias: quién avanza */}
      <Section eyebrow="Paso 4" title="Eliminatorias: ¿quién avanza?">
        <Card
          style={{
            padding: 20,
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
            background: "var(--gold-soft)",
            borderColor: "var(--gold-border)",
          }}
        >
          <span style={{ fontSize: "2.4rem" }}>🎯</span>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>
              +{ADVANCE_BONUS} puntos por acertar quién avanza
            </div>
            <p style={{ color: "var(--text-dim)", margin: "4px 0 0", fontSize: "0.92rem" }}>
              En las eliminatorias, además del marcador, elegís qué equipo pasa de ronda (o
              gana, en la final y el 3er puesto). Si acertás, sumás +{ADVANCE_BONUS}.
              <br />
              <strong style={{ color: "var(--text)" }}>Ojo:</strong> el marcador siempre se
              cuenta al final de los <strong style={{ color: "var(--text)" }}>90 minutos</strong>.
              El tiempo extra y los penales no cambian el marcador para los puntos, solo
              definen quién avanza.
            </p>
          </div>
          <span className="display tabular" style={{ fontSize: "2.6rem", color: "var(--gold)" }}>
            +{ADVANCE_BONUS}
          </span>
        </Card>
      </Section>

      {/* Desempate */}
      <Section eyebrow="Paso 5" title="¿Y si hay empate?">
        <p style={{ color: "var(--text-dim)", marginTop: -4 }}>
          Si dos jugadores quedan con los mismos puntos, se desempata en este orden:
        </p>
        <Card style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          {TIEBREAKS.map((t, i) => (
            <div key={t.title} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span
                className="display tabular"
                style={{
                  width: 30,
                  height: 30,
                  flexShrink: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  background: "var(--gold-soft)",
                  border: "1px solid var(--gold-border)",
                  color: "var(--gold)",
                  fontSize: "0.95rem",
                }}
              >
                {i + 1}
              </span>
              <div>
                <div style={{ fontWeight: 700 }}>{t.title}</div>
                <p style={{ color: "var(--text-dim)", fontSize: "0.86rem", margin: "2px 0 0" }}>{t.desc}</p>
              </div>
            </div>
          ))}
        </Card>
      </Section>

      {/* Ejemplo */}
      <Section eyebrow="En la práctica" title="Un ejemplo rápido">
        <Card style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ margin: 0, color: "var(--text-dim)" }}>
            Pronosticaste <strong style={{ color: "var(--text)" }}>2–1</strong> en una{" "}
            <strong style={{ color: "var(--text)" }}>semifinal</strong> y el partido terminó{" "}
            <strong style={{ color: "var(--text)" }}>2–1</strong>:
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <Pill tone="gold">Marcador exacto</Pill>
            <span className="tabular" style={{ color: "var(--text-dim)" }}>5 base</span>
            <span style={{ color: "var(--text-faint)" }}>×</span>
            <Pill tone="gold">Semifinal ×3</Pill>
            <span style={{ color: "var(--text-faint)" }}>=</span>
            <span className="display tabular" style={{ fontSize: "1.8rem", color: "var(--good)" }}>15 puntos 🔥</span>
          </div>
        </Card>
      </Section>
    </div>
  );
}
