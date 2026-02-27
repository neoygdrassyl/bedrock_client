# AGENTS.md — Frontend Dovela (Curaduría Urbana)

Guía operativa para agentes de código. Léela completa antes de modificar cualquier archivo.

---

## 1. Qué es este proyecto

SPA que modela el proceso de **curaduría urbana**: expedientes, licencias, resoluciones, relojes de tiempo legales, PQRS, nomenclaturas, zonas de uso y documentos jurídicos.

- **Instancia real:** Curaduría Urbana 1 de Bucaramanga — `https://curaduria1bucaramanga.com.co/`
- **Cada componente, service y ruta representa una relación legal real.** No elimines ni desconectes funcionalidades sin que se pida explícitamente.
- **Backend:** PHP/MySQL en `C:\xampp\htdocs\dovela-backend` (inspeccionar vía MCP Filesystem para entender contratos de API).

### Stack

| Pieza | Tecnología |
|---|---|
| Framework | React 19 (`react@19.2.4`) — componentes funcionales + hooks |
| Build | Vite 6 (`vite@6.4.1`) + 3 plugins custom en `vite.config.mjs` |
| Tests | Vitest 4 (`vitest@4.0.18`) + `@testing-library/react@16` |
| Routing | `react-router-dom` v6 (`Routes`, `Route element={}`, `useNavigate`) |
| Estado | Local con `useState`/`useReducer` — no hay store global |
| HTTP | `axios@1.13` — instancia central en `src/http-common.js` |
| UI | Bootstrap 5 + wrappers locales en `src/app/components/ui/` + RSuite 5 + `styled-components@6` |
| Temas | `ThemeProvider` (styled-components) — tokens en `src/app/components/theme.js` |
| i18n | `i18next@24` + `react-i18next@15` (ES por defecto, EN disponible) |
| PDF | `jsPDF`, `pdf-lib`, `react-pdf@9` + motor de plantillas en `src/app/utils/` |
| Alertas | `sweetalert2@11` (`Swal`) |
| Fechas | `moment` + `moment-business-days` |
| Node | **v22+** obligatorio (`.nvmrc` = 22) — Vite 6 requiere OpenSSL 3 |

---

## 2. Comandos

```bash
nvm use 22              # OBLIGATORIO antes de cualquier operación

npm start               # Dev server en :3000 (alias: vite)
npm run build           # Build de producción → build/
npm test                # vitest run (una sola pasada)
npm run test:watch      # vitest en modo watch
npm run preview         # Preview del build
```

### Variables de entorno (`.env` o `.env.local`)

```env
VITE_API_URL=http://localhost/dovela-backend/public
VITE_GLOBAL_ID=<id_de_curaduria>
```

Prefijo `VITE_`, acceso con `import.meta.env.VITE_*`. **No usar `process.env`.**

---

## 3. Estructura del proyecto

```
index.html                  ← Entry point de Vite (raíz, NO en public/)
vite.config.mjs             ← Plugins: jsxInJs, cjsToEsm, fix-moment-business-days
vitest.config.mjs            ← Config Vitest (plugins: cssNoop, jsxInJs)
src/
  index.js                  ← createRoot() de React 19
  http-common.js            ← Instancia Axios global (baseURL desde VITE_API_URL)
  __tests__/                ← 149 tests en 10 suites + setup.js
  app/
    App.js                  ← Router principal + ProvideAuth + ThemeProvider
    components/
      ui/index.js           ← Wrappers Bootstrap 5 (reemplazo de mdb-react-ui-kit, 909 líneas)
      theme.js              ← lightTheme / darkTheme
      global.js             ← GlobalStyles + clases CSS reutilizables
      font.js               ← Sistema de escala de fuente (5 niveles)
      navbar.js             ← Navegación principal
      jsons/vars.js         ← Datos sensibles de instancia (NIT, emails) — NO loguear
    pages/user/             ← Módulos de la aplicación:
      clocks/               ← Relojes legales (el más complejo; tiene hooks propios)
      records/              ← Radicados / expedientes (ARC, ENG, LAW, PH)
      fun_forms/            ← Formularios FUN + gráficas (usa react-vis — legacy)
      pqrs/                 ← PQRS (usa react-quill — legacy)
      submit/               ← Ventanilla única
      expeditions/          ← Expediciones de documentos
      archive/              ← Archivo documental
      nomenclature/         ← Nomenclatura urbana
      zone_use/             ← Zonas de uso del suelo
      certifications/       ← Certificaciones laborales
      norms/                ← Normatividad legal
      profesionals/         ← Directorio de profesionales
      guide_user/           ← Guía de usuario
      dev_guide/            ← Guía de desarrollo
    services/               ← Un service por dominio, todos usan http-common.js
    utils/                  ← Motor de plantillas (TemplateEngine, ResoEngineTemplate, etc.)
    translation/            ← Archivos i18n (es/, en/)
public/templates/           ← Plantillas HTML de resoluciones — NO editar sin entender TemplateEngine.js
```

### Rutas (App.js)

24 rutas totales: 7 públicas (`/login`, `/home`, `/norms`, `/certs`, `/zone_use`, `/dev-guide`, `/`) y 15 privadas protegidas por `PrivateRoute` (verifica `auth.user`, redirige a `/login` si es null).

### Servicios principales

27 archivos de service en `src/app/services/`. Los más relevantes:

| Módulo | Service |
|---|---|
| Auth/usuarios | `custom.service.js`, `users.service.js`, `data.service.js` |
| FUN/licencias | `fun.service.js` (el más extenso, 200+ métodos) |
| Radicados | `record_eng.js`, `record_law.js`, `record_arc.js`, `record_ph.js` |
| PQRS | `pqrs_main.service.js` |
| Archivo | `archive.service.js` |
| Expediciones | `expedition.service.js` |
| Ventanilla | `submit.service.js` |
| Nomenclatura | `nomeclature.service.js` |
| Zona de uso | `zone_use.service.js` |

---

## 4. Estándares de código

### Componentes

- **Funcionales con hooks** para todo código nuevo. Existen ~178 class components legacy — no repliques ese patrón.
- Si tocas un class component para un bugfix, **no lo conviertas** a funcional a menos que se pida.
- En React 19 `ref` es una prop normal — **no usar `React.forwardRef()`** en código nuevo:
  ```js
  // ✅ React 19
  const MyComp = ({ ref, children }) => <div ref={ref}>{children}</div>;
  // ❌ Obsoleto
  const MyComp = React.forwardRef((props, ref) => <div ref={ref} />);
  ```
- **No usar `defaultProps`** en funcionales — React 19 lo ignora. Usar valores por defecto en parámetros.
- Encapsular lógica reutilizable en hooks (`useXxx`). Modelo: `src/app/pages/user/clocks/hooks/useClocksManager.js`.

### HTTP y servicios

- **Toda llamada HTTP** va en un service de `src/app/services/`, no directamente en componentes.
- Manejar errores con `.catch()` + `Swal.fire(...)` — nunca silenciar errores.

```js
// Patrón correcto
import MiService from '../../../services/mi.service';
useEffect(() => {
  MiService.getAll()
    .then(res => setData(res.data))
    .catch(() => Swal.fire('Error', 'No se pudo cargar', 'error'));
}, []);
```

### UI

- **No instalar `mdb-react-ui-kit`** — fue eliminada intencionalmente. Los componentes MDB (`MDBCard`, `MDBBtn`, `MDBModal`, etc.) están reimplementados en `src/app/components/ui/index.js` como wrappers de Bootstrap 5.
- Usar clases de `GlobalStyles` (`.container-primary`, `.bg-card`, `.app-text-primary`) en vez de colores inline.
- Alertas: `Swal`. Tablas: `react-data-table-component`. Selects/pickers: RSuite 5.
- **No introducir** nueva librería UI sin consenso.

### Routing (v6)

```js
// ✅ Patrones actuales
<Route path='/ruta' element={<PrivateRoute><Pagina /></PrivateRoute>} />
const navigate = useNavigate();
navigate('/ruta');                    // push
navigate('/home', { replace: true }); // replace
navigate(-1);                         // back

// ❌ API v5 — NO existe en el proyecto
Switch, Redirect, useHistory, component={}, render={}
```

### i18n

Usar `useTranslation()` para todo texto visible. Agregar claves en `src/app/translation/es/translations.js` y `en/`.

### Nomenclatura de archivos

| Tipo | Patrón |
|---|---|
| Página | `nombreModulo.page.js` o `nombreModulo.js` |
| Componente | `nombreComponente.component.js` |
| Service | `dominio.service.js` |
| Hook | `useNombreHook.js` |

---

## 5. Testing

149 tests en 10 suites (smoke + integración). **Todos deben pasar antes de hacer merge.**

```bash
nvm use 22    # obligatorio
npm test      # vitest run
```

Tests en `src/__tests__/NombreModulo.tipo.test.js`. Usar `vi.fn()`, `vi.mock()`, `vi.spyOn()` (API de Vitest, no Jest). CSS se mockea automáticamente vía `cssNoop` en `vitest.config.mjs`.

```js
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

describe('MiComponente', () => {
  it('muestra el título', () => {
    render(<MiComponente title="Test" />);
    expect(screen.getByRole('heading', { name: /test/i })).toBeInTheDocument();
  });
});
```

---

## 6. Motor de plantillas de documentos

Genera PDFs de resoluciones y actos administrativos a partir de plantillas HTML en `public/templates/`.

- **No modificar** `public/templates/` sin entender `src/app/utils/TemplateEngine.js`.
- Modelos disponibles: `open`, `des`, `delete`, `return`, `transfer`, `eje_open`, `eje_des`, `eje_neg`.
- Operaciones comunes: `src/app/utils/BaseDocumentUtils.js`.

---

## 7. Plugins custom de Vite

Tres plugins en `vite.config.mjs` que mantienen compatibilidad post-migración CRA → Vite:

| Plugin | Qué hace | Por qué |
|--------|----------|---------|
| `jsxInJs()` | Trata `.js` en `src/` como JSX vía esbuild | CRA permitía JSX en `.js`; renombrar 357 archivos era inviable |
| `cjsToEsm()` | Convierte `require()` en `src/` a `import` ESM | CRA proveía shim de `require`; Vite es ESM-native |
| `fix-moment-business-days` | Parchea `moment-business-days` en pre-bundle | La lib usa `require('moment')` que rompe el interop CJS/ESM |

Si un archivo nuevo usa `require()`, el plugin lo convierte automáticamente. Pero preferir escribir `import` directamente.

---

## 8. Librerías legacy

Estas librerías funcionan en runtime pero tienen peerDeps que no incluyen React 19:

| Librería | Archivos | Reemplazo sugerido |
|----------|----------|-------------------|
| `react-quill@1.3.5` | 1 (`pqrs_rteReply.component.js`) | `react-quill-new` |
| `react-vis@1.11.7` | 16 archivos de gráficas | `recharts` |
| `@silevis/reactgrid@4.1.17` | 2 archivos (`record_arc_areas*`) | — |
| `react-google-maps@9.4.5` | 1 archivo | `@react-google-maps/api` |

Si alguna empieza a fallar, consultar `.github/instructions/MIGRATION_PLAN.md` (Fase 7).

---

## 9. Restricciones absolutas

1. **No eliminar rutas** de `App.js` sin confirmación — cada ruta es un módulo legal activo.
2. **No cambiar el esquema de datos** del backend sin verificar en `C:\xampp\htdocs\dovela-backend`.
3. **No usar `process.env`** — usar `import.meta.env.VITE_*`.
4. **No usar `React.forwardRef()`** ni `defaultProps` en código nuevo.
5. **No usar `react-scripts`** — el proyecto usa Vite.
6. **No introducir estado global** (Redux, Zustand) sin discutirlo.
7. **No introducir nueva librería UI** sin consenso.
8. Los 149 tests deben pasar (`npm test`) antes de cualquier merge.
9. `public/templates/` no se modifica sin entender el motor de plantillas.
10. Datos sensibles en `src/app/components/jsons/vars.js` — no exponer en logs.

---

## 10. Contexto de migración

El proyecto fue migrado de **React 16 + CRA 4** a **React 19 + Vite 6** en el branch `feat/react-19-migration` (feb 2026). Para el detalle completo de las 7 fases, conteos y decisiones:

- `.github/instructions/MIGRATION_PLAN.md` — Plan completo, estado de cada fase
- `MIGRATION_LOG.md` — Log de ejecución con métricas y diffs

**Estado actual:** Fases 0–5 completadas. Fase 6 (class → functional, 178 archivos) y Fase 7 (reemplazar libs abandonadas) son incrementales y no bloqueantes.

---

## 11. Context7 — Documentación actualizada obligatoria

Antes de implementar o modificar código que use librerías externas, consulta la documentación actualizada vía **Context7 MCP** usando `resolve-library-id` y luego `get-library-docs`.

### Consulta obligatoria (siempre)

Estas librerías tienen cambios de API fuertes entre versiones. Los LLMs frecuentemente generan código de versiones anteriores:

| Librería | Library ID | Errores típicos sin consultar |
|----------|------------|-------------------------------|
| **React 19** | `/reactjs/react.dev` | Generar `forwardRef`, `defaultProps`, `createRef` en funcionales |
| **react-router v6** | `/remix-run/react-router` | Generar `Switch`, `useHistory`, `Redirect`, `component={}` |
| **Vite 6** | `/vitejs/vite` | Usar `process.env`, configurar plugins con API de webpack |
| **Vitest** | `/vitest-dev/vitest` | Usar `jest.fn()`, `jest.mock()` en vez de `vi.*` |
| **styled-components 6** | `/styled-components/styled-components` | API antigua de `.attrs()`, patrones de v5 |

### Consulta recomendada (cuando se trabaje en el módulo)

| Librería | Library ID | Cuándo consultar |
|----------|------------|-----------------|
| **Bootstrap 5** | `/twbs/bootstrap` | Al modificar wrappers UI (`ui/index.js`) o crear componentes con clases BS5 |
| **RSuite 5** | `/rsuite/rsuite` | Al usar SelectPicker, DatePicker, TagPicker u otros componentes RSuite |
| **@testing-library/react** | `/testing-library/testing-library-docs` | Al escribir o modificar tests |
| **react-i18next** | `/i18next/react-i18next` | Al configurar i18n o usar hooks de traducción |
| **react-pdf 9** | `/wojtekmaj/react-pdf` | Al tocar el visor de PDFs (API cambió completamente desde v5) |
| **sweetalert2** | `/sweetalert2/sweetalert2` | Al crear alertas complejas (confirmaciones, inputs, timers) |
| **axios** | `/axios/axios-docs` | Al configurar interceptors o instancias custom |
