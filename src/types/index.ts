// Modelo de dominio de la Quiniela Mundial 2026.

/** Fases del torneo (claves de almacenamiento en inglés, ver ARCHITECTURE.md). */
export type MatchStage =
  | "group"
  | "round_of_32"
  | "round_of_16"
  | "quarterfinal"
  | "third_place"
  | "semifinal"
  | "final";

export type MatchStatus = "finished" | "live" | "upcoming" | "locked";

/** Tipo de acierto de un pronóstico frente al resultado. */
export type ResultKind = "exacto" | "dif. exacta" | "tendencia" | "fallo";

export interface Stage {
  label: string;
  mult: 1 | 2 | 3;
}

export interface Score {
  home: number;
  away: number;
}

export interface Team {
  /** Código ISO usado por flagcdn (Inglaterra = "gb-eng"). */
  code: string;
  name: string;
  group: string; // 'A'..'L'
}

export interface Match {
  id: string;
  home: string; // team code
  away: string; // team code
  stage: MatchStage;
  status: MatchStatus;
  /** Texto legible, ej. "Hoy · 18:00". */
  date: string;
  /** Timestamp epoch (ms) de cierre de pronósticos. */
  lockAt: number;
  result: Score | null;
  /** Equipo que avanzó/ganó la llave (eliminatorias). null en grupos o sin finalizar. */
  advances: string | null;
}

export interface Prediction {
  id: string; // `${userId}_${matchId}`
  userId: string;
  matchId: string;
  home: number;
  away: number;
  /** Equipo que el jugador cree que avanza/gana (eliminatorias). null si no eligió. */
  advances: string | null;
  updatedAt: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  /** Equipo del corazón (define el avatar). Código de equipo. */
  support: string | null;
  /** Predicción de campeón (bono del campeón). Código de equipo. */
  championPrediction: string | null;
}

/** Fila del ranking / estadísticas de un jugador (calculada). */
export interface Standing {
  userId: string;
  name: string;
  support: string | null;
  pts: number;
  exact: number; // marcadores exactos (5)
  gd: number; // ganador + diferencia exacta (3)
  trend: number; // tendencia (1)
  miss: number; // fallos (0)
  played: number; // partidos finalizados pronosticados
  championBonus: boolean; // acertó el campeón oficial (bono del campeón incluido en pts)
  me?: boolean;
}

export interface Tournament {
  name: string;
  started: boolean;
  finished: boolean;
  predictionsLocked: boolean;
  champion: string | null; // team code (campeón oficial, lo define el admin)
  /** Cierre para que los jugadores elijan/cambien su campeón (epoch ms). null = sin límite. */
  championLockAt: number | null;
}

/** Liga privada: clasificación entre amigos (subconjunto de jugadores). */
export interface League {
  id: string;
  name: string;
  /** Código para invitar/unirse, ej. "Q-3XF65". Único. */
  code: string;
  ownerUid: string;
  /** UIDs de los miembros (incluye al dueño). */
  memberUids: string[];
  createdAt: number;
}

/** Usuario autenticado resuelto en el servidor. */
export interface SessionUser {
  uid: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

/** Tipos de notificación que producen las Cloud Functions. */
export type NotificationType =
  | "reminder60" // falta ~1 h y no pronosticó
  | "reminder30" // faltan ~30 min y no pronosticó
  | "kickoff" // su partido (ya pronosticado) está por comenzar
  | "champion" // recordatorio de elegir campeón/equipo
  | "points" // puntos sumados al finalizar un partido
  | "newmatch" // se agregó un nuevo partido
  | "leader"; // cambió el líder del ranking

/**
 * Notificación in-app de un usuario. Vive en `users/{uid}/notifications/{id}`.
 * La crean las Cloud Functions (Admin SDK); el cliente solo la lee y marca `read`.
 */
export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  /** Ruta interna a la que lleva al tocarla (ej. "/partidos"). null si no aplica. */
  link: string | null;
  read: boolean;
  createdAt: number;
}
