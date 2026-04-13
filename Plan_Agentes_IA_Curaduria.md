# Plan Arquitectónico y Prompts para Agentes de IA (Edición 2026)
**Proyecto:** Rediseño del Dashboard de Gestión de Curadurías (`funmanage_new_page`)

## 🤖 Instrucciones Globales para el Agente (Contexto)
Eres un ecosistema de agentes de IA de última generación (Claude 4.6 Opus, Claude 4.6 Sonnet y Codex 4 xHigh). Tu objetivo es refactorizar la vista de gestión de proyectos de curaduría de manera integral y profesional.

**REGLA CRÍTICA:** Antes de escribir cualquier línea de código, **DEBES buscar y leer en el proyecto actual** todos los modelos de base de datos, controladores y tipos asociados a las solicitudes de curaduría y al componente `funmanage_new_page`. No inventes la estructura de datos. Usa las herramientas de lectura de archivos de tu entorno para mapear las relaciones REALES del sistema.

**Regla de Oro del Backend:** El frontend debe ser extremadamente rápido. Toda la lógica pesada (cálculo de días transcurridos, categorización de estados, agregaciones y KPIs) DEBE procesarse en el backend mediante SQL aggregations o consultas optimizadas.

---

## 🏗️ FASE 1: Backend for Frontend (BFF) y Base de Datos
**Modelo Recomendado:** Claude 4.6 Opus (Modo de pensamiento adaptativo / Esfuerzo: Max)
**Objetivo:** Crear 3 endpoints altamente eficientes que deleguen cálculos al servidor.

**Tareas:**
1. **Análisis de Contexto:** Busca en los directorios del backend (`controllers/`, `models/`, `routes/`) cómo se consultan actualmente las solicitudes de curaduría. Mapea las relaciones de tablas, campos de fechas y estados.
2. **Endpoint de KPIs (`GET /api/funmanage/dashboard/kpis`):**
   - Retorna: `{ "total": 132, "en_riesgo": 14, "listos": 19, "correcciones": 34 }`
   - Implementación: Usa `SQL GROUP BY` y `COUNT`. El cálculo de "en riesgo" debe restar (Hoy - Fecha Radicación) directamente en la base de datos.
3. **Endpoint de Gráfico (`GET /api/funmanage/dashboard/chart-data`):**
   - Retorna: Array de objetos `[{ x: 15, y: "II", status: "AVERAGE", radicado: "26-0022", fase: "Jurídico" }]`
   - Implementación: Prepara las coordenadas exactas que consumirá Recharts. No envíes datos crudos.
4. **Endpoint de Tabla (`GET /api/funmanage/dashboard/grid?page=1&limit=20&status=en_riesgo&phase=juridico&search=26`):**
   - Retorna: `{ "data": [...expedientes], "total": 132, "page": 1, "limit": 20 }`
   - Implementación: Server-side pagination. Aplica filtros en SQL, no en el cliente.

*Validación de Fase 1:* Prueba los 3 endpoints asegurando que los datos vengan precalculados y optimizados.

---

## 🎨 FASE 2: Preparación del Entorno Frontend
**Modelo Recomendado:** Claude 4.6 Sonnet (Esfuerzo: High)
**Objetivo:** Instalar el stack moderno de librerías React sin conflictos de versión.

**Verificación previa:** Abre `package.json` y revisa qué librerías ya están instaladas para evitar duplicados.

**Comandos de Instalación (Ejecuta en orden en la terminal del proyecto):**
```bash
# 1. Instalación de las 3 librerías core:
npm install @tanstack/react-table recharts lucide-react

# 2. Inicialización de Shadcn/UI (si no está hecho):
npx shadcn-ui@latest init

# 3. Instalación de componentes específicos de Shadcn/UI:
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add button
npx shadcn-ui@latest add select
npx shadcn-ui@latest add input
npx shadcn-ui@latest add table
```
*Validación de Fase 2:* `npm run dev` debe ejecutarse sin errores y los componentes de Shadcn deben estar en `src/components/ui/`.

---

## 📊 FASE 3: Layout Principal y Tarjetas de KPIs
**Modelo Recomendado:** Claude 4.6 Sonnet (Esfuerzo: High)
**Objetivo:** Rediseñar `funmanage_new_page` con un layout moderno usando Grid de Tailwind.

**Tareas:**
1. **Estructura del componente:** Crea un Grid de 4 columnas en desktop y 1 columna en mobile (`className="grid grid-cols-1 md:grid-cols-4 gap-4"`).
2. **Tarjetas de KPIs:** Implementa 4 Cards de Shadcn que muestren: Total Solicitudes, Solicitudes en Riesgo (> 10 días), Esperando Correcciones y Listos para Viabilidad.
3. **Interactividad:** Al hacer clic en una tarjeta de KPI, actualiza el estado global (`useState`) y dispara un re-fetch en la tabla y el gráfico de abajo.
4. **Filtros globales:** Añade dropdowns (Select de Shadcn) para filtrar por Fase y Estado.

---

## 📈 FASE 4: Gráfico de Dispersión Interactivo
**Modelo Recomendado:** Claude 4.6 Sonnet (Esfuerzo: High)
**Objetivo:** Implementar Recharts con tooltips personalizados e interactividad.

**Tareas:**
1. **Crear componente:** `FunmanageScatterChart.jsx`
2. **Mapeo de ejes:** 
   - Eje X: Días Transcurridos (0 a 180 días)
   - Eje Y: Categorías (I, II, III, IV)
   - Color/Fill: Status (Óptimo = Verde, Promedio = Amarillo, Límite = Rojo)
3. **CRÍTICO - Tooltip Personalizado:** Al hacer hover en un punto, renderiza una tarjeta flotante con: Número de Radicado, Fase Actual, Días Transcurridos, Estado y Nombre del Responsable.
4. **Responsividad:** El gráfico debe ocupar el 100% del ancho en móvil y ser escalable.

---

## 📋 FASE 5: Tabla de Gestión de Datos (Data Grid)
**Modelo Recomendado:** Claude 4.6 Sonnet (Esfuerzo: High) o Codex 4 xHigh para bugs complejos
**Objetivo:** Reemplazar el sistema antiguo de cajas por una tabla robusta con paginación server-side.

**Tareas:**
1. **Crear componente:** `FunmanageDataTable.jsx` usando `@tanstack/react-table`.
2. **Definir columnas:** Radicado, Fase Actual, Categoría (I/II/III/IV), Días Transcurridos, Estado (Badge: Verde/Amarillo/Rojo) y Acciones (Editar/Ver Detalles).
3. **Paginación Server-side:** Implementa botones Prev/Next que traigan datos del endpoint `/api/funmanage/dashboard/grid`.
4. **Búsqueda en tiempo real:** Input que busque por número de radicado mediante query param (`&search=`).
5. **Ordenamiento:** Permite ordenar por Días, Estado y Fecha.
6. **Estilos:** Usa Tailwind para zebra striping (filas alternadas con fondos ligeros diferentes).

---
*Fin del documento. Agente: Por favor, confirma que has leído este plan y procede a ejecutar la Fase 1 buscando primero los archivos relevantes en el sistema.*