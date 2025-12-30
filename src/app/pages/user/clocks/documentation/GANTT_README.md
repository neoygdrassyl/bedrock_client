# Diagrama de Gantt - README

## Inicio Rápido

Este README proporciona instrucciones para integrar el Diagrama de Gantt implementado en el sistema de gestión de tiempos de curaduría.

## ✅ Requisitos Previos

El sistema ya cuenta con todas las dependencias necesarias:
- React 16.9+
- moment.js
- SweetAlert2
- ReactDOM

**No se requieren instalaciones adicionales.**

## 📁 Estructura de Archivos

### Archivos Nuevos Creados

```
src/app/pages/user/clocks/
├── components/
│   ├── GanttCard.js              ← Vista compacta para sidebar
│   └── GanttChart.js             ← Vista completa en modal
├── utils/
│   └── ganttUtils.js             ← Funciones de cálculo
├── documentation/
│   ├── GANTT_IMPLEMENTATION.md   ← Documentación técnica
│   ├── GANTT_USER_GUIDE.md       ← Guía de usuario
│   └── GANTT_SUMMARY.md          ← Resumen de requisitos
└── diagramGantt.css              ← Estilos del Gantt
```

### Archivos Modificados

```
src/app/pages/user/clocks/
├── components/
│   └── SidebarInfo.js            ← Integración del Gantt
├── centralClocks.component.js    ← Import de CSS
└── centralClocks.css             ← Estilos de modal
```

## 🚀 Cómo Usar

### Para Usuarios Finales

1. Abrir un expediente en la gestión de tiempos
2. En el sidebar derecho, buscar la tarjeta "Diagrama de Gantt"
3. Usar los botones para:
   - Cambiar entre modos (Límites Legales / Fechas de Evento)
   - Abrir vista completa

Ver [`GANTT_USER_GUIDE.md`](./GANTT_USER_GUIDE.md) para instrucciones detalladas.

### Para Desarrolladores

#### Importación

Los componentes ya están integrados en `SidebarInfo.js`:

```javascript
import { GanttCard } from './GanttCard';
import { GanttChart } from './GanttChart';
```

#### Uso del GanttCard

```javascript
<GanttCard 
  manager={manager}           // Hook useClocksManager
  onOpenFullView={openFullGanttView} 
/>
```

#### Uso del GanttChart

```javascript
// En un modal de SweetAlert2
<GanttChart manager={manager} />
```

Ver [`GANTT_IMPLEMENTATION.md`](./GANTT_IMPLEMENTATION.md) para detalles técnicos.

## 🎨 Estilos

### Importar CSS

Ya importado en `centralClocks.component.js`:

```javascript
import './diagramGantt.css';
```

### Personalización

Los estilos están organizados en bloques en `diagramGantt.css`:

- Vista compacta (líneas 1-350)
- Vista completa (líneas 351-700)
- Responsive (líneas 701-800)
- Animaciones (líneas 801-850)

## 📊 Características Implementadas

### ✅ Visualización de Actores

- Curaduría (🏢 azul)
- Solicitante (👤 azul claro)
- Procesos paralelos en tracks separados

### ✅ Modos de Visualización

**Límites Legales:**
- Muestra todo el plazo disponible
- Incluye base + suspensiones + prórrogas

**Fechas de Evento:**
- Muestra solo tiempo usado
- Barras acortadas hasta fechas reales

### ✅ Suspensiones y Prórrogas

- **Suspensiones** (🟨 amarillo rayado):
  - Pre-acta: en Fase 1
  - Post-acta: en Fase 4
  
- **Prórrogas** (🟦 azul rayado):
  - En fases de Curaduría
  - Después de suspensiones

### ✅ Distribución de Días

**Con fecha de Acta Parte 1:**
```
Días usados en Parte 1 → calculados
Días restantes → van a Parte 2
```

**Sin fecha de Acta Parte 1:**
```
Parte 1: 44 días (+proporción de extras)
Parte 2: 1 día (+proporción de extras)
```

### ✅ Estados de Fase

| Color | Estado | Descripción |
|-------|--------|-------------|
| 🟢 Verde | Completado | Fase finalizada |
| 🔵 Azul | Activo | En progreso (con animación) |
| 🟡 Amarillo | Pausado | Suspendida temporalmente |
| ⚫ Gris | Pendiente | Aún no iniciada |
| 🔴 Rojo | Vencido | Plazo excedido |

## 🔧 Funciones Principales

### ganttUtils.js

```javascript
// Calcular datos para el Gantt
calculateGanttData(manager, visualizationMode)

// Distribución de días Parte 1/2
calculateDaysDistribution(manager)

// Generar timeline
generateTimelineData(ganttData)

// Calcular progreso
calculateProgress(usedDays, totalDays)
```

## 📝 Ejemplos de Uso

### Ejemplo 1: Proceso Normal

```javascript
// El manager ya tiene los datos
const ganttData = calculateGanttData(manager, 'legal');

// Resultado:
{
  phases: [...],
  totalDuration: 50,  // 45 base + 5 suspensión
  baseDays: 45,
  suspensionDays: 5,
  extensionDays: 0
}
```

### Ejemplo 2: Sin Acta Parte 1

```javascript
const distribution = calculateDaysDistribution(manager);

// Resultado:
{
  part1Days: 44,
  part2Days: 1,
  totalDays: 45,
  hasActa1Date: false
}
```

## 🐛 Resolución de Problemas

### El Gantt no aparece

**Verificar:**
1. ✅ Manager tiene `processPhases` con datos
2. ✅ CSS importado correctamente
3. ✅ ReactDOM disponible

### Cálculos incorrectos

**Verificar:**
1. ✅ Fechas en formato ISO (YYYY-MM-DD)
2. ✅ Suspensiones/prórrogas con datos completos
3. ✅ Función `FUN0TYPETIME` disponible en manager

### Modal no abre

**Verificar:**
1. ✅ SweetAlert2 importado
2. ✅ Función `openFullGanttView` definida
3. ✅ ReactDOM.render correcto

## 📚 Documentación

- **[GANTT_IMPLEMENTATION.md](./GANTT_IMPLEMENTATION.md)**: Documentación técnica completa
- **[GANTT_USER_GUIDE.md](./GANTT_USER_GUIDE.md)**: Guía para usuarios finales
- **[GANTT_SUMMARY.md](./GANTT_SUMMARY.md)**: Resumen de requisitos cumplidos

## 🧪 Testing

### Casos de Prueba Recomendados

1. **Proceso completo**: Todas las fechas presentes
2. **Proceso parcial**: Solo algunas fechas
3. **Sin Acta Parte 1**: Verificar distribución 44/1
4. **Con suspensiones**: Pre-acta y post-acta
5. **Con prórroga**: Verificar visualización
6. **Actores paralelos**: Verificar tracks
7. **Cambio de modo**: Legal ↔ Actual
8. **Responsive**: Desktop, tablet, mobile

### Validaciones

- [ ] Barras no se superponen
- [ ] Colores consistentes
- [ ] Tooltips informativos
- [ ] Cálculos precisos
- [ ] Modal cierra correctamente
- [ ] Responsive funciona

## 🎯 Próximos Pasos

### Inmediatos

1. ✅ Código implementado
2. ✅ Documentación completa
3. ⏳ Testing con datos reales
4. ⏳ Ajustes según feedback

### Mejoras Futuras (Opcional)

1. Exportar como imagen/PDF
2. Zoom interactivo
3. Filtros de fase
4. Comparación de procesos
5. Predicción de fechas
6. Modo oscuro

## 💡 Consejos

### Para Usuarios

- Usa modo Legal para planificar
- Usa modo Actual para reportar
- Revisa distribución de días regularmente
- Observa los colores para estado rápido

### Para Desarrolladores

- Los cálculos usan `calcularDiasHabiles` existente
- No duplicar lógica de `processPhases`
- Mantener sincronización con manager
- Documentar cambios importantes

## 🔄 Actualizaciones

### Versión 1.0.0 (30/12/2025)

- ✅ Implementación inicial completa
- ✅ Todos los requisitos cumplidos
- ✅ Documentación exhaustiva
- ✅ Listo para testing

## 👥 Soporte

Para dudas o problemas:

1. Revisar documentación incluida
2. Verificar casos de prueba
3. Consultar código comentado
4. Contactar al equipo de desarrollo

## 📄 Licencia

Este código es parte del sistema de gestión de curaduría.

---

**Versión**: 1.0.0  
**Estado**: ✅ Listo para Testing  
**Última actualización**: 30 de diciembre de 2025
