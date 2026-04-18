# 03 — Aplicaciones de referencia

Aplicaciones cuya UI/UX inspira el rediseno de Dovela. Para cada una se documenta QUE tomar y QUE NO aplica al contexto de curaduria urbana.

---

## 1. Linear (linear.app)

**Tipo:** Gestion de proyectos / issue tracking.

**Que tomar:**
- **Sidebar minimalista** con iconos y texto condensado. Transiciones suaves al hover/active.
- **Densidad informativa** — muestra muchos datos en poco espacio sin sentirse abarrotado.
- **Paleta monocromatica con acentos** — fondo muy neutro, color solo en estados (activo, urgente, completado).
- **Tipografia con jerarquia clara** — titulos grandes bold, metadata en muted-foreground, timestamps en text-xs.
- **Animaciones micro** — sidebar expand/collapse, list item transitions, hover reveals.
- **Command palette (Cmd+K)** — acceso rapido a cualquier entidad sin navegar menus.
- **Temas dark/light impecables** — el dark mode de Linear es referencia global.

**Que NO aplica:**
- Su grid horizontal de issues no tiene equivalente directo en Dovela (los expedientes son mas complejos).
- Su enfoque "developers-first" no aplica — Dovela es para funcionarios publicos.

**Aplicacion en Dovela:**
- IconRail + ContextPanel ya sigue este patron. Refinar hover states y transiciones.
- Implementar Command Palette (Fase futura).
- Usar su esquema de colores como benchmark para contrast ratios.

---

## 2. Notion (notion.so)

**Tipo:** Documentos + bases de datos + wiki.

**Que tomar:**
- **Paginas como entidades de primera clase** — cada expediente deberia sentirse como "abrir una pagina", no "ir a un formulario".
- **Breadcrumb prominente** — siempre visible, clicable, con iconos.
- **Uso generoso del espacio blanco** — los datos respiran, los bloques tienen padding abundante.
- **Sidebar colapsable con secciones** — favoritos, recientes, workspace.
- **Tablas con inline editing** — hover para revelar acciones, click para editar en linea.
- **Cover images en paginas** — para expedientes o licencias, un header visual con datos clave.

**Que NO aplica:**
- El editor de bloques rico no es necesario (Dovela no es un editor de documentos).
- La flexibilidad extrema de layouts confundiria a usuarios institucionales.

**Aplicacion en Dovela:**
- Vista de detalle de expediente como "pagina Notion" — header con datos clave, secciones colapsables debajo.
- Tablas de listado con hover actions y quick-view.
- Breadcrumb ya implementado en HeaderBar. Agregar iconos por modulo.

---

## 3. Figma (figma.com)

**Tipo:** Herramienta de diseno colaborativo.

**Que tomar:**
- **Panel izquierdo con layers/pages** — analogo al ContextPanel con sub-items.
- **Panel derecho contextual** — propiedades del elemento seleccionado. En Dovela: detalle rapido del registro seleccionado en tabla.
- **Barra de herramientas superior minimal** — solo las acciones relevantes al contexto.
- **Uso del color como informacion** — cada tipo de elemento tiene un color sutil que lo identifica.
- **Footer como status bar** — zoom, coordenadas, estado. En Dovela: version, entidad, estado de conexion.

**Que NO aplica:**
- Canvas infinito y herramientas de dibujo.
- Multiplayer cursors.

**Aplicacion en Dovela:**
- El layout de 3 paneles (rail + context + content) ya sigue este patron.
- Agregar panel derecho contextual para "quick inspect" de registros.
- Footer como status bar ya implementado. Considerar agregar indicador de conectividad.

---

## 4. Vercel Dashboard (vercel.com/dashboard)

**Tipo:** Dashboard de deployments / plataforma.

**Que tomar:**
- **Cards con estado visual** — cada deployment muestra estado con color (verde=live, amarillo=building, rojo=error).
- **Tabla limpia con columnas bien alineadas** — sorting visual, filtros como pills.
- **Top nav simple** — proyecto actual como breadcrumb, sin menus profundos.
- **Empty states con ilustraciones** — no solo "No hay datos", sino una composicion visual con CTA.
- **Responsive impecable** — de desktop a tablet el layout se adapta sin romperse.

**Que NO aplica:**
- Sus integraciones Git no tienen equivalente.

**Aplicacion en Dovela:**
- Dashboard con cards de estado (licencias activas, expedientes pendientes, alarmas).
- Tablas de listado de licencias/PQRS siguiendo su patron de columnas + filtros como pills.
- Empty states diseñados (no solo "No hay resultados").

---

## 5. Stripe Dashboard (dashboard.stripe.com)

**Tipo:** Dashboard financiero / pagos.

**Que tomar:**
- **Datos numericos prominentes** — los KPIs grandes con tendencia (flechas arriba/abajo).
- **Graficas integradas en cards** — mini-charts dentro de las cards de overview.
- **Navegacion por entidad** — click en una transaccion abre un drawer/sheet lateral, no una pagina nueva.
- **Filtros potentes pero discretos** — date range picker, status pills, search.
- **Tabla maestra-detalle** — lista a la izquierda, detalle a la derecha.

**Que NO aplica:**
- Enfoque financiero puro.

**Aplicacion en Dovela:**
- KPIs en dashboard: licencias por fase, expedientes activos, alarmas de vencimiento.
- Click en fila de tabla abre Sheet lateral con detalle rapido (no navegar a otra pagina para ver info basica).
- Date range picker para filtrar por periodos legales.

---

## 6. GitHub (github.com)

**Tipo:** Plataforma de desarrollo.

**Que tomar:**
- **Tabs como navegacion de entidad** — un repo tiene tabs (Code, Issues, PRs). Un expediente tiene tabs (Documentos, Historial, Observaciones).
- **Timeline de actividad** — historial cronologico de eventos en un issue. En Dovela: timeline de un expediente.
- **Labels/badges como taxonomia visual** — cada issue tiene labels de color. Cada licencia tiene estado con badge.
- **Responsive table → card en mobile** — las tablas se transforman en cards en pantallas chicas.

**Que NO aplica:**
- Code review, diff viewer, CI/CD.

**Aplicacion en Dovela:**
- Vista de detalle de expediente con tabs horizontales (datos, documentos, historial, observaciones).
- Timeline de actividad del expediente.
- Badges de estado en tablas y vistas de detalle.

---

## Resumen de patrones convergentes

Estos patrones aparecen en TODAS las apps de referencia:

1. **Sidebar/rail compacto** para navegacion principal
2. **Breadcrumb siempre visible** para orientacion
3. **Cards con estado visual** en dashboards
4. **Tablas limpias con hover actions** para listados
5. **Detalle lateral (sheet/drawer)** para inspeccion rapida
6. **Dark mode impecable** como expectativa base
7. **Tipografia con jerarquia** — titulo > subtitulo > body > metadata > timestamp
8. **Espacio generoso** — los datos respiran, no estan apretados
9. **Animaciones micro** — hover, expand, collapse, fade — nunca flash/jump
10. **Empty states diseñados** — nunca una pantalla en blanco sin explicacion
