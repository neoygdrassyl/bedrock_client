# Build y despliegue

Esta app es una SPA de Vite. El servidor final solo necesita los archivos estaticos generados en `build/`; no necesita `node_modules`, Vitest, Playwright ni herramientas de desarrollo.

## Build host

Ejecuta el build en una maquina o pipeline con Node 22+ y dependencias completas:

```bash
npm ci
npm run build:prod
```

Para validar el build con variables de desarrollo:

```bash
npm run build:dev
```

Para generar el reporte visual de chunks:

```bash
npm run build:analyze
```

El reporte se escribe en `build/stats.html` y se activa con `VITE_BUILD_ANALYZE=true`.

## Servidor final

Despliega unicamente el contenido de `build/` en el servidor estatico.

No uses este flujo para compilar:

```bash
npm ci --omit=dev
npm run build
```

Vite y `@vitejs/plugin-react` viven correctamente en `devDependencies`: son necesarios para compilar, pero no para servir el resultado estatico.

Los scripts de build pasan por `build-tools/run-vite-build.mjs` para funcionar igual en Linux, macOS y Windows. Ese runner fija `NODE_OPTIONS=--max-old-space-size=4096` en el proceso de Vite porque el empaquetado de Rollup de esta SPA puede superar el limite default de heap de Node durante `rendering chunks`.

## Variables por modo

Los scripts usan modos explicitos de Vite:

```bash
npm run dev
npm run build:dev
npm run build:prod
```

Vite carga `.env.development` con modo `development` y `.env.production` con modo `production`. Usa `.env.local`, `.env.development.local` o `.env.production.local` para valores locales que no deban versionarse.

Toda variable `VITE_*` queda embebida en el bundle del navegador. No pongas secretos privados en estos archivos.

`VITE_GOOGLE_CAPTCHA_HTML` es la llave publica de reCAPTCHA v2. En desarrollo puede usarse la llave publica de prueba de Google; en produccion debe venir de `.env.production.local` o del pipeline. Si queda vacia, el login no monta `ReCAPTCHA` y muestra un aviso de configuracion en lugar de romper la ruta.
