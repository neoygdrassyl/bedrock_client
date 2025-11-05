# Mejora de la Barra Lateral - Módulo de Radicación FUN_FORMS

## Resumen de Cambios

Este documento describe las mejoras realizadas a la barra lateral de navegación en el módulo de radicación de licencias (FUN_FORMS).

## Características Implementadas

### 1. Barra Lateral Colapsable

La nueva barra lateral permite dos estados:

- **Expandida**: 240px de ancho - Muestra iconos y etiquetas completas
- **Colapsada**: 60px de ancho - Muestra solo iconos con tooltips

#### Transición
- Animación suave de 0.3s con cubic-bezier(0.4, 0, 0.2, 1)
- Botón toggle circular posicionado en la esquina superior derecha de la barra

### 2. Header Fijo con Información

El header de la barra lateral muestra:
- Título "NAVEGACIÓN"
- ID de Radicación del expediente actual
- Badge de estado con colores semánticos:
  - 🟢 Verde (success): ARCHIVADO (state >= 100)
  - 🔵 Azul (info): EXPEDICIÓN (state >= 50)
  - 🟡 Amarillo (warning): EVALUACIÓN (state >= 5)
  - 🔴 Rojo (danger): INCOMPLETO (state < 0)
  - ⚪ Gris (secondary): RADICACIÓN (default)

### 3. Organización por Grupos de Color

Los módulos están agrupados según su función:

#### Grupo 1: Acciones (Color: Info/Azul)
- 📁 DETALLES
- ⏰ TIEMPOS
- 📦 DOCUMENTOS (color secundario)

#### Grupo 2: Edición (Color: Secondary/Gris)
- ✏️ ACTUALIZAR
- ✅ CHECKEO (color warning)

#### Grupo 3: Evaluación (Color: Warning/Amarillo)
Elementos condicionales según tipo de licencia:

**Para licencias NO P.H. (Propiedad Horizontal):**
- 📢 PUBLICIDAD (si no es OA y rules[0] != 1, con badge "PQRS" si aplica)
- ⚖️ INF. JURÍDICO
- 🏢 INF. ARQ. (si no es OA)
- ⚙️ INF. ESTRUCT. (si no es OA y rules[1] != 1)
- 📋 ACTA (si no es OA)
- 📄 EXPEDICIÓN

**Para licencias P.H. (Propiedad Horizontal):**
- 📐 INFORME P.H.
- 📄 EXPEDICIÓN

### 4. Estados Visuales

#### Estado Normal
- Fondo transparente
- Texto oscuro (#24292e)
- Hover: fondo gris claro (#f6f8fa)
- Transición suave con translateX(2px)

#### Estado Activo
- Fondo azul claro (#e8f4f8)
- Texto azul (#0366d6)
- Borde izquierdo de 3px en azul
- Font weight: 600

#### Estado Colapsado
- Iconos centrados
- Tooltips al hacer hover (posición: right)
- Sin efecto translateX en hover

### 5. Accesibilidad

- **Focus states**: Outline azul de 2px en todos los elementos interactivos
- **ARIA labels**: Botón toggle con aria-label descriptivo
- **Keyboard navigation**: Todos los elementos son accesibles por teclado
- **Tooltips**: Información contextual en modo colapsado

## Archivos Modificados

### 1. fun_moduleNav.js
```javascript
// Cambios principales:
- Añadido estado local isCollapsed
- Implementada función toggleSidebar()
- Reorganización de items en grupos (navGroups)
- Renderizado condicional de labels y tooltips
- Integración con fun_moduleNav_enhanced.css
```

### 2. fun_moduleNav_enhanced.css (NUEVO)
```css
// Estilos principales:
- .fun-nav-sidebar (expandida/colapsada)
- .fun-nav-toggle (botón de colapso)
- .fun-nav-header (header fijo)
- .fun-nav-section (grupos de navegación)
- .fun-nav-item (elementos de navegación)
- Estados: hover, active, disabled
- Variantes de color: info, secondary, warning
- Scrollbar personalizado
- Responsive adjustments
```

### 3. fun.js
```javascript
// Ajustes en modales:
- customStylesForModal: left ajustado de '15%' a '260px'
- z-index de overlay reducido de 2 a 1040
- customStylesForModalMacro: z-index actualizado a 1040
```

### 4. App.css
```css
// Desactivación de estilos legacy:
- .btn-nav_module: display: none
```

## Gestión de Z-Index

Para evitar conflictos de superposición:

- **Sidebar**: z-index: 1050 (nivel más alto)
- **Modal Overlay**: z-index: 1040 (debajo del sidebar)
- **Modal Content**: Posicionado con left: 260px para no superponerse

## Compatibilidad

- ✅ React 16.9.0
- ✅ Node.js v20.19.5 (requiere --openssl-legacy-provider)
- ✅ MDB React UI Kit
- ✅ Font Awesome Icons
- ✅ Responsive (ajustes para móvil < 768px)

## Notas de Desarrollo

### Build Command
```bash
NODE_OPTIONS=--openssl-legacy-provider npm run build
```

### Start Command
```bash
NODE_OPTIONS=--openssl-legacy-provider npm start
```

### Advertencias de Build
El build genera warnings de ESLint no relacionados con los cambios realizados (uso de == en lugar de ===, variables no usadas, etc.). Estos son pre-existentes en el código base.

## Mejoras Futuras Sugeridas

1. **Persistencia de Estado**: Guardar el estado colapsado/expandido en localStorage
2. **Animación de Iconos**: Rotación del icono del toggle al cambiar de estado
3. **Temas**: Soporte para modo oscuro
4. **Drag Handles**: Permitir redimensionamiento manual de la barra
5. **Atajos de Teclado**: Implementar shortcuts para toggle (ej: Ctrl+B)

## Testing

### Casos de Prueba Recomendados

1. ✅ Verificar apertura/cierre del sidebar con el botón toggle
2. ✅ Validar que los tooltips aparezcan en modo colapsado
3. ✅ Comprobar que el header muestre correctamente el ID de radicación
4. ✅ Verificar colores de badge según el estado
5. ✅ Validar navegación condicional según tipo de licencia (PH vs no-PH)
6. ✅ Comprobar que el modal se ajuste correctamente al sidebar expandido
7. ✅ Verificar responsive en dispositivos móviles
8. ✅ Validar accesibilidad (navegación por teclado, focus states)

## Capturas de Pantalla

(Pendiente: Agregar capturas de la interfaz en funcionamiento)

### Estado Expandido
- Mostrar sidebar completo con labels
- Header con información visible
- Grupos de navegación organizados

### Estado Colapsado  
- Sidebar de 60px
- Solo iconos visibles
- Tooltips en hover

### Estados Activos
- Botón activo con estilo resaltado
- Borde lateral azul
- Fondo distintivo

---

**Autor**: GitHub Copilot Developer Agent
**Fecha**: Noviembre 2025
**Versión**: 1.0.0
