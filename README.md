# Quiniela Mundial 2026

Aplicación web para una quiniela del Mundial FIFA 2026 entre amigos y familia.
Cada jugador pronostica los marcadores (fase de grupos y eliminatorias), suma puntos
según su acierto y la fase, gana bonos por acertar el **campeón** y —en eliminatorias—
**quién avanza**, y elige un **equipo del corazón** (su bandera es el avatar). Hay
ranking, estadísticas, perfil y un panel de administración.

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind v4 ·
Firebase Auth + Firestore (Client + Admin SDK) · TanStack Query · React Hook Form · Zod.

> Diseño "Estadio Nocturno" y especificación funcional en [`docs/`](./docs).

## Funcionalidades

- **Auth**: registro/login con correo o Google, recuperación de contraseña, sesión
  por cookie httpOnly (Admin SDK).
- **Pronósticos**: marcador con stepper; puntos 5/3/1/0 × multiplicador de fase;
  cierre 5 min antes de cada partido. Lista agrupada por día. El marcador se cuenta a
  los **90'**.
- **Eliminatorias** (+5): si pronosticás ganador, ese avanza; si pronosticás empate,
  elegís quién pasa (penales). Bono por acertar quién avanza/gana (el tiempo extra y los
  penales solo definen quién pasa, no el marcador, que se cuenta a los 90').
- **Campeón** (+25): elegible/editable hasta el cierre configurable (`championLockAt`),
  validado server-side. Independiente del equipo del corazón.
- **Ranking** (podio + tabla paginada, con bonos) y **estadísticas**. Desempate:
  puntos → más exactos → más diferencias exactas → mejor % de aciertos → alfabético.
- **Ligas privadas**: pestaña "Mis ligas" en el ranking. Cada usuario crea hasta 2 ligas
  (nombre + código `Q-XXXXX` para invitar), se une con código, y ve la clasificación de sus
  miembros (mismo cálculo que el general). El dueño renombra / borra / expulsa; los demás
  salen. Crear/unirse/gestionar pasa por `/api/leagues` (Admin SDK).
- **Cómo se juega** (`/reglas`): explica el puntaje base, los multiplicadores, los bonos
  de campeón y de avance, y los criterios de desempate, con ejemplos.
- **Panel admin** (`/admin`): partidos (ABM con filtros y paginación), resultados
  (finalización + cálculo de puntos, incluido quién avanza en eliminatorias), y torneo
  (iniciar / congelar pronósticos / finalizar / campeón oficial / deadline).

## Puesta en marcha

### 1. Variables de entorno (`.env`)

Las claves Web (`NEXT_PUBLIC_FIREBASE_*`) ya están cargadas. Falta el **Admin SDK**:

1. Firebase Console → ⚙️ Configuración del proyecto → **Cuentas de servicio** →
   **Generar nueva clave privada** (descarga un JSON).
2. Copiá del JSON al `.env`:
   - `FIREBASE_CLIENT_EMAIL` → campo `client_email`.
   - `FIREBASE_PRIVATE_KEY` → campo `private_key` (entre comillas, con los `\n` literales).
3. `ADMIN_EMAILS` → correos con rol admin (separá varios por coma).

### 2. Habilitar proveedores de Auth

En Firebase Console → **Authentication** → Sign-in method, activá **Correo/Contraseña**
y **Google**. Revisá también la plantilla de **restablecimiento de contraseña**.

### 3. Reglas de Firestore

Publicá [`firestore.rules`](./firestore.rules) (Console → Firestore → Reglas, o
`firebase deploy --only firestore:rules`). Validan, del lado del servidor, que un
pronóstico solo se escriba si es propio, el torneo no está congelado/finalizado y el
partido sigue abierto. **Requieren que exista el doc `tournament/config`** (lo crea el
seed). Hay que re-publicarlas cada vez que cambien.

### 4. Datos del torneo

```bash
npm run seed   # 48 selecciones + 104 partidos (72 grupos + 32 eliminatorias) + doc tournament
```

Las fechas/horas están en `America/El_Salvador`; las eliminatorias quedan como
"Por definir" (editás equipos y hora en Admin → Partidos al resolverse el bracket).

### 5. Correr la app

```bash
npm run dev    # http://localhost:3000
```

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo (Turbopack). |
| `npm run build` | Build de producción. |
| `npm run lint` | ESLint (flat config). |
| `npm run seed` | Limpia y reescribe `teams`/`matches` en Firestore (idempotente). No toca cuentas de usuario. |
| `npm run seed:reset` | Como `seed` pero además vacía `predictions` y `audit_logs` (datos de prueba). |

## Arquitectura

`UI → services → repositories → Firestore`. Server Components por defecto; el gating
de rutas vive en `src/app/(app)/layout.tsx` y `src/app/admin/layout.tsx` (verifican la
session cookie con el Admin SDK; admin = `ADMIN_EMAILS`). El cálculo de puntos
(`src/lib/scoring.ts`) y el ranking (`src/services/standings.service.ts`, incluye los
bonos de campeón y de avance) son puros y se calculan on-the-fly. El marcador se puntúa a
los 90'; en eliminatorias, `Match.advances`/`Prediction.advances` y `resolveAdvancer()`
resuelven quién avanza (ganador del marcador o, si es empate, el desempate por penales).

**Mutaciones sensibles** (finalizar partidos, ABM de partidos, torneo, definir campeón
del jugador) pasan por route handlers `/api/admin/*` y `/api/champion` con el **Admin
SDK**; las reglas de Firestore bloquean esas escrituras desde el cliente. El estado del
torneo (`started` / `predictionsLocked` / `finished` / `champion` / `championLockAt`)
se lee reactivamente vía `tournament/config` y afecta la UI en vivo.

---

Hecho desde 🇸🇻 por **Oscar**.
