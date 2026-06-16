import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import {
  onDocumentCreated,
  onDocumentUpdated,
} from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions/v2";
import { loadTeams, sendNotification } from "./notify";

initializeApp();
const db = getFirestore();

const TZ = "America/El_Salvador";
const KICKOFF_OFFSET_MS = 5 * 60 * 1000; // kickoff = lockAt + 5 min
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

const teamLabel = (teams: Record<string, string>, home: string, away: string) =>
  `${teams[home] ?? home} vs ${teams[away] ?? away}`;

/**
 * Cada 15 min: a quien NO haya pronosticado un partido cuyo inicio cae en los
 * próximos ~15–35 min, le manda un recordatorio. Id determinista por partido.
 */
export const scheduledMatchReminders = onSchedule(
  { schedule: "every 15 minutes", timeZone: TZ },
  async () => {
    const now = Date.now();
    const windowStart = now + 15 * 60 * 1000;
    const windowEnd = now + 35 * 60 * 1000;

    const matchesSnap = await db
      .collection("matches")
      .where("status", "==", "upcoming")
      .get();
    const due = matchesSnap.docs.filter((d) => {
      const kickoff = (d.data().lockAt as number) + KICKOFF_OFFSET_MS;
      return kickoff >= windowStart && kickoff <= windowEnd;
    });
    if (due.length === 0) return;

    const [usersSnap, teams] = await Promise.all([
      db.collection("users").get(),
      loadTeams(),
    ]);

    for (const m of due) {
      const md = m.data();
      const label = teamLabel(teams, md.home, md.away);
      for (const u of usersSnap.docs) {
        const predSnap = await db
          .collection("predictions")
          .doc(`${u.id}_${m.id}`)
          .get();
        if (predSnap.exists) continue; // ya pronosticó
        await sendNotification(u.id, {
          id: `reminder30_${m.id}`,
          type: "reminder30",
          title: "¡Falta poco!",
          body: `En ~30 min juega ${label} y todavía no pronosticaste.`,
          link: "/partidos",
        });
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
  },
);

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
