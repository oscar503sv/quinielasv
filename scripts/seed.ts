/**
 * Seed de Firestore: teams, matches demo y doc tournament.
 * Uso: npm run seed
 * Requiere credenciales del Admin SDK en .env (FIREBASE_PROJECT_ID,
 * FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).
 */
import "dotenv/config";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { TEAMS } from "../src/constants/teams";
import type { Match } from "../src/types";

function initAdmin() {
  if (getApps().length) return;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Faltan credenciales del Admin SDK en .env (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).",
    );
  }
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

const HOUR = 3600_000;
const now = Date.now();

const MATCHES: Match[] = [
  {
    id: "m01",
    home: "mx",
    away: "ca",
    stage: "group",
    status: "finished",
    date: "Ayer · 18:00",
    lockAt: now - 24 * HOUR,
    result: { home: 2, away: 1 },
  },
  {
    id: "m02",
    home: "ar",
    away: "au",
    stage: "group",
    status: "finished",
    date: "Ayer · 21:00",
    lockAt: now - 22 * HOUR,
    result: { home: 3, away: 0 },
  },
  {
    id: "m03",
    home: "fr",
    away: "dk",
    stage: "group",
    status: "live",
    date: "Hoy · en juego",
    lockAt: now - HOUR,
    result: { home: 1, away: 1 },
  },
  {
    id: "m04",
    home: "es",
    away: "de",
    stage: "group",
    status: "upcoming",
    date: "Hoy · 18:00",
    lockAt: now + 3 * HOUR,
    result: null,
  },
  {
    id: "m05",
    home: "br",
    away: "rs",
    stage: "group",
    status: "upcoming",
    date: "Hoy · 21:00",
    lockAt: now + 6 * HOUR,
    result: null,
  },
  {
    id: "m06",
    home: "gb-eng",
    away: "ir",
    stage: "group",
    status: "upcoming",
    date: "Mañana · 15:00",
    lockAt: now + 27 * HOUR,
    result: null,
  },
  {
    id: "m07",
    home: "pt",
    away: "uy",
    stage: "round_of_16",
    status: "upcoming",
    date: "Sáb · 18:00",
    lockAt: now + 3 * 24 * HOUR,
    result: null,
  },
  {
    id: "m08",
    home: "nl",
    away: "qa",
    stage: "quarterfinal",
    status: "locked",
    date: "Por definir",
    lockAt: now + 10 * 24 * HOUR,
    result: null,
  },
];

async function main() {
  initAdmin();
  const db = getFirestore();

  // Teams
  const teamsBatch = db.batch();
  for (const t of TEAMS) {
    teamsBatch.set(db.collection("teams").doc(t.code), t);
  }
  await teamsBatch.commit();
  console.log(`✓ ${TEAMS.length} equipos`);

  // Matches
  const matchBatch = db.batch();
  for (const m of MATCHES) {
    const { id, ...rest } = m;
    matchBatch.set(db.collection("matches").doc(id), rest);
  }
  await matchBatch.commit();
  console.log(`✓ ${MATCHES.length} partidos`);

  // Tournament — el cierre para elegir campeón es 5 min antes del partido
  // inaugural (jue 11 jun 2026, 12:55 America/El_Salvador = UTC-6).
  const championLockAt = new Date("2026-06-11T12:55:00-06:00").getTime();
  await db.collection("tournament").doc("config").set({
    name: "Quiniela Mundial 2026",
    started: true,
    finished: false,
    predictionsLocked: false,
    champion: null,
    championLockAt,
  });
  console.log("✓ torneo");

  console.log("Seed completo 🎉");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
