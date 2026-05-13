# Dovela Frontend

SPA de React 19 + Vite 6 para la gestion de procesos de curaduria urbana. Este README resume los comandos que necesita un desarrollador nuevo para levantar, compilar, validar y desplegar el frontend.

## Requisitos

- Node 22+
- npm
- Backend local disponible en `http://localhost:3001` si se va a usar el proxy `/api`

Instala dependencias con:

```bash
npm ci
```

## Desarrollo local

### `npm run dev`

Levanta Vite en modo `development` usando `.env.development`.

```bash
npm run dev
```

La aplicacion queda disponible en `http://localhost:3000`.

### `npm start`

Alias de desarrollo equivalente a `npm run dev`.

```bash
npm start
```

## Builds inteligentes

Los builds usan modos explicitos de Vite para cargar variables diferentes segun el entorno. Todos generan la salida estatica en `build/`.

| Comando | Modo Vite | Uso recomendado |
|---|---|---|
| `npm run build` | `production` | Build productivo por defecto. |
| `npm run build:prod` | `production` | Build productivo explicito para despliegue. |
| `npm run build:production` | `production` | Alias descriptivo de produccion. |
| `npm run build:dev` | `development` | Build con variables de desarrollo para validar integraciones locales. |
| `npm run build:analyze` | `production` | Build productivo con reporte visual de chunks. |

Los scripts de build usan `build-tools/run-vite-build.mjs`, un runner Node compatible con Linux, macOS y Windows. El runner agrega `NODE_OPTIONS=--max-old-space-size=4096` al proceso de Vite porque el empaquetado de Rollup de esta SPA puede superar el heap default de Node durante `rendering chunks`.

### `npm run build`

Compila con `.env.production`. Es el build productivo por defecto.

```bash
npm run build
```

### `npm run build:prod`

Comando recomendado para CI/CD y despliegues productivos.

```bash
npm run build:prod
```

### `npm run build:dev`

Compila con `.env.development`. Sirve para revisar que el bundle compile usando endpoints y valores de desarrollo.

```bash
npm run build:dev
```

### `npm run build:analyze`

Compila en modo produccion y activa `VITE_BUILD_ANALYZE=true` desde el runner para generar `build/stats.html`.

```bash
npm run build:analyze
```

Usa este comando cuando necesites revisar peso de chunks o dependencias incluidas en el bundle.

## Variables de entorno

Vite carga variables segun el modo:

| Archivo | Cuando se usa |
|---|---|
| `.env.development` | `npm run dev`, `npm start`, `npm run build:dev` |
| `.env.production` | `npm run build`, `npm run build:prod`, `npm run build:production`, `npm run build:analyze` |
| `.env.example` | Plantilla para documentar variables requeridas. |
| `.env.local`, `.env.development.local`, `.env.production.local` | Overrides locales no versionados. |

Toda variable expuesta al frontend debe empezar por `VITE_`. Estas variables quedan embebidas en el bundle del navegador, asi que no pongas secretos privados en archivos `VITE_*`.

Para desarrollo, `.env.development` usa la llave publica de prueba oficial de Google reCAPTCHA v2:

```bash
VITE_GOOGLE_CAPTCHA_HTML="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
```

En produccion reemplazala desde `.env.production.local` o desde el pipeline con la llave publica real del sitio. Si la variable queda vacia, la pantalla de login muestra un aviso de configuracion y no intenta montar `ReCAPTCHA`, evitando el error `Missing required parameters: sitekey`.

Produccion queda configurada por defecto para CUB1:

```bash
VITE_GLOBAL_ID="cb1"
VITE_API_URL="https://prod.curaduria1bucaramanga.com.co/api"
```

## Despliegue

El servidor final solo necesita el contenido de `build/`. No necesita `node_modules`, Vitest, Playwright ni herramientas de desarrollo.

Flujo recomendado en la maquina de build o pipeline:

```bash
npm ci
npm run build:prod
```

Luego despliega unicamente el contenido de:

```bash
build/
```

No uses este flujo para compilar:

```bash
npm ci --omit=dev
npm run build
```

`vite` y `@vitejs/plugin-react` viven correctamente en `devDependencies`: son necesarios para compilar, pero no para servir el resultado estatico. Si necesitas mas detalle, revisa `BUILD_DEPLOYMENT.md`.

## Pruebas y auditorias

### `npm test`

Ejecuta la suite de Vitest una sola vez.

```bash
npm test
```

Para ejecutar una prueba especifica:

```bash
npm test -- src/__tests__/SmartBuildConfig.unit.test.js
```

### `npm run test:e2e`

Ejecuta Playwright.

```bash
npm run test:e2e
```

### `npm run audit:preflight`

Ejecuta auditorias estaticas rapidas antes de cerrar cambios relevantes.

```bash
npm run audit:preflight
```

## Referencias utiles

- `BUILD_DEPLOYMENT.md`: contrato completo de build y despliegue.
- `AGENTS.md`: reglas operativas del frontend para agentes y colaboradores.
- `ai/system-map.md`: mapa funcional del sistema cuando el cambio toca dominio, rutas, auth o integraciones.
