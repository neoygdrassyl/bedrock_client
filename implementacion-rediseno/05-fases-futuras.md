# 05 — Roadmap: Fases 3–6

## Prioridad inmediata: Cerrar la brecha visual

Antes de cualquier fase nueva, se debe resolver la brecha documentada en `06-brecha-visual.md`. El shell actual funciona pero no tiene el nivel de pulido visual de las apps de referencia.

---

## Fase 3 — Migracion del modulo Licencias (FUN)

**Riesgo:** ALTO — Es el modulo mas grande y complejo del sistema.
**Archivos clave:** `src/app/pages/user/fun.js` (1950 lineas), `fun.service.js`
**Dependencias:** Clocks, Records, Expeditions, documentos

### 3.1 Analisis previo
- Mapear todos los subcomponentes de FUN (radicar, gestion, version nav, alertas)
- Documentar los flujos de datos: que services llama, que modales abre, que estados mantiene
- Identificar los 4 disciplinas de records con su logica distinta
- Leer `.github/instructions/clocks.instructions.md` antes de tocar Clocks

### 3.2 Vista de listado de licencias
- Migrar la tabla principal de react-data-table-component a DataTable (tanstack)
- Filtros como pills (estado, tipo, fecha de radicacion)
- Badges de estado con colores semanticos (en tramite = primary, aprobada = accent, rechazada = destructive)
- Click en fila abre Sheet lateral con resumen rapido

### 3.3 Vista de detalle de licencia
- Redisenar como "pagina Notion" — header con datos clave del expediente
- Tabs horizontales: Datos generales | Documentos | Historial | Observaciones | Relojes
- Cada tab migrada individualmente de Bootstrap a Tailwind/shadcn
- Sidebar de navegacion vertical agrupada con indicadores de progreso (como en la spec)

### 3.4 Formularios de radicacion
- Mantener la logica de validacion exacta — solo cambiar la presentacion
- Inputs shadcn con labels, helper text, error states
- Wizards multi-step con progress indicator visual
- Modales legacy (react-modal) → Dialog de shadcn

### 3.5 Clocks / Relojes legales
- Componente critico: cualquier cambio afecta FUN, Records, PQRS y expedicion
- Redisenar la visualizacion de fases procesales con graficas modernas
- Alarmas como badges/banners dentro del detalle del expediente
- Mantener toda la logica de `useClocksManager`, `useProcessPhases`, `useAlarms` intacta

### 3.6 Limpieza
- Eliminar `container-primary`, `fung_nav`, `fun_nav` de los archivos migrados
- Eliminar reglas de App.css que solo aplicaban a FUN
- Actualizar tests e2e para las nuevas interacciones

---

## Fase 4 — Migracion del modulo PQRS

**Riesgo:** MEDIO — Muchos subcomponentes, menos cobertura de tests que FUN.

### 4.1 Analisis previo
- Mapear subcomponentes de PQRS (creacion, seguimiento, respuesta, admin)
- Documentar relaciones con FUN y Expeditions

### 4.2 Vista de listado PQRS
- Tabla con DataTable
- Filtros por tipo (peticion, queja, reclamo, sugerencia), estado, fecha
- Badges de tipo con colores distintos
- Indicador de tiempo legal restante (barra de progreso)

### 4.3 Vista de detalle PQRS
- Layout similar al de licencias — header + tabs
- Timeline de interacciones (solicitud → asignacion → respuesta → cierre)
- Documentos adjuntos en tab dedicada

### 4.4 Formulario de creacion/respuesta
- Migrar a inputs shadcn
- Mantener validaciones de campos obligatorios legales
- SweetAlert2 → Dialog/AlertDialog para confirmaciones

### 4.5 Limpieza
- Eliminar `btn-navpqrs`, `pqrs_nav` de los archivos migrados
- Eliminar reglas CSS legacy de PQRS

---

## Fase 5 — Modulos restantes

**Riesgo:** MEDIO — Son modulos mas pequeños pero hay muchos.

### Modulos a migrar (en orden de impacto):

| Modulo | Archivos aprox | Complejidad |
|---|---|---|
| Archivo (archive) | ~5 | Baja |
| Ventanilla (submit) | ~8 | Media (Collapsible, react-modal) |
| Nomenclatura | ~4 | Baja |
| Publicaciones (publish) | ~3 | Baja (react-modal) |
| Mensajes (mail) | ~5 | Media |
| Calendario (appointments) | ~6 | Media (react-modal, Collapsible) |
| Expediciones (expeditions) | ~8 | Alta (subcomponentes, relaciones cruzadas) |
| Certificados | ~3 | Baja |
| Normas y Uso de suelo | ~4 | Baja |
| Profesionales | ~2 | Baja |
| Liquidador/Calculadora | ~3 | Baja |
| Documentos (OSHA) | ~3 | Baja |

### Patron de migracion para cada modulo:
1. Leer el componente completo y documentar funcionalidades
2. Migrar wrapper/contenedor exterior a Tailwind
3. Migrar tabla principal a DataTable (si aplica)
4. Migrar modales de react-modal a Dialog
5. Migrar formularios a inputs shadcn
6. Migrar alertas SweetAlert2 a Dialog/AlertDialog
7. Reemplazar iconos FontAwesome con Icon bridge (Lucide)
8. Eliminar CSS legacy del modulo
9. Verificar dark mode
10. Actualizar tests

---

## Fase 6 — Limpieza final de dependencias

**Riesgo:** MEDIO — Cambios transversales que afectan todo el proyecto.
**Prerequisito:** Fases 3-5 completadas al 100%.

### 6.1 Eliminar react-data-table-component
- Verificar que ningun archivo lo importa
- Remover de `package.json`
- Eliminar CSS/overrides asociados

### 6.2 Eliminar react-modal
- Verificar que todos los modales usan Dialog de shadcn
- Remover de `package.json`
- Eliminar overrides de `ReactModal__*` en App.css

### 6.3 Migrar SweetAlert2
- Este es el cambio mas grande (~100 archivos, ~2330 lineas)
- Crear un wrapper `useAlert()` o `confirm()` que use Dialog/AlertDialog internamente
- Migrar archivo por archivo con tests
- Remover de `package.json`

### 6.4 Eliminar FontAwesome CDN
- Verificar que todos los ~216 archivos con `<i className="fas fa-*">` usan el Icon bridge
- Remover la etiqueta `<link>` de FontAwesome del `index.html`

### 6.5 Eliminar styled-components
- Migrar `global.js` a `index.css` (o eliminar si ya es redundante)
- Verificar que ningun componente usa `styled()`
- Remover de `package.json`

### 6.6 Eliminar MDB wrappers
- Verificar que ningun componente importa de `src/app/components/ui/index.js`
- Eliminar el archivo (914 lineas)

### 6.7 Activar Tailwind preflight
- Cambiar `preflight: false` a `preflight: true` en `tailwind.config.js`
- Esto normalizara todos los estilos base
- ALTO RIESGO: puede romper componentes que dependian de los defaults del navegador
- Hacer esto como ultimo paso, con revision visual exhaustiva

### 6.8 Reducir Bootstrap a grid-only (o eliminar)
- Evaluar si se puede reemplazar el grid de Bootstrap con grid/flex de Tailwind
- Si si: eliminar Bootstrap 5 completamente
- Si no: extraer solo la hoja de grid en un CSS custom minimo

---

## Estimacion de esfuerzo

| Fase | Sesiones estimadas | Archivos afectados |
|---|---|---|
| Brecha visual | 1-2 | ~15 |
| Fase 3 (FUN) | 4-6 | ~40 |
| Fase 4 (PQRS) | 2-3 | ~20 |
| Fase 5 (Restantes) | 3-5 | ~50 |
| Fase 6 (Limpieza) | 2-4 | ~200+ |
| **Total** | **12-20** | — |

Cada "sesion" es una sesion de trabajo con un agente, terminando con build + tests pasando.
