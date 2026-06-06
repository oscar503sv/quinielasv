import { totalPoints, basePoints, CHAMPION_BONUS } from "@/lib/scoring";
import type { Match, Prediction, Standing, Tournament, User } from "@/types";

/** Tasa de aciertos = pronósticos con puntos (5/3/1) sobre los hechos. */
const hitRate = (s: Standing): number =>
  s.played > 0 ? (s.played - s.miss) / s.played : 0;

/**
 * Calcula el ranking/estadísticas on-the-fly desde los partidos finalizados,
 * los pronósticos y los usuarios. Función pura (testeable y reusable).
 * Si el torneo tiene `champion` definido, suma el bono del campeón a quienes
 * lo acertaron.
 *
 * Desempate: puntos → más marcadores exactos → más diferencias exactas →
 * mejor % de aciertos → orden alfabético (fallback determinista).
 */
export function computeStandings(
  matches: Match[],
  predictions: Prediction[],
  users: User[],
  meUid?: string,
  tournament?: Tournament | null,
): Standing[] {
  const finished = new Map<string, Match>();
  for (const m of matches) {
    if (m.status === "finished" && m.result) finished.set(m.id, m);
  }

  const champion = tournament?.champion ?? null;
  const byUser = new Map<string, Standing>();
  for (const u of users) {
    const wonBonus = champion !== null && u.championPrediction === champion;
    byUser.set(u.id, {
      userId: u.id,
      name: u.name,
      support: u.support,
      pts: wonBonus ? CHAMPION_BONUS : 0,
      exact: 0,
      gd: 0,
      trend: 0,
      miss: 0,
      played: 0,
      championBonus: wonBonus,
      me: u.id === meUid,
    });
  }

  for (const p of predictions) {
    const match = finished.get(p.matchId);
    if (!match || !match.result) continue;
    const row = byUser.get(p.userId);
    if (!row) continue;

    const pred = { home: p.home, away: p.away };
    const base = basePoints(pred, match.result);
    row.pts += totalPoints(pred, match.result, match.stage);
    row.played += 1;
    if (base === 5) row.exact += 1;
    else if (base === 3) row.gd += 1;
    else if (base === 1) row.trend += 1;
    else row.miss += 1;
  }

  return [...byUser.values()].sort(
    (a, b) =>
      b.pts - a.pts ||
      b.exact - a.exact ||
      b.gd - a.gd ||
      hitRate(b) - hitRate(a) ||
      a.name.localeCompare(b.name),
  );
}

export function positionOf(standings: Standing[], uid: string): number {
  const idx = standings.findIndex((s) => s.userId === uid);
  return idx === -1 ? standings.length : idx + 1;
}
