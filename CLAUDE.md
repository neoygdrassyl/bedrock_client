# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

For detailed operational guide, read **`AGENTS.md`**.

## Build & dev commands

```bash
nvm use 22              # MANDATORY — Vite 6 requires Node 22+ (OpenSSL 3)

npm start               # dev server on :3000
npm run build           # production build → build/
npm test                # vitest run (single pass, 149 tests)
npm run test:watch      # vitest in watch mode
```

### Environment variables (`.env`)

```env
VITE_API_URL=http://localhost/dovela-backend/public
VITE_GLOBAL_ID=<curaduria_id>
```

Use `import.meta.env.VITE_*` — **never `process.env`**.

## What this project is

SPA for **curaduría urbana** (urban planning office — Bucaramanga, Colombia). Every route, component, and service models a real legal process. Do not remove or disconnect existing functionality without explicit instruction.

**Backend:** PHP/MySQL (`C:\xampp\htdocs\dovela-backend`). All HTTP goes through `src/http-common.js` (Axios, `multipart/form-data`).

## Stack

React 19.2.4 | Vite 6.4.1 | Vitest 4 | react-router-dom v6 | Bootstrap 5 + RSuite 5 | styled-components 6 | axios 1.13 | i18next 24 | sweetalert2 11 | moment

State is local only (`useState`/`useReducer`) — no global store.

## Key architecture

- **Entry:** `index.html` (root) → `src/index.js` (`createRoot`)
- **Router + auth:** `src/app/App.js` — 24 routes (7 public, 15 private via `PrivateRoute`)
- **HTTP layer:** `src/http-common.js` → 27 service classes in `src/app/services/`
- **UI wrappers:** `src/app/components/ui/index.js` — Bootstrap 5 replacements for removed `mdb-react-ui-kit`
- **Themes:** `src/app/components/theme.js` (lightTheme/darkTheme via styled-components `ThemeProvider`)
- **i18n:** `src/app/translation/{es,en}/` — use `useTranslation()` for all visible text
- **PDF engine:** `src/app/utils/TemplateEngine.js` + HTML templates in `public/templates/`
- **Tests:** `src/__tests__/*.test.js` — Vitest API (`vi.fn`, `vi.mock`), not Jest
- **Vite plugins** (`vite.config.mjs`): `jsxInJs` (JSX in .js files), `cjsToEsm` (require→import), `fix-moment-business-days`

## Critical rules

- **Functional components + hooks** for all new code (178 class components exist as legacy — don't replicate)
- **No `React.forwardRef()`** — React 19 passes `ref` as a normal prop
- **No `defaultProps`** on functional components — use default parameter values
- **No `mdb-react-ui-kit`** — removed intentionally; wrappers are in `ui/index.js`
- **No global state** (Redux/Zustand) without discussion
- **No new UI libraries** without consensus
- **No `process.env`** — use `import.meta.env.VITE_*`
- HTTP calls go in `src/app/services/`, not in components
- Handle errors with `.catch()` + `Swal.fire()`
- Don't remove routes from `App.js` — each is an active legal module
- Don't edit `public/templates/` without understanding `TemplateEngine.js`
- Sensitive data in `src/app/components/jsons/vars.js` — never log it
- All 149 tests must pass before merge

## Migration context

Migrated from React 16 + CRA 4 → React 19 + Vite 6 (branch `feat/react-19-migration`, feb 2026). Phases 0–6 complete. 157 class components migrated to functional with hooks. 16 classes remain (1 Error Boundary + 14 charts react-vis + 1 commented-out). Phase 7 (replace abandoned libs: react-vis, react-quill, react-google-maps) is next and incremental. Details in `.github/instructions/MIGRATION_PLAN.md` and `MIGRATION_LOG.md`.

Legacy libs still working at runtime: `react-quill@1.3.5`, `react-vis@1.11.7`, `@silevis/reactgrid@4.1.17`.

## Context7 — Documentation lookup

Before writing code that uses external libraries, query up-to-date docs via **Context7 MCP** (`resolve-library-id` → `get-library-docs`).

**Always consult** (high risk of generating outdated API):
- React 19 (`/reactjs/react.dev`) — refs, hooks, no forwardRef/defaultProps
- react-router v6 (`/remix-run/react-router`) — no Switch/useHistory/Redirect
- Vite 6 (`/vitejs/vite`) — config, plugins, env vars
- Vitest (`/vitest-dev/vitest`) — `vi.*` API, not `jest.*`
- styled-components 6 (`/styled-components/styled-components`) — `.attrs()`, ThemeProvider

**Consult when working on related modules:** Bootstrap 5 (`/twbs/bootstrap`), RSuite 5 (`/rsuite/rsuite`), @testing-library/react (`/testing-library/testing-library-docs`), react-i18next (`/i18next/react-i18next`), react-pdf 9 (`/wojtekmaj/react-pdf`), sweetalert2 (`/sweetalert2/sweetalert2`).
