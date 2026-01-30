# Casos de Prueba - Sistema de Programación de Tiempos

## Casos de Prueba Principales

### CP-001: Programación con Días Disponibles (Con Fecha de Referencia)

**Objetivo**: Verificar que se puede programar un tiempo usando días disponibles cuando existe fecha de referencia.

**Precondiciones**:
- Expediente con fecha de Legal y Debida Forma (LDF) registrada
- Tiempo "Declaración en legal y debida forma" (state 5) NO ejecutado

**Pasos**:
1. Abrir modal de programación
2. Localizar tiempo "Declaración en legal y debida forma"
3. Ingresar "5" en campo "Días Disponibles"
4. Verificar que aparece fecha calculada debajo del input
5. Guardar programación
6. Verificar en tabla maestra columna "Límite Programado"

**Resultado Esperado**:
- Modal muestra conversión automática a fecha
- Tabla maestra muestra: "DD/MM/YYYY (5 días)"
- localStorage contiene: `{ type: 'days', value: 5, originalType: 'days' }`

---

### CP-002: Programación con Fecha Especificada (Con Fecha de Referencia)

**Objetivo**: Verificar que se puede programar un tiempo usando fecha específica cuando existe fecha de referencia.

**Precondiciones**:
- Expediente con fecha de Legal y Debida Forma (LDF) registrada
- Tiempo "Citación (Observaciones)" (state 31) NO ejecutado

**Pasos**:
1. Abrir modal de programación
2. Localizar tiempo "Citación (Observaciones)"
3. Ingresar fecha en campo "Fecha Especificada": 15/01/2026
4. Verificar que aparece conversión a días hábiles
5. Guardar programación
6. Verificar en tabla maestra

**Resultado Esperado**:
- Modal muestra: "= X días hábiles"
- Tabla maestra muestra: "15/01/2026 (X días)"
- localStorage contiene: `{ type: 'date', value: '2026-01-15', originalType: 'date' }`

---

### CP-003: Programación SIN Fecha de Referencia - Usando Días

**Objetivo**: Verificar comportamiento cuando no existe fecha de referencia y se programa con días.

**Precondiciones**:
- Expediente SIN fecha de Legal y Debida Forma (LDF)
- Tiempo "Declaración en legal y debida forma" (state 5) NO ejecutado

**Pasos**:
1. Abrir modal de programación
2. Localizar tiempo "Declaración en legal y debida forma"
3. Ingresar "5" en campo "Días Disponibles"
4. Verificar mensaje de advertencia
5. Guardar programación
6. Verificar en tabla maestra

**Resultado Esperado**:
- Modal muestra: "⚠ Sin fecha ref."
- Tabla maestra muestra: "5 días (pendiente fecha ref.)"
- Cuando se registre LDF, se debe calcular automáticamente la fecha límite

---

### CP-004: Programación SIN Fecha de Referencia - Usando Fecha

**Objetivo**: Verificar comportamiento cuando no existe fecha de referencia y se programa con fecha.

**Precondiciones**:
- Expediente SIN fecha de Legal y Debida Forma (LDF)
- Tiempo "Declaración en legal y debida forma" (state 5) NO ejecutado

**Pasos**:
1. Abrir modal de programación
2. Localizar tiempo "Declaración en legal y debida forma"
3. Ingresar fecha: 15/01/2026
4. Verificar mensaje de advertencia
5. Guardar programación
6. Verificar en tabla maestra

**Resultado Esperado**:
- Modal muestra: "⚠ Sin fecha ref."
- Tabla maestra muestra: "Pendiente fecha ref."
- Cuando se registre LDF, se debe calcular días hábiles entre fechas

---

### CP-005: Exclusividad de Campos (Días vs Fecha)

**Objetivo**: Verificar que los campos "Días Disponibles" y "Fecha Especificada" son mutuamente excluyentes.

**Precondiciones**:
- Modal de programación abierto

**Pasos**:
1. Ingresar valor en "Días Disponibles": 5
2. Verificar que campo "Fecha Especificada" está deshabilitado
3. Borrar valor de "Días Disponibles"
4. Verificar que campo "Fecha Especificada" se habilita
5. Ingresar fecha en "Fecha Especificada"
6. Verificar que campo "Días Disponibles" está deshabilitado

**Resultado Esperado**:
- Solo un campo puede tener valor a la vez
- Campo vacío se habilita, campo con valor deshabilita el otro

---

### CP-006: Tiempo Ya Ejecutado No Programable

**Objetivo**: Verificar que tiempos con fecha de evento registrada NO aparecen en modal.

**Precondiciones**:
- Expediente con tiempo "Radicación" (state false) ejecutado (tiene date_start)

**Pasos**:
1. Abrir modal de programación
2. Buscar tiempo "Radicación" en la tabla

**Resultado Esperado**:
- Tiempo "Radicación" NO aparece en la tabla del modal
- Solo aparecen tiempos con `allowSchedule: true` y sin fecha de evento

---

### CP-007: Eliminar Programación Individual

**Objetivo**: Verificar que se puede eliminar la programación de un tiempo específico.

**Precondiciones**:
- Tiempo "Citación (Observaciones)" programado con 5 días

**Pasos**:
1. Abrir modal de programación
2. Localizar tiempo "Citación (Observaciones)"
3. Click en botón de eliminar (icono basura)
4. Verificar que campos se limpian
5. Guardar programación
6. Verificar tabla maestra

**Resultado Esperado**:
- Campos se limpian en el modal
- Fila deja de estar marcada como activa
- Tabla maestra muestra "-" en columna "Límite Programado"
- localStorage NO contiene entrada para ese clockState

---

### CP-008: Guardar Múltiples Tiempos Simultáneamente (Batch)

**Objetivo**: Verificar que se pueden programar múltiples tiempos y guardarlos en una sola operación.

**Precondiciones**:
- Modal de programación abierto

**Pasos**:
1. Programar tiempo "Declaración en legal y debida forma": 5 días
2. Programar tiempo "Radicación en superintendencia": 3 días
3. Programar tiempo "Instalación de la valla": fecha 20/01/2026
4. Verificar contador: "3 tiempos programados"
5. Click en "Guardar Programación"
6. Esperar confirmación

**Resultado Esperado**:
- Loading spinner durante guardado
- Alert success: "3 tiempos programados"
- Timer de 2 segundos
- Tabla maestra actualizada con los 3 límites programados
- localStorage contiene los 3 tiempos
- Backend recibe FormData con scheduleConfig en JSON

---

### CP-009: Validación - Sin Programación al Guardar

**Objetivo**: Verificar que no se puede guardar sin programar al menos un tiempo.

**Precondiciones**:
- Modal de programación abierto sin ningún tiempo programado

**Pasos**:
1. Click en "Guardar Programación" sin ingresar datos
2. Verificar mensaje de validación

**Resultado Esperado**:
- SweetAlert muestra mensaje: "Debes programar al menos un tiempo antes de guardar"
- Modal permanece abierto
- No se realiza guardado

---

### CP-010: Eliminar Toda la Programación

**Objetivo**: Verificar que se puede eliminar toda la programación del expediente.

**Precondiciones**:
- Expediente con programación guardada (hasSchedule = true)

**Pasos**:
1. Abrir modal de programación
2. Click en botón "Eliminar Programación"
3. Confirmar en diálogo de advertencia
4. Esperar confirmación

**Resultado Esperado**:
- SweetAlert de confirmación con warning
- Loading durante eliminación
- Success con timer de 2 segundos
- Tabla maestra muestra "-" en todas las columnas "Límite Programado"
- localStorage limpio para ese expediente
- Backend recibe FormData con scheduleConfig: null

---

### CP-011: Acta Parte 1 con Prórrogas y Suspensiones

**Objetivo**: Verificar cálculo correcto de límite programado para Acta Parte 1 considerando extensiones.

**Precondiciones**:
- Expediente tipo IV (45 días base)
- Prórroga activa de 10 días
- Suspensión pre-acta cerrada de 5 días
- LDF registrada

**Pasos**:
1. Abrir modal de programación
2. Localizar tiempo "Acta Parte 1: Observaciones"
3. Programar con 30 días disponibles
4. Guardar
5. Verificar tabla maestra

**Resultado Esperado**:
- Días totales disponibles en modal: 60 (45 + 10 + 5)
- Límite programado calcula desde LDF + 30 días
- Suma considera las extensiones para el límite legal
- Visualización correcta en tabla

---

### CP-012: Acta Parte 2 con Correcciones (NO CUMPLE)

**Objetivo**: Verificar cálculo de fecha de referencia para Acta Parte 2 cuando Acta 1 indica NO CUMPLE.

**Precondiciones**:
- Acta Parte 1 con descripción "NO CUMPLE"
- Fecha de radicación de correcciones registrada

**Pasos**:
1. Abrir modal de programación
2. Localizar tiempo "Acta Parte 2: Correcciones"
3. Verificar límite legal de referencia
4. Programar con 20 días
5. Guardar
6. Verificar tabla maestra

**Resultado Esperado**:
- Fecha de referencia: fecha de radicación de correcciones
- Límite programado calcula desde correcciones + 20 días
- Tabla maestra muestra correctamente

---

### CP-013: Viabilidad (CUMPLE sin correcciones)

**Objetivo**: Verificar cálculo cuando Acta 1 CUMPLE y NO hay correcciones.

**Precondiciones**:
- Acta Parte 1 con descripción incluyendo "CUMPLE"
- NO hay fecha de radicación de correcciones

**Pasos**:
1. Abrir modal de programación
2. Localizar tiempo "Acto de Trámite de Licencia (Viabilidad)"
3. Verificar límite legal de referencia
4. Programar con 25 días
5. Guardar
6. Verificar tabla maestra

**Resultado Esperado**:
- Fecha de referencia: fecha de Acta Parte 1
- Límite programado calcula desde Acta 1 + 25 días
- Tabla maestra muestra correctamente

---

### CP-014: Persistencia en localStorage

**Objetivo**: Verificar que la programación persiste correctamente en localStorage.

**Precondiciones**:
- Expediente ID: 12345

**Pasos**:
1. Programar 3 tiempos diferentes
2. Guardar programación
3. Recargar página (F5)
4. Abrir modal de programación
5. Verificar que los 3 tiempos siguen programados

**Resultado Esperado**:
- localStorage key: `curaduria_programacion_12345`
- Valor contiene:
  ```json
  {
    "expedienteId": "12345",
    "updatedAt": "2025-12-11T...",
    "times": {
      "5": { "type": "days", "value": 5, "originalType": "days" },
      "31": { "type": "date", "value": "2026-01-15", "originalType": "date" },
      "30": { "type": "days", "value": 30, "originalType": "days" }
    }
  }
  ```
- Modal muestra los valores guardados
- Tabla maestra muestra los límites

---

### CP-015: Formato FormData para Endpoint

**Objetivo**: Verificar que el payload se envía correctamente como FormData.

**Precondiciones**:
- DevTools abierto en pestaña Network
- Modal de programación con tiempos programados

**Pasos**:
1. Programar al menos un tiempo
2. Click en "Guardar Programación"
3. Monitorear request en Network tab

**Resultado Esperado**:
- Request URL: `PUT /fun/schedule/12345`
- Content-Type: `multipart/form-data`
- FormData contiene:
  - Key: `scheduleConfig`
  - Value: JSON string del payload
- NO causa error "Unexpected end of form"

---

### CP-016: Conversión Automática de Visualización

**Objetivo**: Verificar conversión automática entre días y fecha para mejor UX.

**Precondiciones**:
- LDF registrada el 01/12/2025
- Modal de programación abierto

**Pasos**:
1. Programar "Citación (Observaciones)" con 10 días
2. Observar conversión a fecha debajo del input
3. Borrar días e ingresar fecha 15/12/2025
4. Observar conversión a días debajo del input

**Resultado Esperado**:
- Al ingresar 10 días: muestra "= 15/12/2025" (ejemplo)
- Al ingresar 15/12/2025: muestra "= 10 días hábiles"
- El valor guardado es el que el usuario ingresó originalmente
- La conversión es solo visual

---

### CP-017: Estado "Completado" en Límite Programado

**Objetivo**: Verificar visualización cuando un tiempo programado ya fue ejecutado.

**Precondiciones**:
- Tiempo "Citación (Observaciones)" programado con 5 días
- LDF registrada
- Citación ejecutada (date_start registrado)

**Pasos**:
1. Ver columna "Límite Programado" para ese tiempo

**Resultado Esperado**:
- Muestra fecha límite programada
- Badge "Completado" en color gris/muted
- NO muestra "Quedan X días"
- Color de texto: success (verde)

---

### CP-018: Estado "Retraso" en Límite Programado

**Objetivo**: Verificar visualización cuando se excede límite programado.

**Precondiciones**:
- Tiempo "Citación (Observaciones)" programado para 10/12/2025
- Fecha actual del sistema: 15/12/2025
- Citación NO ejecutada

**Pasos**:
1. Ver columna "Límite Programado" para ese tiempo

**Resultado Esperado**:
- Muestra fecha límite: "10/12/2025"
- Badge "Retraso: 5d" en color rojo
- Texto en color danger (rojo)
- Indica urgencia visual

---

### CP-019: Límite Legal como Referencia en Modal

**Objetivo**: Verificar que el modal muestra correctamente el límite legal como referencia.

**Precondiciones**:
- Tiempo "Citación (Observaciones)" con limite: [[30, 5]]
- Acta Parte 1 ejecutada el 01/12/2025

**Pasos**:
1. Abrir modal de programación
2. Localizar tiempo "Citación (Observaciones)"
3. Observar columna "Límite Legal (Ref.)"

**Resultado Esperado**:
- Muestra: "06/12/2025" (5 días hábiles desde 01/12)
- Sirve como referencia visual para programar
- NO es editable
- Ayuda al usuario a tomar decisiones

---

### CP-020: Tooltip con Información Adicional

**Objetivo**: Verificar que los tooltips muestran información útil.

**Pasos**:
1. Hover sobre columna "Límite Programado" de un tiempo programado
2. Leer tooltip

**Resultado Esperado**:
- Tooltip muestra: "Límite programado: DD/MM/YYYY (X días)"
- Información clara y concisa
- Se muestra al hacer hover
- No interfiere con la interacción

---

## Casos de Borde

### CB-001: Día No Hábil como Límite

**Precondición**: Programar fecha que cae en fin de semana o festivo

**Resultado Esperado**: Sistema ajusta automáticamente al siguiente día hábil

---

### CB-002: Cambio de Tipo de Proyecto

**Precondición**: Expediente cambia de Tipo III a Tipo IV

**Resultado Esperado**: Programación se mantiene, pero cálculos se ajustan automáticamente

---

### CB-003: Eliminación de Fecha de Evento

**Precondición**: Se elimina fecha de un evento que es referencia de otro programado

**Resultado Esperado**: Límite programado vuelve a "pendiente fecha ref."

---

## Matriz de Compatibilidad

| Navegador | Versión | Estado |
|-----------|---------|--------|
| Chrome    | 90+     | ✅ Compatible |
| Firefox   | 88+     | ✅ Compatible |
| Safari    | 14+     | ✅ Compatible |
| Edge      | 90+     | ✅ Compatible |

## Notas de Testing

- Usar datos de prueba con expedientes reales
- Verificar rendimiento con 50+ tiempos programables
- Probar con diferentes zonas horarias
- Validar accesibilidad (ARIA labels, keyboard navigation)
- Testing responsive en móviles y tablets

---

**Última actualización**: 2025-12-11
**Versión**: 1.0.0
