# TAREA PRIORIDAD 1 URGENTE - Frontend Dovela (Agente Ejecutor)

## Contexto de la Tarea
Este proyecto migró a React 19 y se eliminó `@babel/defaultProps`. Como el backend envía asociativos `null` / `undefined`, el uso de `.map()` está creando "Pantallas Blancas". 
Actualmente en el sistema hemos implementado temporalmente barreras en React (Error Boundaries) y algunos retornos rápidos `if (!Array.isArray(x)) return null;`

ESTO ES UN PROBLEMA LEGAL, ya que "tapa con un dedo" la ausencia de datos en lugar de mostrar en pantalla que "Faltan vecinos" o "No hay información". Tu misión es arreglar estructuralmente las asignaciones de variables por "Default Destructuring Native".

## Objetivo de Ejecución (Solo tu vas a cambiar esto, yo confío en ti): 
Arranca reparando el módulo `fun_forms`, `records`, y `clocks` como te indico a continuación.
Asegúrate de NO USAR retornos nulos.

## Instrucciones y Patrón de refactor:
En cada componente que procese `.map`, elimina las validaciones `!Array.isArray(x)` y en su lugar usar:

```jsx
// ANTES (INCRORECTO - ESCONDE UI)
var objectsPQRS = pqrsxfun;
if (!Array.isArray(objectsPQRS)) return null; 
var map = objectsPQRS.map(...)

// DESPUES (CORRECTO - PROVEE FALLBACK UI LEGIBLE)
var objectsPQRS = Array.isArray(pqrsxfun) ? pqrsxfun : [];
if(objectsPQRS.length === 0) return <label className="fw-bold">No hay elementos asociados.</label>
var map = objectsPQRS.map(...)
```

Usa el subagente de 'Planner' y tú mismo como Main Agent (Tools de Filesystem) para atacar las carpetas de `src/app/pages/user/fun_forms`, `src/app/pages/user/records`, y `src/app/pages/user/clocks`. No importa si toma varios steps de bash o grep-sed. 
