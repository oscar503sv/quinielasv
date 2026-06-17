import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import {
  onDocumentCreated,
  onDocumentUpdated,
} from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions/v2";
import { loadTeams, sendNotification } from "./notify";
import { computeTop, type PredictionLite, type UserLite } from "./standings";

initializeApp();
const db = getFirestore();

const TZ = "America/El_Salvador";
const KICKOFF_OFFSET_MS = 5 * 60 * 1000; // kickoff = lockAt + 5 min
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
const MIN = 60 * 1000;
const CHAMPION_URGENT_WINDOW_MS = 6 * 60 * 60 * 1000; // 6 h antes del cierre

const teamLabel = (teams: Record<string, string>, home: string, away: string) =>
  `${teams[home] ?? home} vs ${teams[away] ?? away}`;

/**
 * Cada 15 min, en una sola pasada, evalúa cada partido `upcoming` contra tres
 * ventanas independientes según su kickoff (`lockAt + 5min`):
 *  - 1 h antes  [+50, +70 min] → a quien NO pronosticó (`reminder60`).
 *  - 30 min antes [+15, +35 min] → a quien NO pronosticó (`reminder30`).
 *  - al kickoff [0, +20 min] → a quien SÍ pronosticó (`kickoff`).
 * Los ids deterministas por partido evitan duplicados entre corridas. El solape
 * parcial de ventanas es inofensivo: las audiencias son disjuntas.
 */
export const scheduledMatchReminders = onSchedule(
  { schedule: "every 15 minutes", timeZone: TZ },
  async () => {
    const now = Date.now();
    const inWindow = (kickoff: number, fromMin: number, toMin: number) =>
      kickoff >= now + fromMin * MIN && kickoff <= now + toMin * MIN;

    const matchesSnap = await db
      .collection("matches")
      .where("status", "==", "upcoming")
      .get();
    const due = matchesSnap.docs
      .map((d) => ({ id: d.id, data: d.data() }))
      .filter((m) => {
        const kickoff = (m.data.lockAt as number) + KICKOFF_OFFSET_MS;
        return (
          inWindow(kickoff, 50, 70) ||
          inWindow(kickoff, 15, 35) ||
          inWindow(kickoff, 0, 20)
        );
      });
    if (due.length === 0) return;

    const [usersSnap, teams] = await Promise.all([
      db.collection("users").get(),
      loadTeams(),
    ]);

    for (const m of due) {
      const kickoff = (m.data.lockAt as number) + KICKOFF_OFFSET_MS;
      const label = teamLabel(teams, m.data.home, m.data.away);

      // Quiénes ya pronosticaron este partido (una sola query).
      const predsSnap = await db
        .collection("predictions")
        .where("matchId", "==", m.id)
        .get();
      const predicted = new Set(
        predsSnap.docs.map((p) => p.data().userId as string),
      );

      for (const u of usersSnap.docs) {
        const has = predicted.has(u.id);
        if (!has && inWindow(kickoff, 50, 70)) {
          await sendNotification(u.id, {
            id: `reminder60_${m.id}`,
            type: "reminder60",
            title: "Falta 1 hora",
            body: `En ~1 hora juega ${label} y todavía no pronosticaste.`,
            link: "/partidos",
          });
        }
        if (!has && inWindow(kickoff, 15, 35)) {
          await sendNotification(u.id, {
            id: `reminder30_${m.id}`,
            type: "reminder30",
            title: "¡Falta poco!",
            body: `En ~30 min juega ${label} y todavía no pronosticaste.`,
            link: "/partidos",
          });
        }
        if (has && inWindow(kickoff, 0, 20)) {
          await sendNotification(u.id, {
            id: `kickoff_${m.id}`,
            type: "kickoff",
            title: "¡Empieza tu partido!",
            body: `${label} está por comenzar. ¡Seguilo en vivo!`,
            link: "/partidos",
          });
        }
      }
    }
    logger.info(`Recordatorios procesados para ${due.length} partido(s).`);
  },
);

/**
 * Cada 3 días: a quien no haya elegido campeón o equipo del corazón, recordatorio.
 * Solo mientras el torneo no terminó y el deadline de campeón no pasó.
 */
export const scheduledChampionReminders = onSchedule(
  { schedule: "every 72 hours", timeZone: TZ },
  async () => {
    const tSnap = await db.doc("tournament/config").get();
    const t = tSnap.data() ?? {};
    if (t.finished === true) return;
    const lockAt = t.championLockAt as number | null | undefined;
    if (typeof lockAt === "number" && lockAt < Date.now()) return;

    const bucket = Math.floor(Date.now() / THREE_DAYS_MS);
    const usersSnap = await db.collection("users").get();

    for (const u of usersSnap.docs) {
      const ud = u.data();
      const missingChampion = !ud.championPrediction;
      const missingSupport = !ud.support;
      if (!missingChampion && !missingSupport) continue;

      const what =
        missingChampion && missingSupport
          ? "tu campeón ni tu equipo del corazón"
          : missingChampion
            ? "tu campeón"
            : "tu equipo del corazón";

      await sendNotification(u.id, {
        id: `champion_${bucket}`,
        type: "champion",
        title: "Completá tu quiniela",
        body: `Todavía no elegiste ${what}. ¡No te quedés sin el bono!`,
        link: "/perfil",
      });
    }
  },
);

/**
 * Cada hora: si el cierre para elegir campeón (`championLockAt`) cae dentro de
 * las próximas 6 h, manda un aviso urgente a quien aún no eligió campeón. Id
 * ligado al deadline → un solo aviso por cierre (si el admin lo mueve, reenvía).
 */
export const scheduledChampionDeadline = onSchedule(
  { schedule: "every 60 minutes", timeZone: TZ },
  async () => {
    const tSnap = await db.doc("tournament/config").get();
    const t = tSnap.data() ?? {};
    if (t.finished === true) return;
    const lockAt = t.championLockAt as number | null | undefined;
    if (typeof lockAt !== "number") return;

    const now = Date.now();
    if (lockAt <= now || lockAt > now + CHAMPION_URGENT_WINDOW_MS) return;

    const usersSnap = await db.collection("users").get();
    for (const u of usersSnap.docs) {
      if (u.data().championPrediction) continue; // ya eligió campeón
      await sendNotification(u.id, {
        id: `champion_urgent_${lockAt}`,
        type: "champion",
        title: "Último llamado para tu campeón",
        body: "El cierre para elegir campeón es muy pronto. ¡Elegí antes de que cierre!",
        link: "/campeon",
      });
    }
  },
);

/**
 * Al finalizar un partido (status → finished), avisa a cada usuario con
 * pronóstico cuántos puntos sumó. Lee `pointsEarned` ya persistido por
 * finalizeMatch (no recalcula). Ignora correcciones (ya estaba finished).
 */
export const onMatchFinished = onDocumentUpdated(
  "matches/{id}",
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;
    if (before.status === "finished" || after.status !== "finished") return;

    const matchId = event.params.id;
    const teams = await loadTeams();
    const label = teamLabel(teams, after.home, after.away);
    const score = after.result
      ? `${after.result.home}–${after.result.away}`
      : "";

    const predsSnap = await db
      .collection("predictions")
      .where("matchId", "==", matchId)
      .get();

    for (const p of predsSnap.docs) {
      const pd = p.data();
      const pts = (pd.pointsEarned as number) ?? 0;
      const body =
        pts > 0
          ? `${label} (${score}): sumaste ${pts} ${pts === 1 ? "punto" : "puntos"}. 🎉`
          : `${label} (${score}): no sumaste puntos esta vez.`;
      await sendNotification(pd.userId as string, {
        id: `points_${matchId}`,
        type: "points",
        title: "Resultado de tu pronóstico",
        body,
        link: "/partidos",
      });
    }

    await notifyLeaderChange(matchId);
  },
);

/**
 * Tras finalizar un partido, detecta si cambió el 1.º del ranking por su culpa.
 * Recalcula el top "después" (estado actual) y "antes" (excluyendo este partido)
 * leyendo `pointsEarned`/`basePoints` ya persistidos. Si cambió y el nuevo líder
 * tiene puntos, avisa a todos. Id determinista por partido → un solo aviso.
 */
async function notifyLeaderChange(matchId: string): Promise<void> {
  const [usersSnap, predsSnap, tSnap] = await Promise.all([
    db.collection("users").get(),
    db.collection("predictions").get(),
    db.doc("tournament/config").get(),
  ]);

  const users: UserLite[] = usersSnap.docs.map((u) => ({
    id: u.id,
    name: (u.data().name as string) ?? u.id,
    championPrediction: (u.data().championPrediction as string | null) ?? null,
  }));
  const predictions: PredictionLite[] = predsSnap.docs.map((p) => {
    const d = p.data();
    return {
      userId: d.userId as string,
      matchId: d.matchId as string,
      pointsEarned: d.pointsEarned as number | undefined,
      basePoints: d.basePoints as number | undefined,
    };
  });
  const champion = (tSnap.data()?.champion as string | null) ?? null;

  const after = computeTop(users, predictions, champion);
  const before = computeTop(users, predictions, champion, matchId);
  if (!after || after.pts <= 0) return;
  if (before && before.userId === after.userId) return; // no cambió

  for (const u of users) {
    const body =
      u.id === after.userId
        ? "¡Tomaste el primer lugar del ranking! 👑"
        : `${after.name} tomó el primer lugar del ranking.`;
    await sendNotification(u.id, {
      id: `leader_${matchId}`,
      type: "leader",
      title: "Nuevo líder 👑",
      body,
      link: "/ranking",
    });
  }
}

/**
 * (Extra) Al agregar un partido nuevo con el torneo ya iniciado, avisa a todos.
 * No notifica durante el armado inicial del fixture (torneo aún no iniciado).
 */
export const onMatchCreated = onDocumentCreated(
  "matches/{id}",
  async (event) => {
    const m = event.data?.data();
    if (!m) return;

    const tSnap = await db.doc("tournament/config").get();
    if (tSnap.data()?.started !== true) return;

    const matchId = event.params.id;
    const teams = await loadTeams();
    const label = teamLabel(teams, m.home, m.away);
    const usersSnap = await db.collection("users").get();

    for (const u of usersSnap.docs) {
      await sendNotification(u.id, {
        id: `newmatch_${matchId}`,
        type: "newmatch",
        title: "Nuevo partido",
        body: `Se agregó ${label}. ¡Hacé tu pronóstico!`,
        link: "/partidos",
      });
    }
  },
);
