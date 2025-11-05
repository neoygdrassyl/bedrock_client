# Diseño Visual de la Barra Lateral Mejorada

## Estado EXPANDIDO (240px)

```
╔════════════════════════════════╗
║  [<]  NAVEGACIÓN               ║  <- Toggle + Título
╠════════════════════════════════╣
║  ID Radicación:                ║  <- Header Fijo
║  CR1-24-0001                   ║
║  Estado: [RADICACIÓN]          ║  <- Badge Estado
╠════════════════════════════════╣
║  ❌ CERRAR                     ║  <- Botón Cerrar
╠════════════════════════════════╣
║  📁 DETALLES         [INFO]    ║  <- Grupo Acciones
║  ⏰ TIEMPOS                     ║
║  📦 DOCUMENTOS      [GRAY]     ║
╠════════════════════════════════╣
║  ✏️ ACTUALIZAR      [GRAY]     ║  <- Grupo Edición
║  ✅ CHECKEO        [YELLOW]    ║
╠════════════════════════════════╣
║  📢 PUBLICIDAD     [YELLOW]    ║  <- Grupo Evaluación
║  ⚖️ INF. JURÍDICO              ║
║  🏢 INF. ARQ.                  ║
║  ⚙️ INF. ESTRUCT.              ║
║  📋 ACTA                       ║
║  📄 EXPEDICIÓN                 ║
╚════════════════════════════════╝
```

## Estado COLAPSADO (60px)

```
╔═══╗
║[>]║  <- Toggle
╠═══╣
║   ║  <- Icono oculto en header
║   ║
║   ║
╠═══╣
║ ❌ ║  <- Solo iconos
╠═══╣
║ 📁 ║  <- Con tooltips
║ ⏰ ║     en hover
║ 📦 ║
╠═══╣
║ ✏️ ║
║ ✅ ║
╠═══╣
║ 📢 ║
║ ⚖️ ║
║ 🏢 ║
║ ⚙️ ║
║ 📋 ║
║ 📄 ║
╚═══╝
```

## Colores y Estados

### Colores de Botones:
- 🔵 **INFO (Azul)**: Detalles, Tiempos
- ⚪ **SECONDARY (Gris)**: Documentos, Actualizar
- 🟡 **YELLOW (Amarillo)**: Checkeo, Evaluación
- 🔴 **DANGER (Rojo)**: Cerrar

### Estados Visuales:

#### NORMAL
```
[ 📁 DETALLES ]
  ↓ hover
[ 📁 DETALLES ]  <- fondo gris claro + desplazamiento 2px
```

#### ACTIVO
```
┃ 📁 DETALLES ┃  <- borde izquierdo azul + fondo azul claro
```

#### COLAPSADO CON TOOLTIP
```
[ 📁 ]  ------> [  DETALLES  ]
  icono         tooltip flotante
```

## Comportamiento del Modal

### ANTES (barra antigua):
```
┌──────────────────────────────────────┐
│  Modal Content (left: 15%)           │
│                                      │
└──────────────────────────────────────┘
```

### DESPUÉS (con nueva barra):
```
║Sidebar║                              
║ 240px ║  ┌──────────────────────┐    
║       ║  │  Modal Content       │    
║       ║  │  (left: 260px)       │    
║       ║  │                      │    
║       ║  └──────────────────────┘    
```

## Grupos de Color en Detalle

### 1️⃣ GRUPO ACCIONES (Azul/Info)
```
╔════════════════╗
║ 📁 DETALLES    ║  <- bg: #d1ecf1 (hover)
║ ⏰ TIEMPOS     ║     color: #0c5460
║ 📦 DOCUMENTOS  ║     (gris para documentos)
╚════════════════╝
```

### 2️⃣ GRUPO EDICIÓN (Gris/Secondary)
```
╔════════════════╗
║ ✏️ ACTUALIZAR  ║  <- bg: #e2e3e5 (hover)
║ ✅ CHECKEO     ║     color: #383d41
╚════════════════╝     (amarillo para checkeo)
```

### 3️⃣ GRUPO EVALUACIÓN (Amarillo/Warning)
```
╔════════════════╗
║ 📢 PUBLICIDAD  ║  <- bg: #fff3cd (hover)
║ ⚖️ INF. JUR.   ║     color: #856404
║ 🏢 INF. ARQ.   ║
║ ⚙️ INF. EST.   ║     
║ 📋 ACTA        ║     [Condicional según tipo]
║ 📄 EXPEDICIÓN  ║
╚════════════════╝
```

## Transiciones y Animaciones

### Colapsar/Expandir:
```
Estado: EXPANDIDO (240px)
   ⬇ click toggle (0.3s cubic-bezier)
Estado: COLAPSADO (60px)
   ⬇ click toggle (0.3s cubic-bezier)
Estado: EXPANDIDO (240px)
```

### Hover en Items:
```
Normal: translateX(0px)
   ⬇ hover (0.2s ease)
Hover: translateX(2px) + bg-color
```

### FadeIn de Labels:
```
Colapsado → Expandido
Labels: opacity 0 → 1 (0.3s ease)
```

## Responsivo

### Desktop (>768px):
- Sidebar expandido: 240px
- Sidebar colapsado: 60px

### Mobile (<768px):
- Sidebar expandido: 200px
- Sidebar colapsado: 50px

## Z-Index Hierarchy

```
Nivel 1050: Sidebar (más alto)
Nivel 1040: Modal Overlay
Nivel 1:    Otros elementos fixed
```

---

Este diseño asegura:
✅ Uso óptimo del espacio
✅ Navegación intuitiva
✅ Información contextual visible
✅ Estilo moderno y profesional
✅ Accesibilidad completa
