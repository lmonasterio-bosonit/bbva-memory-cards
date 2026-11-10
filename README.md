# Memory Cards

Progressive Web App del juego **Memory Cards**, desarrollada como solución a la
[prueba técnica de BBVA Engineering](https://bbvaengineering.github.io/challenges/memory/).

Memoriza la posición de los números del 1 al 9, espera a que se oculten y encuentra el número que
se te pide. Cada acierto suma puntos y abre una nueva ronda; un fallo termina la partida.

- **Demo:** <https://lmonasterio-bosonit.github.io/bbva-memory-cards/> (se publica automáticamente con el workflow
  de GitHub Pages; ver [Despliegue](#despliegue)).
- **Stack:** React 19 · TypeScript · Vite 8 · React Router · vite-plugin-pwa (Workbox) · Vitest ·
  Testing Library · Playwright · Oxlint · Prettier · GitHub Actions.

## Índice

- [Funcionalidades](#funcionalidades)
- [Puesta en marcha en local](#puesta-en-marcha-en-local)
- [Scripts](#scripts)
- [Tests](#tests)
- [PWA y modo sin conexión](#pwa-y-modo-sin-conexión)
- [Despliegue](#despliegue)
- [Arquitectura y decisiones](#arquitectura-y-decisiones)
- [Estructura del proyecto](#estructura-del-proyecto)

## Funcionalidades

### Requisitos del enunciado

| Requisito                                                        | Dónde                                                           |
| ---------------------------------------------------------------- | --------------------------------------------------------------- |
| Vista de inicio con campo de nombre y botón que lo valida        | `src/pages/HomePage`, `src/player/validateName.ts`              |
| Cualquier ruta inexistente redirige al inicio                    | `src/App.tsx` (ruta `*`)                                        |
| Vista de juego con nombre, puntos, dificultad y botón Empezar    | `src/pages/GamePage`                                            |
| 9 casillas con números 1-9 sin repetir en posición aleatoria     | `src/game/board.ts` (Fisher-Yates)                              |
| Tiempo visible y puntos por dificultad (10 s/10, 5 s/20, 2 s/30) | `src/game/difficulty.ts`                                        |
| Acierto: casilla verde, suma puntos y nueva ronda                | `src/game/reducer.ts` (`pick` → `roundWon` → `start`)           |
| Fallo: casilla roja mostrando su número y fin de partida         | `src/game/reducer.ts` (`pick` → `over`)                         |
| Funciona sin conexión tras la primera visita                     | `vite.config.ts` (vite-plugin-pwa, precaché completa del build) |
| Tests unitarios de vistas y componentes                          | `src/**/*.test.tsx`                                             |
| README con instrucciones                                         | Este archivo                                                    |

### Extras

- **Cuenta atrás visual** (anillo de progreso + segundos) durante la fase de memorización, anunciada
  a lectores de pantalla con `role="timer"`.
- **Vibración** en dispositivos compatibles: breve en cada acierto y un patrón largo al perder.
- **Reto «3 números»**: en cada ronda hay que localizar tres números seguidos; cada acierto suma
  puntos y un fallo en cualquiera de ellos termina la partida.
- **Récord por jugador y dificultad**, persistido en `localStorage`, con aviso de «¡Nuevo récord!».
- Al fallar se señala también **dónde estaba el número buscado** (casilla con borde ámbar).
- **Jugador recordado** entre sesiones; enlace para cambiar de jugador.
- **Indicador «Sin conexión»** en la cabecera y aviso cuando hay una **nueva versión** de la app con
  botón para actualizar.
- **Accesibilidad**: controles nativos (radio, switch, botones), etiquetas descriptivas por casilla
  («Casilla 3, número 7, acierto»), región `aria-live` para el estado de la ronda, foco visible,
  soporte de `prefers-reduced-motion` y **tema claro/oscuro** automático.
- **Diseño responsive** pensado para móvil (safe areas, tablero a ancho completo).
- Tooling: lint (Oxlint), formato (Prettier), cobertura, tests e2e con Playwright (escritorio y
  móvil), CI y despliegue automático con GitHub Actions, generación de iconos PWA con un script sin
  dependencias.

## Puesta en marcha en local

Requisitos: **Node.js 22 o superior** (hay un `.nvmrc` con la versión usada) y npm.

```bash
git clone https://github.com/lmonasterio-bosonit/bbva-memory-cards.git
cd bbva-memory-cards
npm ci
npm run dev
```

La app queda disponible en `http://localhost:5173`.

Para probar la **PWA y el modo sin conexión** hace falta el build de producción, ya que el service
worker solo se genera ahí:

```bash
npm run build
npm run preview
```

Abre `http://localhost:4173`, espera el aviso «La app ya está lista para usarse sin conexión»,
activa el modo avión (o «Offline» en las DevTools) y recarga: la app sigue funcionando.

## Scripts

| Script                  | Descripción                                                    |
| ----------------------- | -------------------------------------------------------------- |
| `npm run dev`           | Servidor de desarrollo con HMR                                 |
| `npm run build`         | Comprobación de tipos + build de producción (`dist/`)          |
| `npm run preview`       | Sirve el build de producción                                   |
| `npm run typecheck`     | Comprobación de tipos de app, config y e2e                     |
| `npm run lint`          | Análisis estático con Oxlint (React, TypeScript, a11y, Vitest) |
| `npm run format`        | Formatea el código con Prettier                                |
| `npm run format:check`  | Comprueba el formato sin modificar nada                        |
| `npm test`              | Tests unitarios y de componentes (Vitest + Testing Library)    |
| `npm run test:watch`    | Tests en modo watch                                            |
| `npm run test:coverage` | Tests con informe de cobertura (`coverage/`)                   |
| `npm run test:e2e`      | Tests end-to-end con Playwright (hace el build y lo sirve)     |
| `npm run icons`         | Regenera los iconos PNG de la PWA en `public/`                 |
| `npm run check`         | Tipos + lint + formato + tests, igual que la CI                |

## Tests

### Unitarios y de componentes (`npm test`)

Vitest con entorno `jsdom`, Testing Library y `user-event`. Cubren:

- **Lógica pura del juego**: barajado, generación del tablero, reducer (todas las transiciones:
  cuenta atrás, acierto, fallo, nueva ronda, reto de 3 números, reinicio) y configuración de
  dificultad.
- **Hooks**: `useMemoryGame` (temporizadores con fake timers), `useBestScore`, `useOnlineStatus`.
- **Componentes**: `Button`, `TextField`, `DifficultySelector`, `Toggle`, `Board`, `Countdown`,
  `Stat`, `AppShell`, `PwaBadge` (con el módulo virtual del service worker mockeado).
- **Vistas**: `HomePage` (validación, navegación, persistencia) y `GamePage` (partidas completas
  deterministas inyectando la fuente de aleatoriedad).
- **Rutas**: `App` (inicio, redirección de rutas inexistentes y de `/game` sin jugador).

La aleatoriedad se inyecta (`random: () => number`) para que las partidas sean reproducibles en
tests; `src/test/random.ts` incluye un generador con semilla y uno «identidad» que deja el tablero
ordenado.

> Nota: Testing Library solo avanza los temporizadores falsos cuando detecta Jest; en
> `src/test/setup.ts` se expone un pequeño shim para que `vi.useFakeTimers()` funcione con
> `user-event`.

### End-to-end (`npm run test:e2e`)

Playwright, contra el build de producción, en Chromium de escritorio y en un perfil móvil
(Pixel 7). Comprueba el registro con validación, las redirecciones, una partida completa (leyendo los
números mientras están visibles), la persistencia del jugador, el registro del service worker y
que **la app carga y navega con la red desactivada** (`context.setOffline(true)`).

La primera vez hay que descargar el navegador: `npx playwright install chromium`.

## PWA y modo sin conexión

- `vite-plugin-pwa` genera el `manifest.webmanifest` (nombre, iconos normales y _maskable_, colores,
  `display: standalone`) y un service worker con Workbox que **precachea todo el build** (HTML, JS,
  CSS, iconos). Tras la primera visita la app completa se sirve desde la caché.
- `navigateFallback` hace que cualquier ruta (p. ej. `/game`) se resuelva a `index.html` sin red, y
  el router aplica la redirección al inicio si hace falta.
- Estrategia de actualización `prompt`: cuando hay un build nuevo, `PwaBadge` muestra un aviso con
  botón «Actualizar», y comprueba actualizaciones cada hora.
- Los iconos (`public/pwa-*.png`, `maskable-icon-512x512.png`, `apple-touch-icon.png`) se generan
  con `scripts/generate-icons.mjs`, que dibuja el logo y codifica el PNG sin dependencias.

## Despliegue

### GitHub Pages (automático)

El workflow `.github/workflows/deploy.yml` se ejecuta en cada push a `main`:

1. Calcula la ruta base (`/<nombre-del-repo>/`, o `/` si el repo es `<usuario>.github.io`) y la pasa
   al build mediante la variable `BASE_PATH`, que configura `base`, `start_url`, `scope` y el
   `basename` del router.
2. Copia `index.html` a `404.html` para que GitHub Pages sirva la SPA en rutas profundas.
3. Publica `dist/` con `actions/deploy-pages`.

Solo hay que activar **Settings → Pages → Source: GitHub Actions** en el repositorio.

### Netlify / Vercel

El proyecto incluye `public/_redirects` (Netlify) y `vercel.json` (Vercel) con el rewrite de SPA.
Basta con importar el repositorio: comando `npm run build`, directorio `dist`, sin `BASE_PATH`.

### Otros

Cualquier hosting estático sirve: `BASE_PATH=/ruta/ npm run build` y publicar `dist/`, con un
rewrite de todas las rutas a `index.html`.

## Arquitectura y decisiones

- **Lógica de juego pura y separada de React.** `src/game/reducer.ts` es una máquina de estados
  (`idle → memorize → guess → roundWon → …` o `→ over`) sin efectos: recibe acciones y devuelve un
  nuevo estado. Es trivial de testear y hace que la UI sea un reflejo del estado.
- **Efectos en un hook.** `useMemoryGame` conecta el reducer con los temporizadores (intervalo de la
  cuenta atrás, pausa entre rondas) y expone una API mínima (`start`, `pick`, `setDifficulty`...).
- **Aleatoriedad inyectable.** Todas las funciones que barajan aceptan una `RandomFn`, lo que
  permite partidas deterministas en los tests sin mockear `Math.random` globalmente.
- **Componentes reutilizables y sin estado** (`Button`, `TextField`, `Toggle`, `Stat`, `Board`,
  `Countdown`...) con CSS Modules y tokens de diseño en `src/styles/global.css`.
- **Estado del jugador en contexto** (`PlayerProvider`) persistido en `localStorage` con acceso
  seguro (nunca lanza en modo privado o sin cuota). La ruta `/game` está protegida por
  `RequirePlayer`.
- **Configuración de dificultad centralizada** en `src/game/difficulty.ts`, de donde la leen tanto
  el juego como la UI (selector y tabla de la pantalla de inicio).
- **Sin dependencias de UI** para mantener el bundle pequeño (~90 KB gzip incluidos React y el
  router) y el control total sobre accesibilidad y estilos.

## Estructura del proyecto

```
├── .github/workflows/     # CI (tipos, lint, formato, tests, e2e) y despliegue a GitHub Pages
├── e2e/                   # Tests end-to-end (Playwright)
├── public/                # Iconos PWA, favicon, _redirects
├── scripts/               # generate-icons.mjs
├── src/
│   ├── components/        # Componentes reutilizables (cada uno con su CSS Module y test)
│   ├── game/              # Lógica del juego: dificultad, tablero, reducer y hook
│   ├── hooks/             # useBestScore, useOnlineStatus
│   ├── lib/               # storage, scores, vibrate
│   ├── pages/             # HomePage y GamePage
│   ├── player/            # Contexto del jugador, validación de nombre y guard de ruta
│   ├── styles/            # Estilos globales y tokens
│   ├── test/              # Setup de Vitest, helpers de render y aleatoriedad determinista
│   ├── App.tsx            # Rutas
│   └── main.tsx           # Arranque: router, App y aviso de PWA
├── playwright.config.ts
└── vite.config.ts         # React, PWA (manifest + Workbox) y configuración de Vitest
```
