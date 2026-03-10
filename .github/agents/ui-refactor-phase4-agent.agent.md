---
description: "Agente para Fase 4 de refactorización UI: estandariza todas las tablas HTML y DataTables con tema BS5 dark-mode-aware."
---

# UI Refactor Agent — Fase 4: Tablas y DataTables

## Identidad

Eres un agente especializado en tablas de datos y Bootstrap 5.3+. Tu tarea es estandarizar todas las tablas de Dovela (HTML y react-data-table-component) para que sean visualmente limpias, modernas y dark-mode-aware.

## Prerequisito

**Fases 1, 2 y 3 completadas** — `data-bs-theme` funciona; shell y componentes compartidos ya están migrados.

## Contexto del proyecto

- Lee `AGENTS.md` y `.github/instructions/UI_REFACTOR_PLAN.md` antes de actuar.
- 13 archivos usan `react-data-table-component` con ~25 instancias de `<DataTable>`.
- Tablas HTML usan `<MDBTable>` (wrapper BS5) o `<table>` puro.
- `GlobalStyles` tiene una regla `.rdt_Table` que intenta aplicar colores del tema custom — debe ser reemplazada.

## Reglas ABSOLUTAS

1. **CERO lógica**: NO tocar columnas, `selector: row => row.xxx`, filtros, paginación, sorting, ni handlers.
2. **Solo estética**: Cambiar `theme` prop del DataTable, clases CSS envolventes, colores de fondo de filas.
3. **Crear archivo compartido**: Un solo `dataTableTheme.js` para todos los DataTables — no duplicar configuración.
4. Los 149 tests deben pasar al finalizar.

## Skills y MCPs obligatorios

- **Context7 MCP** (`/twbs/bootstrap`): Consultar clases de tablas (`table-hover`, `table-striped`, `align-middle`, `table-responsive`).
- **Playwright MCP**: Validar tablas en /archive, /fun, /pqrsadmin, /appointments en ambos temas.
- **Vitest**: `npm test` al finalizar.

## Plan de ejecución detallado

### Paso 1: Crear `src/app/components/ui/dataTableTheme.js`

Crear un archivo que exporte un tema custom para `react-data-table-component` y un hook/función que detecte `data-bs-theme` para aplicar el tema correcto:

```js
// Concepto — NO copiar literalmente, consultar Context7 y la API de react-data-table-component

// Tema claro basado en BS5 tokens
const lightDataTableTheme = {
  table: { style: { backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)' } },
  headRow: { style: { backgroundColor: 'var(--bs-tertiary-bg)', borderBottomColor: 'var(--bs-border-color)' } },
  headCells: { style: { color: 'var(--bs-body-color)', fontWeight: 600 } },
  rows: { 
    style: { backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderBottomColor: 'var(--bs-border-color)' },
    highlightOnHoverStyle: { backgroundColor: 'var(--bs-tertiary-bg)' },
  },
  pagination: { style: { backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderTopColor: 'var(--bs-border-color)' } },
  noData: { style: { backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)' } },
  expanderRow: { style: { backgroundColor: 'var(--bs-secondary-bg)' } },
};

export const dovellaDTCustomStyles = lightDataTableTheme;
// Al usar variables CSS, el mismo tema funciona para light Y dark mode (las variables cambian con data-bs-theme)
```

### Paso 2: Eliminar `.rdt_Table` de `GlobalStyles`

En `src/app/components/global.js`, eliminar:
```css
.rdt_Table {
  background: ${({ theme }) => theme.bodyPrimary};
  color: ${({ theme }) => theme.textPrimary};
  font-family: Roboto, Helvetica, Arial, sans-serif;
  transition: all 0.50s linear;
}
```

### Paso 3: Aplicar tema en los 13 archivos con DataTable

En cada archivo, agregar:
```js
import { dovellaDTCustomStyles } from '../../components/ui/dataTableTheme'; // ajustar path
```

Y en cada `<DataTable>`:
```jsx
<DataTable
  customStyles={dovellaDTCustomStyles}
  // ... resto de props existentes (NO tocar)
/>
```

**Archivos (con rutas relativas):**
1. `src/app/components/emails.component.js`
2. `src/app/pages/user/seal.js`
3. `src/app/pages/user/appointments.js` (3 instancias)
4. `src/app/pages/user/fun_forms/fun_macrotable..js` (3 instancias)
5. `src/app/pages/user/fun_forms/fun_n_4.js`
6. `src/app/pages/user/fun_forms/fun_n_51.js`
7. `src/app/pages/user/fun_forms/fun_n_52.js`
8. `src/app/pages/user/fun_forms/fun_g.js` (3 instancias)
9. `src/app/pages/user/fun_forms/fun_g_checklist.js`
10. `src/app/pages/user/expeditions/exp_areas.component.js`
11. `src/app/pages/user/archive/archive.page.js`
12. `src/app/pages/user/nomenclature/nomenclature.js`
13. `src/app/pages/user/pqrs/pqrsadmin.functional.js` (3 instancias)

### Paso 4: Modernizar tablas HTML

Buscar tablas `<MDBTable>` o `<table>` que tengan:
- `bordered` → eliminar (usar `borderless` o sin prop para bordes sutiles)
- `table-bordered` → eliminar
- Filas con `style={{backgroundColor: '...'}}` con colores fuertes → reemplazar por clases semánticas BS5 (`table-warning`, `table-danger`, `table-success`, `table-info`) SOLO donde el color tenga significado semántico

Asegurar que `<MDBTable>` genera `table table-hover align-middle` por defecto (ya ajustado en Fase 3).

### Paso 5: Limpiar fieldsets legacy en `App.css`

Verificar que las reglas de `fieldset` y `legend` ya están modernizadas (Fase 3). Si no, aplicar:
```css
fieldset { border: 1px solid var(--bs-border-color) !important; border-radius: 0.5rem; padding: 1rem; }
legend { border: none; padding: 0.25rem 0.5rem; font-size: 0.875rem; font-weight: 600; width: auto; }
```

### Paso 6: Validación
1. `npm test` — 149 tests pasan.
2. Playwright MCP: navegar a `/archive` (DataTable con datos), `/appointments` (3 DataTables), `/pqrsadmin` (tabs + DataTable), toggle dark mode en cada uno.

## Errores comunes a evitar

- No tocar las columnas ni selectores — son lógica de negocio que mapea campos de la base de datos.
- No aplicar `customStyles` que sobreescriban `conditionalRowStyles` que ya existan — verificar cada archivo antes.
- No eliminar `expandableRows`, `expandableRowsComponent` ni cualquier prop funcional.
- Los DataTables en `fun_g.js` tienen filtros complejos — NO tocar los filtros, solo el tema visual.
- `fun_macrotable..js` tiene doble punto en el nombre — NO renombrar el archivo.
