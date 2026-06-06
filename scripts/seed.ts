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

const LOCK_LEAD_MS = 5 * 60 * 1000; // los pronósticos cierran 5 min antes

// Formato legible en hora de El Salvador → "jue 11 jun · 13:00".
const esFmt = new Intl.DateTimeFormat("es", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "America/El_Salvador",
});
function fmtDate(ms: number): string {
  const p = Object.fromEntries(
    esFmt.formatToParts(ms).map((x) => [x.type, x.value]),
  );
  const clean = (s: string) => (s ?? "").replace(/\./g, "");
  return `${clean(p.weekday)} ${p.day} ${clean(p.month)} · ${p.hour}:${p.minute}`;
}

/**
 * 72 partidos de fase de grupos del Mundial 2026.
 * Tupla [local, visitante, kickoff en hora del Este (EDT = UTC-04:00)].
 * Fuente: fixture de ESPN. Hora mostrada convertida a America/El_Salvador.
 */
const FIXTURES: [string, string, string][] = [
  // Jornada 1
  ["mx", "za", "2026-06-11T15:00:00-04:00"],
  ["kr", "cz", "2026-06-11T22:00:00-04:00"],
  ["ca", "ba", "2026-06-12T15:00:00-04:00"],
  ["us", "py", "2026-06-12T21:00:00-04:00"],
  ["qa", "ch", "2026-06-13T15:00:00-04:00"],
  ["br", "ma", "2026-06-13T18:00:00-04:00"],
  ["ht", "gb-sct", "2026-06-13T21:00:00-04:00"],
  ["au", "tr", "2026-06-14T00:00:00-04:00"],
  ["de", "cw", "2026-06-14T13:00:00-04:00"],
  ["nl", "jp", "2026-06-14T16:00:00-04:00"],
  ["ci", "ec", "2026-06-14T19:00:00-04:00"],
  ["se", "tn", "2026-06-14T22:00:00-04:00"],
  ["es", "cv", "2026-06-15T13:00:00-04:00"],
  ["be", "eg", "2026-06-15T18:00:00-04:00"],
  ["sa", "uy", "2026-06-15T18:00:00-04:00"],
  ["ir", "nz", "2026-06-16T00:00:00-04:00"],
  ["fr", "sn", "2026-06-16T15:00:00-04:00"],
  ["iq", "no", "2026-06-16T18:00:00-04:00"],
  ["ar", "dz", "2026-06-16T21:00:00-04:00"],
  ["at", "jo", "2026-06-17T00:00:00-04:00"],
  ["pt", "cd", "2026-06-17T13:00:00-04:00"],
  ["gb-eng", "hr", "2026-06-17T16:00:00-04:00"],
  ["gh", "pa", "2026-06-17T19:00:00-04:00"],
  ["uz", "co", "2026-06-17T22:00:00-04:00"],
  // Jornada 2
  ["cz", "za", "2026-06-18T12:00:00-04:00"],
  ["ch", "ba", "2026-06-18T15:00:00-04:00"],
  ["ca", "qa", "2026-06-18T18:00:00-04:00"],
  ["mx", "kr", "2026-06-18T23:00:00-04:00"],
  ["us", "au", "2026-06-19T15:00:00-04:00"],
  ["gb-sct", "ma", "2026-06-19T18:00:00-04:00"],
  ["br", "ht", "2026-06-19T21:00:00-04:00"],
  ["tr", "py", "2026-06-20T00:00:00-04:00"],
  ["nl", "se", "2026-06-20T13:00:00-04:00"],
  ["de", "ci", "2026-06-20T16:00:00-04:00"],
  ["ec", "cw", "2026-06-20T20:00:00-04:00"],
  ["tn", "jp", "2026-06-21T00:00:00-04:00"],
  ["es", "sa", "2026-06-21T12:00:00-04:00"],
  ["be", "ir", "2026-06-21T15:00:00-04:00"],
  ["uy", "cv", "2026-06-21T18:00:00-04:00"],
  ["nz", "eg", "2026-06-21T21:00:00-04:00"],
  ["ar", "at", "2026-06-22T13:00:00-04:00"],
  ["fr", "iq", "2026-06-22T17:00:00-04:00"],
  ["no", "sn", "2026-06-22T20:00:00-04:00"],
  ["jo", "dz", "2026-06-22T23:00:00-04:00"],
  ["pt", "uz", "2026-06-23T13:00:00-04:00"],
  ["gb-eng", "gh", "2026-06-23T16:00:00-04:00"],
  ["pa", "hr", "2026-06-23T19:00:00-04:00"],
  ["co", "cd", "2026-06-23T22:00:00-04:00"],
  // Jornada 3
  ["ch", "ca", "2026-06-24T15:00:00-04:00"],
  ["ba", "qa", "2026-06-24T15:00:00-04:00"],
  ["gb-sct", "br", "2026-06-24T18:00:00-04:00"],
  ["ma", "ht", "2026-06-24T18:00:00-04:00"],
  ["cz", "mx", "2026-06-24T21:00:00-04:00"],
  ["za", "kr", "2026-06-24T21:00:00-04:00"],
  ["ec", "de", "2026-06-25T16:00:00-04:00"],
  ["cw", "ci", "2026-06-25T16:00:00-04:00"],
  ["jp", "se", "2026-06-25T19:00:00-04:00"],
  ["tn", "nl", "2026-06-25T19:00:00-04:00"],
  ["tr", "us", "2026-06-25T22:00:00-04:00"],
  ["py", "au", "2026-06-25T22:00:00-04:00"],
  ["no", "fr", "2026-06-26T15:00:00-04:00"],
  ["sn", "iq", "2026-06-26T15:00:00-04:00"],
  ["uy", "es", "2026-06-26T20:00:00-04:00"],
  ["cv", "sa", "2026-06-26T20:00:00-04:00"],
  ["eg", "ir", "2026-06-26T23:00:00-04:00"],
  ["nz", "be", "2026-06-26T23:00:00-04:00"],
  ["pa", "gb-eng", "2026-06-27T17:00:00-04:00"],
  ["hr", "gh", "2026-06-27T17:00:00-04:00"],
  ["co", "pt", "2026-06-27T19:30:00-04:00"],
  ["cd", "uz", "2026-06-27T19:30:00-04:00"],
  ["dz", "at", "2026-06-27T22:00:00-04:00"],
  ["jo", "ar", "2026-06-27T22:00:00-04:00"],
];

const MATCHES: Match[] = FIXTURES.map(([home, away, et], i) => {
  const kickoff = Date.parse(et);
  return {
    id: `m${String(i + 1).padStart(2, "0")}`,
    home,
    away,
    stage: "group",
    status: "upcoming",
    date: fmtDate(kickoff),
    lockAt: kickoff - LOCK_LEAD_MS,
    result: null,
  };
});

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
