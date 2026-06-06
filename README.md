# Quiniela Mundial 2026

Aplicación web para una quiniela del Mundial FIFA 2026 entre amigos y familia.
Cada jugador pronostica marcadores, suma puntos por fase, elige un campeón (bono)
y un equipo del corazón (avatar). Hay ranking, estadísticas y perfil.

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind v4 ·
Firebase Auth + Firestore (Client + Admin SDK) · TanStack Query · React Hook Form · Zod.

> Diseño "Estadio Nocturno" y especificación funcional en [`docs/`](./docs).

## Puesta en marcha

### 1. Variables de entorno (`.env`)

Las claves Web (`NEXT_PUBLIC_FIREBASE_*`) ya están cargadas. Falta el **Admin SDK**:

1. Firebase Console → ⚙️ Configuración del proyecto → **Cuentas de servicio** →
   **Generar nueva clave privada** (descarga un JSON).
2. Copiá del JSON al `.env`:
   - `FIREBASE_CLIENT_EMAIL` → campo `client_email`.
   - `FIREBASE_PRIVATE_KEY` → campo `private_key` (entre comillas, con los `\n` literales).
3. `ADMIN_EMAILS` ya incluye tu correo (separá varios por coma).

### 2. Habilitar proveedores de Auth

En Firebase Console → **Authentication** → Sign-in method, activá **Correo/Contraseña**
y **Google**.

### 3. Reglas de Firestore

Publicá [`firestore.rules`](./firestore.rules) (Console → Firestore → Reglas, o
`firebase deploy --only firestore:rules`).

### 4. Datos de ejemplo

```bash
npm run seed   # puebla teams, matches demo y el doc tournament
```

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
| `npm run seed` | Carga datos de ejemplo en Firestore (Admin SDK). |

## Arquitectura

`UI → services → repositories → Firestore`. Server Components por defecto; el gating
de rutas vive en `src/app/(app)/layout.tsx` (verifica la session cookie con el Admin
SDK). El cálculo de puntos (`src/lib/scoring.ts`) es puro y reutilizable.

**Panel admin** (`/admin/*`, visible para los correos en `ADMIN_EMAILS`): gestión de
partidos, registro de resultados (`finalize-match` calcula y persiste los puntos +
auditoría), y gestión del torneo (estado, bloqueo de pronósticos y campeón oficial con
bono +10). Las mutaciones pasan por route handlers `/api/admin/*` que usan el Admin SDK.
El ranking se calcula on-the-fly (incluido el bono campeón).

---

Hecho con 💙 por **Oscar Aragón**.
