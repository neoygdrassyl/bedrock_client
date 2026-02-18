# AGENTS.md — Frontend Dovela (Curaduría Urbana)

Guía operativa para agentes de código que trabajen en este frontend React.
Léela completa antes de modificar cualquier archivo.

---

## 1. Visión general

Esta SPA modela el proceso de **curaduría urbana**: gestión de expedientes, licencias, resoluciones, términos legales (relojes de tiempo), trámites PQRS, nomenclaturas, zonas de uso y documentos jurídicos.

- **Instancia real:** Curaduría Urbana 1 de Bucaramanga — `https://curaduria1bucaramanga.com.co/`
- **Cada componente, service y ruta representa una relación legal real.** No elimines ni desconectes funcionalidades existentes sin que se pida explícitamente.
- **Backend:** PHP/MySQL en `C:\xampp\htdocs\dovela-backend`, accesible vía **MCP Filesystem**. Úsalo para inspeccionar endpoints, modelos y lógica de negocio cuando necesites entender un contrato de API.

### Stack principal

| Pieza | Tecnología |
|---|---|
| Framework | React 16 (CRA 4, `react-scripts`) |
| Routing | `react-router-dom` v5 (`BrowserRouter`, `Switch`, `Route`) |
| Estado | Local con `useState`/`useReducer`; no hay store global (Redux/Zustand) |
| HTTP | `axios` — instancia central en `src/http-common.js` |
| UI | Bootstrap 5 + MDB React + RSuite 5 + `styled-components` |
| Temas | `styled-components` (`ThemeProvider`) — `lightTheme` / `darkTheme` en `src/app/components/theme.js` |
| Internacionalización | `i18next` + `react-i18next` (ES por defecto, EN disponible) |
| PDF/Docs | `jsPDF`, `pdf-lib`, `react-pdf` + motor de plantillas HTML en `src/app/utils/` |
| Alertas | `sweetalert2` + `sweetalert2-react-content` |
| Fechas | `moment` + `moment-business-days` |
| Tests | `@testing-library/react` + `@testing-library/jest-dom` |

---

## 2. Comandos esenciales

```bash
# Instalar dependencias
npm install

# Arrancar en desarrollo (requiere .env con REACT_APP_API_URL)
npm start

# Build de producción
npm run build

# Correr tests
npm test

# Tests en modo CI (sin modo interactivo)
CI=true npm test
```

### Variables de entorno requeridas

Crea un archivo `.env` (o `.env.local`) en la raíz del proyecto:

```
REACT_APP_API_URL=http://localhost/dovela-backend/public
REACT_APP_GLOBAL_ID=<id_de_curaduria>
```

> El script `start` usa `env-cmd` para inyectar las variables. Sin `.env` el servidor de desarrollo falla silenciosamente en las llamadas HTTP.

---

## 3. Estructura de carpetas

```
src/
  http-common.js          ← Instancia Axios global
  app/
    App.js                ← Router principal + contexto de auth + ThemeProvider
    components/           ← Componentes reutilizables (navbar, footer, theme, global styles…)
    pages/
      user/               ← Todas las páginas de la aplicación
        clocks/           ← Módulo de relojes legales (el más complejo)
        records/          ← Radicados / expedientes
        nomenclature/     ← Nomenclatura urbana
        zone_use/         ← Zonas de uso del suelo
        submit/           ← Ventanilla única
        ...
    services/             ← Una clase por dominio, llaman a http-common.js
    utils/                ← Motor de plantillas (TemplateEngine, ResoEngineTemplate, …)
    translation/          ← Archivos i18n (es/, en/)
    img/                  ← Assets estáticos
  styles/                 ← CSS global adicional
public/
  templates/              ← Plantillas HTML de resoluciones y actos (NO editar sin conocer el motor)
```

---

## 4. Estándares de código

### Componentes

- Usa **componentes funcionales con hooks** para todo código nuevo. Los componentes de clase (`Component`) son legado; no los repliques.
- Nombra componentes y archivos en **PascalCase** para páginas/componentes, y **camelCase** para services, hooks y utils.
- Coloca la lógica de negocio en services (`src/app/services/`) y hooks personalizados; los componentes solo orquestan UI y estado local.
- Prefiere **hooks personalizados** (`useXxx`) para encapsular lógica reutilizable (modelo ejemplo: `src/app/pages/user/clocks/hooks/useClocksManager.js`).

### Servicios y HTTP

- **Toda llamada HTTP pasa por `src/http-common.js`** (instancia Axios con `baseURL` desde `process.env.REACT_APP_API_URL`).
- Cada dominio tiene su propio service en `src/app/services/`. Crea uno nuevo por módulo en lugar de acumular en `custom.service.js`.
- Maneja errores de Axios con `.catch()` y notifica al usuario con `Swal`; nunca dejes errores silenciosos.

```js
// Patrón correcto en un componente/hook
import MiService from '../../../services/mi.service';
const [data, setData] = useState([]);
useEffect(() => {
  MiService.getAll()
    .then(res => setData(res.data))
    .catch(() => Swal.fire('Error', 'No se pudo cargar la información', 'error'));
}, []);
```

### Formularios

- Controla formularios con estado local (`useState`). Para formularios complejos de múltiples pasos usa `react-form-stepper`.
- Valida en el frontend antes de enviar; muestra errores inline o con `Swal`.

### Internacionalización

- Usa el hook `useTranslation()` o el HOC `withTranslation()` para todos los textos visibles.
- Agrega claves en `src/app/translation/es/translations.js` y su equivalente en `en/`.

### Nomenclatura de archivos

| Tipo | Patrón |
|---|---|
| Página | `nombreModulo.page.js` o `nombreModulo.js` |
| Componente | `nombreComponente.component.js` o `NombreComponente.js` |
| Service | `dominio.service.js` |
| Hook | `useNombreHook.js` |
| CSS de módulo | `nombreModulo.css` junto al componente |

---

## 5. UX/UI y diseño

### Sistema de temas

- El tema se gestiona en `App.js` con `ThemeProvider` de `styled-components`.
- Tokens de color están en `src/app/components/theme.js` (`lightTheme` / `darkTheme`).
- **Colores de texto primario:** `DarkSlateGray` (light) / `#d9d9d9` (dark).
- **Fondo primario:** `white` (light) / `#4d4d4d` (dark).
- **Acento/secundario:** `#5bc0de` (light) / `#279bbe` (dark).
- Usa las clases CSS globales de `src/app/components/global.js` en lugar de colores inline:
  - `.container-primary`, `.container-secondary`
  - `.bg-card`, `.bg-card-2`
  - `.app-text-primary`, `.app-text-secondary`

### Tipografía y accesibilidad

- Fuente base: `Roboto, Helvetica, Arial, sans-serif` (definida en `GlobalStyles`).
- El sistema permite ajustar tamaño de fuente (5 niveles) vía `src/app/components/font.js`. No rompas esta escala con `!important` inline.

### Componentes UI

- Usa los componentes de **Bootstrap 5**, **MDB React** o **RSuite** según lo que ya existe en el módulo que estás tocando. No introduzcas una cuarta librería UI.
- Para tablas de datos: `react-data-table-component` o `@silevis/reactgrid` (ya usados).
- Para alertas/confirmaciones: siempre `Swal` (`sweetalert2`).
- Para fechas/calendarios: `react-calendar`, `react-date-picker` o `moment`.

---

## 6. Integración con backend

### Contrato de API

- **Base URL:** `process.env.REACT_APP_API_URL` (ej. `http://localhost/dovela-backend/public`).
- Todos los requests van como `multipart/form-data` (header por defecto en `http-common.js`).
- Autenticación: basada en sesión/token gestionada en el contexto `ProvideAuth` de `App.js`. El endpoint de login es `POST /login`.

### Inspeccionar el backend

Cuando necesites entender la firma de un endpoint, las columnas de una tabla o la lógica de negocio del servidor, **usa MCP Filesystem** apuntando a `C:\xampp\htdocs\dovela-backend`. Ahí encontrarás controladores PHP, modelos y rutas.

### Levantar backend local

```
# En Windows, asegúrate de que XAMPP esté corriendo Apache y MySQL
# El backend queda disponible en http://localhost/dovela-backend/public
```

### Servicios relevantes por módulo

| Módulo | Service |
|---|---|
| Expedientes/FUN | `fun.service.js` |
| Archivo | `archive.service.js` |
| Radicados | `record_eng.js`, `record_law.js`, `record_arc.js`, `record_ph.js` |
| Usuarios/auth | `users.service.js`, `custom.service.js` |
| Nomenclatura | `nomeclature.service.js` |
| Zona de uso | `zone_use.service.js` |
| Certificaciones | `certifications.service.js` |
| PQRS | `pqrs_main.service.js` |
| Citas | `appointments.service.js` |

---

## 7. Motor de plantillas de documentos

El módulo genera PDFs de resoluciones y actos administrativos a partir de plantillas HTML en `public/templates/`.

- **No modifiques** los archivos de `public/templates/` sin entender `src/app/utils/TemplateEngine.js`.
- Los modelos disponibles son: `open`, `des`, `delete`, `return`, `transfer`, `eje_open`, `eje_des`, `eje_neg`.
- Usa `src/app/utils/BaseDocumentUtils.js` para operaciones comunes de documentos.

---

## 8. Testing

### Estado actual

No existen tests escritos en el proyecto. El boilerplate de `@testing-library/react` está instalado y listo.

### Qué escribir cuando añadas tests

- **Unitarios** para hooks (`hooks/useClocksManager.js`, `hooks/useAlarms.js`) y utils (`BusinessDaysCol.js`, `TemplateEngine.js`).
- **Integración** para flujos críticos: login, carga de expediente, generación de resolución.
- **No se requieren tests e2e** por ahora (no hay Playwright/Cypress configurado).

### Convenciones

```js
// Nombra los archivos junto al componente
// MiComponente.test.js

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MiComponente from './MiComponente';

test('muestra el título correctamente', () => {
  render(<MiComponente title="Test" />);
  expect(screen.getByRole('heading', { name: /test/i })).toBeInTheDocument();
});
```

---

## 9. Seguridad y calidad

- **No hardcodees URLs, credenciales ni IDs** de instancia en el código. Usa `process.env.REACT_APP_*`.
- Datos sensibles (NIT, emails, firmantes) están en `src/app/components/jsons/vars.js` — no los expongas en logs.
- El formulario de login usa `react-google-recaptcha`; no lo elimines.
- **Antes de hacer merge**, verifica:
  - [ ] No hay `console.log` de datos sensibles.
  - [ ] Las strings visibles al usuario usan `i18next` (no texto hardcodeado).
  - [ ] Nuevos estilos usan las clases de `GlobalStyles` o variables del tema, no colores inline.
  - [ ] Llamadas HTTP nuevas están en un service, no directamente en el componente.
  - [ ] No se rompe el routing existente en `App.js`.
  - [ ] La funcionalidad preexistente conectada al módulo modificado sigue operando.

---

## 10. Lo que NO debes hacer

- **No elimines rutas** de `App.js` sin confirmación explícita; cada ruta es un módulo legal activo.
- **No cambies el esquema de datos** que llega del backend sin verificar el contrato en `C:\xampp\htdocs\dovela-backend`.
- **No reemplaces librerías UI** sin consenso; hay estilos que dependen de versiones específicas.
- **No introduzcas estado global** (Redux, Zustand, Context API para datos de servidor) sin discutirlo; el modelo actual es estado local + llamadas directas por servicio.
