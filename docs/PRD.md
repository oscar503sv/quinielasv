# PRD.md

# Mundial 2026 Quiniela

## Objetivo
Aplicación web para que amigos y familiares participen en una quiniela del Mundial FIFA 2026.

## Stack
- Next.js 16+ App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Firebase Authentication
- Cloud Firestore
- Vercel
- TanStack Query
- React Hook Form
- Zod

## Roles
### Usuario
- Registrarse con correo y contraseña.
- Iniciar sesión con Google.
- Crear y editar pronósticos antes del cierre.
- Elegir campeón.
- Consultar ranking y estadísticas.

### Administrador
- Gestionar partidos.
- Registrar resultados oficiales.
- Finalizar partidos.
- Gestionar torneo.

## Puntuación
### Base
- 5 puntos: marcador exacto.
- 3 puntos: ganador correcto y diferencia de goles exacta.
- 1 punto: tendencia correcta.
- 0 puntos: fallo.

### Multiplicadores
- Fase de grupos: x1
- Dieciseisavos (Round of 32): x2
- Octavos: x2
- Cuartos: x2
- Tercer lugar: x3
- Semifinales: x3
- Final: x3

### Bono campeón
+10 puntos si acierta el campeón.

## Colecciones Firestore

### users
- displayName
- email
- photoURL
- provider
- championPrediction

### teams
- code
- name
- fifaCode
- flagUrl
- group

### matches
- homeTeamCode
- awayTeamCode
- homeTeamName
- awayTeamName
- homeScore
- awayScore
- stage
- multiplier
- status
- matchDate
- lockDate

### predictions
- userId
- matchId
- homeScorePred
- awayScorePred
- basePoints
- multiplier
- pointsEarned

### standings
- userId
- totalPoints
- exactPredictions
- goalDifferencePredictions
- trendPredictions
- championBonusAwarded
- currentPosition

### tournament
- started
- finished
- predictionsLocked
- champion

### audit_logs
- action
- entityType
- entityId
- performedBy
- metadata

## API Principal

POST /api/admin/finalize-match

Proceso:
1. Obtener resultado oficial.
2. Calcular puntos.
3. Actualizar predictions.
4. Actualizar standings.
5. Registrar auditoría.
6. Marcar partido como finalizado.
