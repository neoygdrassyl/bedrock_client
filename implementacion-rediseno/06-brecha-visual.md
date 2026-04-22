# 06 — Analisis de la brecha visual

## El problema

La captura en `docs/captura_pantalla_implementacion_rediseno.png` muestra que el resultado visual actual NO alcanza el nivel esperado en la spec de diseno. La app se ve funcional pero generica — no se acerca al pulido de Linear, Notion o Figma.

## Diagnostico

### Lo que se ve vs lo que deberia verse

| Area | Estado actual | Estado esperado |
|---|---|---|
| **IconRail** | Funcional, iconos con tooltip, active state basico | Hover glow sutil, transicion de active state mas refinada, separador visual entre grupos (main nav vs utilities), indicador de notificaciones |
| **ContextPanel** | Lista plana de links con active state | Secciones agrupadas con headers, iconos en sub-items, counters/badges, animacion de expand elegante |
| **HeaderBar** | Breadcrumb basico + toggle + dropdown | Breadcrumb con iconos por modulo, search input prominente (o acceso a command palette), notificaciones bell icon |
| **Footer** | Texto plano con version e info | Mas integrado visualmente, posiblemente con indicadores de estado (conectado/desconectado, ultimo sync) |
| **Dashboard cards** | Grid basico de cards con icono y label | Cards con mini-graficas (sparklines), numeros prominentes, tendencia, hover con elevacion sutil |
| **Login** | Split-screen funcional | Mas impacto visual — gradiente/imagen en el panel institucional, animacion de entrada, input focus states refinados |
| **Paginas legacy** | Bootstrap puro, sin migrar | Al menos un wrapper con tokens nuevos para reducir el choque visual |

### Causas raiz de la brecha

1. **Se priorizaron tests y estructura sobre pulido visual.** La infraestructura es solida (tokens, theme, componentes, tests) pero falta la capa de refinamiento.

2. **Los componentes shadcn se usaron con defaults.** Botones, cards, inputs usan los estilos base de shadcn sin personalizacion. Se ven "correctos" pero no "diseñados".

3. **Faltan micro-interacciones.** No hay:
   - Transiciones de hover suaves
   - Animaciones de entrada/salida
   - Feedback visual al click
   - Skeleton loaders durante carga
   - Empty states diseñados

4. **El espacio no esta optimizado.** Los paddings y gaps son correctos pero no estan afinados para crear la sensacion de "respira" que tienen Linear/Notion.

5. **Falta jerarquia visual.** Los textos tienen el mismo peso visual. No hay una distincion clara entre:
   - Titulos de seccion (bold, grande)
   - Labels de navegacion (medium, regular)
   - Metadata (small, muted)
   - Timestamps (xs, muted-foreground)

6. **Las paginas legacy no tienen ni un wrapper de transicion.** El contenido principal sigue con estilos Bootstrap puros, creando un contraste chocante con el shell nuevo.

## Plan de cierre de la brecha

### Prioridad 1 — Refinamiento del shell (impacto visual inmediato)

**IconRail:**
- Agregar hover glow sutil (`hover:shadow-[0_0_8px_rgba(37,99,235,0.3)]`)
- Separador visual entre grupos de navegacion (linea sutil `border-sidebar-foreground/10`)
- Animacion de active state: transicion de background + scale sutil
- Badge de notificacion (punto rojo) en modulos con items pendientes

**ContextPanel:**
- Headers de seccion con texto uppercase, tracking-wider, text-xs
- Iconos en sub-items (14px, muted-foreground)
- Counter badge al lado de items con conteo (ej: "Gestion (12)")
- Active indicator: barra lateral izquierda 2px primary, no solo background change
- Animacion de entrada: stagger de items al expandir

**HeaderBar:**
- Search input (o trigger de command palette) entre breadcrumb y actions
- Breadcrumb con icono del modulo actual
- Bell icon para notificaciones (placeholder, funcionalidad en Fase futura)
- Sombra sutil inferior para separar del contenido (`shadow-sm`)

**Footer:**
- Indicador de conectividad (punto verde "Conectado" o amarillo "Reconectando")
- Reducir text-size a text-[10px] para que sea mas discreto

### Prioridad 2 — Refinamiento de Dashboard

- Cards con numeros grandes (text-3xl font-bold) + label debajo (text-sm muted-foreground)
- Mini sparkline chart en cada card (tendencia ultimos 7 dias)
- Hover: elevacion con `hover:shadow-md transition-shadow`
- Colores de borde izquierdo por tipo de modulo
- Seccion "Actividad reciente" como timeline debajo de las cards
- Empty state diseñado: ilustracion + mensaje + CTA

### Prioridad 3 — Refinamiento de Login

- Panel institucional: gradiente sutil de primary a primary-dark, o imagen de fondo con overlay
- Logo mas grande y prominente
- Tipografia del nombre de la curaduria: text-2xl font-bold tracking-tight
- Animacion de entrada del formulario (fade-in + translate-y sutil)
- Input focus: ring animado, label que flota arriba

### Prioridad 4 — Wrapper de transicion para paginas legacy

- Crear un componente `<LegacyPageWrapper>` que aplica:
  - `bg-background text-foreground` al contenedor
  - Overrides de Bootstrap para que `.btn-primary` use `--primary`
  - Overrides para que `.table` use bordes y colores de los tokens
  - Overrides para que `.card` (Bootstrap) se acerque visualmente a Card (shadcn)
- Esto NO migra las paginas pero reduce el choque visual inmediato

## Metricas de exito

La brecha se considera cerrada cuando:

1. Un observador externo no puede distinguir donde empieza el "diseño nuevo" y donde esta el "legacy" — la transicion es suave.
2. El shell (rail + panel + header + footer) se ve al nivel de las apps de referencia en AMBOS temas.
3. El dashboard muestra datos reales con visualizacion atractiva, no solo cards con texto.
4. El login tiene impacto visual institucional, no se ve como "formulario con sidebar".
5. Las paginas legacy, aunque no migradas, no chocan violentamente con el shell.
