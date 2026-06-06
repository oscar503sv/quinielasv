# Especificación — Quiniela Mundial 2026

> Documento de handoff para replicar la aplicación **Quiniela Mundial 2026**.
> Autor del proyecto: **Oscar Aragón**.
> Stack del prototipo: HTML + React 18 (UMD) + Babel standalone, sin build. Datos mock en memoria. Listo para conectar a un backend (Firebase/Supabase/API propia).

---

## 1. Resumen del producto

Aplicación web para una **quiniela del Mundial FIFA 2026** entre amigos y familia. Cada jugador pronostica el marcador de los partidos, suma puntos según su acierto, elige un **campeón** (predicción, bono) y un **equipo del corazón** (a quién apoya; su bandera es su avatar). Hay un **ranking** del grupo, **estadísticas** personales y un **panel de administración** para gestionar partidos, resultados y el torneo.

- **Idioma:** español con **voseo** (rioplatense): "pronosticá", "sumá", "elegí", "no te durmás", "podés", "acertás". Las etiquetas de botones van en infinitivo ("Guardar pronóstico", "Confirmar campeón").
- **Tono visual:** "Estadio Nocturno" — festivo pero premium. Azul marino profundo + dorado trofeo. Banderas reales como protagonistas. Animaciones sutiles y micro-celebraciones (confeti) al acertar/guardar.
- **Temas:** claro y oscuro, con toggle. Por defecto oscuro.
- **Plataforma:** web de escritorio, responsive (centra el contenido con ancho máximo de 1240px).

---

## 2. Sistema de diseño (tokens)

Definir como variables CSS en `:root`/`[data-theme="dark"]` y sobreescribir en `[data-theme="light"]`. El atributo `data-theme` vive en `<html>`.

### Tipografía
- **Display / títulos / números:** `Bricolage Grotesque` (pesos 600–800).
- **Cuerpo / UI:** `DM Sans` (400–700).
- Números con `font-variant-numeric: tabular-nums`.

### Color — Tema oscuro (default)
| Token | Valor | Uso |
|---|---|---|
| `--bg-grad` | `radial-gradient(135% 105% at 82% -12%, #16345f, #0a1830 54%, #06101f)` | Fondo de la app |
| `--bg-solid` | `#0a1830` | Fondo base |
| `--surface` | `rgba(255,255,255,.055)` | Tarjetas |
| `--surface-2` | `rgba(255,255,255,.085)` | Inputs, chips |
| `--border` | `rgba(255,255,255,.10)` | Bordes |
| `--text` | `#eaf1fb` | Texto principal |
| `--text-dim` | `rgba(234,241,251,.62)` | Texto secundario |
| `--text-faint` | `rgba(234,241,251,.40)` | Texto terciario |
| `--gold` | `#f2c14e` | Acento principal (trofeo) |
| `--gold-2` | `#f7d27c` | Acento claro (gradientes) |
| `--gold-soft` | `rgba(242,193,78,.14)` | Fondo de acento |
| `--gold-border` | `rgba(242,193,78,.36)` | Borde de acento |
| `--gold-ink` | `#271d05` | Texto sobre dorado |
| `--good` | `#54e08a` | Acierto |
| `--bad` | `#ff7a7a` | Fallo / en vivo |
| `--blue` | `#5b95ff` | Info |

### Color — Tema claro (overrides)
| Token | Valor |
|---|---|
| `--bg-grad` | `radial-gradient(135% 105% at 82% -12%, #e7efff, #f4f7fc 52%, #eaf0f9)` |
| `--bg-solid` | `#f4f7fc` |
| `--surface` | `#ffffff` |
| `--surface-2` | `#f5f8fd` |
| `--border` | `#e3e9f3` |
| `--text` | `#0f1b35` |
| `--text-dim` | `#56607a` |
| `--gold` | `#d99a1e` · `--gold-ink` `#2a1f05` |
| `--good` | `#15a34a` · `--bad` `#dc2626` · `--blue` `#1d4ed8` |

> ⚠️ **Nota importante (bug resuelto):** NO poner `transition` sobre la propiedad `color` del `<body>`. Si se hace, al cambiar de tema el texto se queda "pegado" en el color anterior. Sólo transicionar `background`.

### Acentos intercambiables (Tweak)
El color de acento puede cambiarse en runtime sobreescribiendo `--gold`, `--gold-2`, `--gold-soft`, `--gold-border`, `--gold-ink`. Paletas: **dorado** (default), **azul** `#5b95ff`, **esmeralda** `#41d98b`, **coral** `#ff9a66`.

### Componentes base (clases CSS)
- `.card` — superficie con borde y sombra suave, `border-radius: 18px`.
- `.btn` + variantes: `.btn-gold` (gradiente dorado), `.btn-outline`, `.btn-ghost`, `.btn-block`.
- `.pill` + variantes: `.pill-gold`, `.pill-blue`, `.pill-good`, `.pill-bad`, `.pill-dim`. `.badge-mult` para multiplicadores "x2".
- `.input`, `.field` (label + input + error), `.field-err`.
- `.score-box` y `.step-btn` para el stepper de marcador.
- `.tabs`/`.tab`, `.nav-link`, `.role-toggle`, `.icon-btn`, `.avatar`.
- **Importante:** dar `button { color: inherit }` para que las tarjetas-botón hereden el color del tema.

### Banderas
Imágenes reales por código ISO de país vía **flagcdn**: `https://flagcdn.com/w160/{code}.png`. Componente `<Flag code w h r />` que renderiza un `<img>` con `object-fit: cover` y `box-shadow` de 1px como anillo. Códigos especiales: Inglaterra = `gb-eng`.

### Layout shell (sticky footer)
- `.app-bg` es `display:flex; flex-direction:column; min-height:100vh`.
- `.topbar` y `.shell` llevan `max-width:1240px; width:100%; margin:0 auto`. **El `width:100%` es obligatorio** o el contenido se comprime al centro.
- El contenido (`.shell`) lleva `flex: 1 0 auto` para empujar el footer al fondo.

---

## 3. Modelo de datos

### Equipo
```
Team { code: string (ISO), name: string, group: 'A'..'H' }
```
48 selecciones (en el prototipo hay 24 representativas). El mapa `TEAM[code]` da acceso directo.

### Fase / multiplicador
```
STAGES = {
  grupos:        { label: 'Fase de grupos', mult: 1 },
  dieciseisavos: { label: 'Dieciseisavos',  mult: 2 },
  octavos:       { label: 'Octavos',        mult: 2 },
  cuartos:       { label: 'Cuartos',        mult: 2 },
  tercer:        { label: 'Tercer lugar',   mult: 3 },
  semis:         { label: 'Semifinal',      mult: 3 },
  final:         { label: 'Final',          mult: 3 },
}
```

### Partido
```
Match {
  id: string,
  home: code, away: code,
  stage: keyof STAGES,
  status: 'finished' | 'live' | 'upcoming' | 'locked',
  date: string,          // ej. "Hoy · 18:00"
  lock: string,          // texto de cierre/estado ej. "Cierra en 3 h 40 m"
  result: { home:int, away:int } | null,
  myPred: { home:int, away:int } | null,
}
```
Estado local adicional `_pred` para el pronóstico en edición antes de "finalizar".

### Jugador
```
Player {
  id, name, flag: code, pts:int,
  exact:int, gd:int (ganador+dif), trend:int, played:int,
  me?: bool
}
```

### Usuario actual
```
ME { id, name, email, flag (equipo del corazón), champion (code) }
```

### Torneo
```
TOURNAMENT { name, started:bool, finished:bool, predictionsLocked:bool, players:int, champion:code|null }
```

---

## 4. Lógica de puntuación

Sistema base por partido, multiplicado por la fase:

| Resultado del pronóstico | Puntos base |
|---|---|
| **Marcador exacto** (home y away iguales) | **5** |
| **Ganador correcto + diferencia de goles exacta** | **3** |
| **Tendencia** (acierta sólo quién gana/empata) | **1** |
| **Fallo** | **0** |

```js
basePoints(pred, res):
  if pred == res exactos → 5
  pd = pred.home-pred.away; rd = res.home-res.away
  if sign(pd)==sign(rd):  return pd==rd ? 3 : 1
  return 0

totalPoints = basePoints * STAGES[stage].mult
```

**Bono campeón:** +25 puntos si el equipo elegido como campeón gana el Mundial (se otorga al finalizar el torneo desde el panel admin).

`resultKind(pred,res)` devuelve la etiqueta: `'exacto'` (5) / `'dif. exacta'` (3) / `'tendencia'` (1) / `'fallo'` (0).

---

## 5. Navegación y roles

**Topbar** (sticky): logo "Quiniela 2026" (vuelve al dashboard), nav, toggle de rol Usuario/Admin (demo), toggle de tema ☀️/🌙, avatar (bandera del equipo del corazón → va a Perfil).

- **Nav Usuario:** Dashboard · Partidos · Ranking · Estadísticas · Perfil
- **Nav Admin:** Dashboard · Partidos · Resultados · Torneo

**Footer** (en todas las pantallas internas): "Quiniela Mundial 2026" a la izquierda y "Hecho con 💙 por **Oscar Aragón** · {año}" a la derecha. Pegado al fondo vía sticky-footer.

Estado persistido en `localStorage`: pantalla actual (`q26_screen`), tema (`q26_theme`), campeón (`q26_champ`), equipo del corazón (`q26_support`).

---

## 6. Especificación página por página

### 6.1 Landing / Login (pública)
- **Layout:** dos columnas. Izquierda hero, derecha tarjeta de auth.
- **Hero:** marca, eyebrow "Para jugar en familia y con amigos", título grande "Pronosticá el Mundial. Picate con los tuyos. 🌎⚽", subtítulo, y una fila de ~12 banderas reales + pill "+48 selecciones".
- **Tarjeta de auth:** tabs **Iniciar sesión / Crear cuenta**.
  - Botón "Continuar con Google" (outline) + separador "o con tu correo".
  - Campos: **Nombre o apodo** (sólo registro) · **Correo** · **Contraseña** · **Confirmar contraseña** (sólo registro).
  - Validaciones: nombre requerido (registro), email con formato válido, contraseña ≥ 6 caracteres, **confirmar contraseña debe coincidir** ("Las contraseñas no coinciden").
  - Al enviar válido: confeti + entrar al Dashboard.
- **Crédito** centrado al pie: "Hecho con 💙 por Oscar Aragón".

### 6.2 Dashboard (usuario)
- Saludo: eyebrow "Hola de nuevo" + "Familia Mundialista ⚽" + línea de pendientes ("Tenés X pronósticos pendientes para hoy. ¡No te durmás!" o "¡Vas al día!").
- **3 tarjetas de stats:** Tu posición (#n, con "▲ subiste 1"), Puntos totales (con exactos/tendencias), y **Tu campeón 🏆** (tarjeta-botón con bandera → va a elegir campeón).
- **Próximos partidos** (lista de 4, incluye en vivo) con botón Pronosticar/Ver → Partidos.
- **Ranking** (top 5) con botón → Ranking completo. Resalta la fila propia.

### 6.3 Partidos (usuario) — pantalla central
- Título + subtítulo "Ajustá tu marcador con + / − y guardá antes del cierre."
- **Filtros (tabs):** Por pronosticar · En vivo · Finalizados · Todos.
- Grid de **MatchCard** (mín. 340px, auto-fill).
- **MatchCard** según estado:
  - **upcoming:** badge de fase + multiplicador, fecha, dos banderas grandes con nombres, "VS", **stepper de marcador** (`+`/`−` por equipo), botón "Guardar/Actualizar pronóstico". Al guardar: confeti + "¡Guardado! 🎉" + marcador en dorado. Editable hasta el cierre.
  - **live:** marcador en vivo + pill rojo parpadeante "En juego · 67'" + muestra tu pronóstico.
  - **finished:** marcador final + tu pronóstico + pill del tipo de acierto (exacto/tendencia/fallo) + puntos "+N" (verde si suma).
  - **locked:** "Este partido aún no está disponible para pronosticar." 🔒
- **Stepper:** usar incrementos por **delta** (`+1`/`−1`), nunca valor absoluto, para que clics rápidos no pierdan cuenta. Rango 0–20.

### 6.4 Ranking (usuario)
- Título + nombre del torneo + nº de jugadores.
- **Podio** top 3 (orden visual 2-1-3, alturas distintas, medallas 🥈🥇🥉, banderas).
- **Tabla** completa: columnas `# · Jugador · Puntos · Exactos · Tendencias`. Resalta la fila propia con pill "tú".

### 6.5 Estadísticas (usuario)
- 4 StatTiles: Puntos totales (acento), Marcadores exactos, Tendencias, Posición actual.
- **Desglose de aciertos:** barras horizontales por categoría (exacto/dif./tendencia/fallo) con su color.
- **Donut** de tasa de acierto (SVG, % de pronósticos que sumaron puntos).

### 6.6 Perfil (usuario)
- Tarjeta principal: avatar (bandera del equipo del corazón), nombre, email, pills de posición y puntos. Campos editables (nombre; email deshabilitado). Botones "Guardar cambios" y toggle de tema.
- **Tu equipo del corazón 💙:** selector de las 48 selecciones. Su bandera es el avatar en toda la app y se actualiza en vivo. Texto: "A quién le vas · su bandera es tu foto de perfil".
- **Tu campeón del Mundial 🏆:** tarjeta-botón → pantalla de elegir campeón. Texto: "Quién creés que va a ganar la copa · +25 pts si acertás".
- Botón "Cerrar sesión" → Landing.

> **Distinción clave:** *equipo del corazón* (a quién apoya, define el avatar) y *campeón* (predicción de quién gana, da bono) son **independientes**.

### 6.7 Elegir Campeón (usuario)
- Encabezado centrado: eyebrow "Bono campeón · +25 puntos", título "¿Quién levantará la copa? 🏆", explicación.
- Grid de selecciones (tarjetas con bandera + nombre); la elegida se resalta con borde dorado y ✓.
- Barra **sticky** abajo con la elección actual + "Cancelar" / "Confirmar campeón" (confeti al confirmar → Dashboard).

### 6.8 Admin · Dashboard
- Pill "ADMIN" + "Centro de control" + nombre/nº jugadores.
- 4 StatTiles: Partidos totales · Finalizados · En vivo · Por jugar.
- 3 accesos: Gestionar partidos · Registrar resultados · Gestionar torneo.

### 6.9 Admin · Partidos
- Botón "＋ Crear partido" que despliega un formulario (Local, Visitante, Fase con multiplicador, Fecha/hora, Cierre de pronósticos).
- Tabla de partidos con equipos+banderas, fecha, pill de estado (Finalizado/En vivo/Programado/Bloqueado) y botón Editar.

### 6.10 Admin · Resultados
- Subtítulo: "Capturá el marcador oficial y finalizá. Al finalizar se calculan los puntos de todos los jugadores y se actualiza el ranking."
- Grid de tarjetas (partidos live/upcoming) con banderas + **stepper de marcador** por equipo + botón "Finalizar partido". Al finalizar: confeti, pasa a `finished`, calcula puntos.

### 6.11 Admin · Torneo
- Tarjeta de estado con **toggles**: Torneo iniciado · Bloquear todos los pronósticos · Torneo finalizado (cada uno con su descripción).
- Sección **Campeón oficial 🏆:** selector de selección + botón "Definir campeón y otorgar bonos" (otorga +25 a quienes lo acertaron).

---

## 7. Interacciones y micro-detalles
- **Confeti** (`fireConfetti(originX)`): ~90 piezas multicolor que caen; respeta un flag global para activarse/desactivarse (Tweak). Se dispara al: guardar pronóstico, finalizar partido (admin), confirmar campeón, login válido.
- **Animación de entrada:** las pantallas hacen `fadeUp` escalonado de sus hijos (respeta `prefers-reduced-motion`).
- **Scroll al top** suave al cambiar de pantalla.
- **Tweaks panel** (opcional): color de acento (dorado/azul/esmeralda/coral) y confeti on/off.

---

## 8. Backend sugerido (para producción)
El prototipo usa datos mock en memoria. Para producción:
- **Auth:** email/contraseña + Google (Firebase Auth o similar).
- **Colecciones:** `teams`, `matches`, `predictions` (por usuario+partido), `users` (con `champion` y `support`), `tournament` (config global).
- **Reglas:** un pronóstico sólo es editable mientras `match.status == 'upcoming'` y no haya pasado el cierre; recalcular puntos al finalizar un partido (server-side, idealmente Cloud Function); el bono de campeón se aplica al setear `tournament.champion`.
- **Banderas:** seguir usando flagcdn por código ISO, o cachear localmente.

---

## 9. Estructura de archivos del prototipo (referencia)
```
Quiniela Mundial 2026.html   → documento raíz, carga fuentes + scripts
styles.css                   → tokens de tema + componentes
data.jsx                     → equipos, fases, partidos, jugadores, scoring
components.jsx               → Flag, MatchCard, ScoreStepper, StatTile, confeti
screens-user.jsx             → Landing, Dashboard, Partidos
screens-misc.jsx             → Ranking, Estadísticas, Perfil, Campeón
screens-admin.jsx            → Dashboard, Partidos, Resultados, Torneo (admin)
app.jsx                      → shell, navegación, estado, temas, footer, tweaks
```

