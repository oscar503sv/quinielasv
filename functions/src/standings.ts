/**
 * Cálculo del top del ranking dentro de las Functions, replicando el orden de
 * `src/services/standings.service.ts` pero LEYENDO los campos ya persistidos por
 * finalizeMatch (`pointsEarned` y `basePoints`) en vez de recalcular el scoring.
 * Se usa solo para detectar cambios de líder; no se persiste nada.
 */

/** Bono por acertar el campeón (igual que src/lib/scoring.ts). */
const CHAMPION_BONUS = 25;

export interface UserLite {
  id: string;
  name: string;
  championPrediction: string | null;
}

export interface PredictionLite {
  userId: string;
  matchId: string;
  /** Solo presente en partidos finalizados (lo escribe finalizeMatch). */
  pointsEarned?: number;
  basePoints?: number;
}

interface Row {
  userId: string;
  name: string;
  pts: number;
  exact: number;
  gd: number;
  miss: number;
  played: number;
}

const hitRate = (r: Row): number =>
  r.played > 0 ? (r.played - r.miss) / r.played : 0;

/**
 * Devuelve la fila del 1.º del ranking (o null si no hay usuarios). `champion`
 * es el código del campeón oficial (o null) para sumar el bono. `excludeMatchId`
 * recalcula como si ese partido no se hubiera finalizado (para el "antes").
 */
export function computeTop(
  users: UserLite[],
  predictions: PredictionLite[],
  champion: string | null,
  excludeMatchId?: string,
): Row | null {
  const byUser = new Map<string, Row>();
  for (const u of users) {
    const wonBonus = champion !== null && u.championPrediction === champion;
    byUser.set(u.id, {
      userId: u.id,
      name: u.name,
      pts: wonBonus ? CHAMPION_BONUS : 0,
      exact: 0,
      gd: 0,
      miss: 0,
      played: 0,
    });
  }

  for (const p of predictions) {
    if (excludeMatchId && p.matchId === excludeMatchId) continue;
    if (typeof p.pointsEarned !== "number") continue; // partido no finalizado
    const row = byUser.get(p.userId);
    if (!row) continue;
    row.pts += p.pointsEarned;
    row.played += 1;
    const base = p.basePoints;
    if (base === 5) row.exact += 1;
    else if (base === 3) row.gd += 1;
    else if (base !== 1) row.miss += 1; // 0 (o ausente) = fallo; 1 = tendencia
  }

  const rows = [...byUser.values()].sort(
    (a, b) =>
      b.pts - a.pts ||
      b.exact - a.exact ||
      b.gd - a.gd ||
      hitRate(b) - hitRate(a) ||
      a.name.localeCompare(b.name),
  );
  return rows[0] ?? null;
}
