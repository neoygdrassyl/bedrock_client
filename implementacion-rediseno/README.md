# Rediseno UI/UX Dovela — Documento Maestro

**Branch de trabajo:** `feat/ui-redesign-phases-0-2`
**Fecha de inicio:** 2026-04-18
**Estado:** Fases 0-2 implementadas, refinamiento visual pendiente

---

## 1. Objetivo

Rediseno completo de la interfaz de Dovela. El resultado debe ser irreconocible respecto a la UI actual, manteniendo el 100% de funcionalidades existentes. La aplicacion debe verse y sentirse como software institucional de primer nivel — comparable a Linear, Notion o Figma en pulido visual, pero con la gravedad institucional que demanda la curaduria urbana.

## 2. Indice de documentos

| Documento | Proposito |
|---|---|
| [README.md](./README.md) | Este documento — indice y resumen ejecutivo |
| [01-estado-actual.md](./01-estado-actual.md) | Que se ha hecho, que falta, donde estamos |
| [02-principios-inquebrantables.md](./02-principios-inquebrantables.md) | Reglas de diseno que no se negocian |
| [03-apps-referencia.md](./03-apps-referencia.md) | Aplicaciones de referencia y que tomar de cada una |
| [04-antipatrones.md](./04-antipatrones.md) | Errores a evitar y como prevenirlos |
| [05-fases-futuras.md](./05-fases-futuras.md) | Roadmap detallado Fases 3-6 |
| [06-brecha-visual.md](./06-brecha-visual.md) | Analisis de la brecha entre lo implementado y lo esperado |
| [07-guia-estandares-rediseno.md](./07-guia-estandares-rediseno.md) | **Guia consolidada** — estado real, tokens, patrones, reglas, metricas |

### Documentos de referencia existentes (no duplicar)

| Documento | Ubicacion |
|---|---|
| Spec de diseno completa (670 lineas) | `docs/superpowers/specs/2026-04-18-dovela-redesign-design.md` |
| Plan de implementacion Fases 0-2 (2652 lineas) | `docs/superpowers/plans/2026-04-18-dovela-redesign-phases-0-2.md` |
| Screenshot del estado actual | `docs/captura_pantalla_implementacion_rediseno.png` |
| Agente especializado para el rediseno | `.github/agents/dovela-ui-redesign.agent.md` |

## 3. Design system elegido

- **Estilo:** Trust & Authority
- **Paleta primaria:** `#2563EB` (azul institucional), `#059669` (verde aprobacion), `#F8FAFC` (fondo claro)
- **Dark mode:** Slate-900 sin negro puro, colores desaturados
- **Tipografia:** Inter (texto) + JetBrains Mono (codigo/datos tecnicos)
- **Layout:** Icon-rail oscuro 48px + panel contextual claro 180px (estilo VS Code/Figma)

## 4. Stack de estilos consolidado

**Destino final:** Tailwind CSS + shadcn/ui como unica fuente de verdad visual.

**Estado actual (transicion):**

```
Capa 1 (nueva, activa):   Tailwind CSS + shadcn/ui + CSS custom properties
Capa 2 (legacy, activa):  Bootstrap 5 (grid + utilidades basicas)
Capa 3 (legacy, activa):  App.css (~200 lineas reducidas de 555)
Capa 4 (legacy, activa):  global.js (styled-components, 147 lineas)
Capa 5 (legacy, minima):  styled-components en componentes puntuales
Capa 6 (legacy, muerta):  RSuite 5 (ya no importado en App.js)
```

**Cada fase debe reducir las capas 2-6 hasta eliminacion total en Fase 6.**

## 5. Commits realizados (Fases 0-2)

| # | Commit | Descripcion |
|---|---|---|
| 1 | `a2675d5d` | Design Tokens — CSS vars light/dark en index.css |
| 2 | `55ae0f8f` | Install 18 componentes shadcn/ui |
| 3 | `923704d7` | ThemeProvider — sistema dark/light mode |
| 4 | `3a50a057` | Icon Bridge — wrapper Lucide con fallback |
| 5 | `ee4c023d` | DataTable Wrapper — @tanstack/react-table |
| 6 | — | Sonner Verification (ya existia) |
| 7 | `ed21b27a` | Navigation Config — rutas en espanol, roles |
| 8 | `049eddfb` | App Shell Layout — IconRail + ContextPanel + HeaderBar + Footer |
| 9 | `565bcaff` | Extract LoginPage a archivo separado |
| 10 | `d36739d3` | Refactor App.js — layout routes, rutas espanol |
| 11 | `eb350ed6` | Redesign LoginPage — split-screen layout |
| 12 | `a8f281ad` | Redesign Dashboard — card grid |
| 13 | `c51732ca` | E2E Validation — todos los flows pasando |

### Refinamientos post-fase (misma sesion)

- Limpieza App.css (removidas ~300 lineas CSS muerto)
- Resolucion dual `:root` (variables huerfanas eliminadas)
- Fix tipografia (Roboto → Inter como primaria)
- Logo real de la curaduria en IconRail
- Footer con version, nombre, ciudad, NIT
- Theme toggle deduplicado (solo en HeaderBar)
- ContextPanel con transicion suave en estado vacio

## 6. Validacion tecnica

- **64 archivos de test, 449 tests — TODOS PASANDO**
- **Build de produccion exitoso** (`vite build` en ~30s)
- **6 specs e2e en Playwright** actualizados y funcionando

## 7. Archivos clave del shell nuevo

```
src/app/layouts/
  AppShell.jsx      — Shell principal (81 lineas)
  IconRail.jsx      — Rail de iconos (56 lineas)
  ContextPanel.jsx  — Panel contextual (~50 lineas)
  HeaderBar.jsx     — Header con breadcrumb + theme + user (91 lineas)
  AppFooter.jsx     — Footer con version e info (~30 lineas)
  navigation-config.js — Config de navegacion por rol (155 lineas)

src/app/pages/auth/
  LoginPage.jsx     — Login split-screen (248 lineas)

src/app/pages/user/
  dashboard.js      — Dashboard con card grid (97 lineas)
```

## 8. Que sigue

Ver [05-fases-futuras.md](./05-fases-futuras.md) para el roadmap completo.
La prioridad inmediata es **cerrar la brecha visual** documentada en [06-brecha-visual.md](./06-brecha-visual.md) antes de avanzar a Fase 3.
