# 02 — Principios inquebrantables del rediseno

Estos principios no se negocian. Cualquier agente, desarrollador o sesion que trabaje en el rediseno debe cumplirlos sin excepcion.

---

## P1. Cero perdida de funcionalidad

Cada ruta, boton, formulario, flujo de datos y visualizacion que existe hoy debe seguir funcionando tras cada cambio. Dovela modela relaciones legales reales — una funcionalidad oculta o rota puede significar un tramite urbano perdido.

**Verificacion:** Los 449 tests unitarios y los 6 specs e2e deben pasar despues de CADA commit. Si un test falla, se arregla antes de continuar.

## P2. El diseno es el producto, no un adorno

El rediseno no es "ponerle estilos bonitos a lo que hay". Es redefinir como se experimenta la aplicacion. Cada pixel, cada espacio, cada transicion debe comunicar **confianza institucional**. Si el resultado se ve "template-ish" o generico, no esta listo.

**Verificacion:** Antes de dar por terminado un componente, comparar visualmente contra las apps de referencia (ver `03-apps-referencia.md`). Si no se acerca al nivel de pulido de Linear o Notion, iterar.

## P3. Una sola fuente de verdad visual

El destino es **Tailwind CSS + shadcn/ui**. No se introduce ninguna nueva dependencia de estilos. Cada fase debe REDUCIR la cantidad de capas CSS legacy, nunca aumentarla.

**Reglas concretas:**
- Nuevos componentes: solo Tailwind utility classes + componentes shadcn
- Colores: solo tokens CSS de `src/index.css` — nunca hex/rgb hardcodeados
- Espaciado: solo escala de Tailwind (p-1, p-2, p-4, p-6, p-8)
- Tipografia: solo Inter (texto) + JetBrains Mono (datos tecnicos)
- No agregar: styled-components, CSS modules, Sass, emotion, ni ningun otro sistema

## P4. Dark mode como ciudadano de primera clase

No es un afterthought. Cada componente nuevo se construye Y se revisa en ambos modos. El dark mode usa slate-900 como base (no negro puro #000) y colores desaturados para reducir fatiga visual.

**Verificacion:** Alternar el toggle de tema y revisar que:
- No hay textos ilegibles
- No hay bordes que desaparecen
- No hay fondos que se mezclan
- Los contrastes cumplen WCAG AA (4.5:1 minimo)

## P5. Transicion progresiva, no big-bang

Nunca se reescribe todo de golpe. El patron es:
1. Crear el componente nuevo con Tailwind/shadcn
2. Probarlo con tests
3. Reemplazar el viejo con el nuevo en la ruta correspondiente
4. Eliminar el codigo viejo una vez confirmado
5. Verificar que nada mas referenciaba el viejo

Cada paso es un commit independiente y verificable.

## P6. No se oculta la ausencia de datos

Dovela maneja datos legalmente relevantes. Si un campo esta vacio o un servicio no responde, el componente debe mostrar un estado explicito (skeleton, mensaje "Sin datos", badge de estado). Nunca `return null` para datos legales.

## P7. Los servicios son la unica puerta al backend

Ningun componente hace llamadas HTTP directas. Todo pasa por `src/app/services/`. Los services existentes (`data.service.js`, `custom.service.js`, `fun.service.js`) son la fuente de verdad para los contratos de datos.

## P8. Accesibilidad WCAG AA como minimo

- Contrastes de texto: ≥ 4.5:1 (body), ≥ 3:1 (large text)
- Focus visible en todo elemento interactivo
- Navegacion por teclado funcional
- Roles ARIA correctos en elementos custom
- Labels en todos los inputs y botones

## P9. No se toman decisiones de arquitectura solo por estetica

Si un cambio visual requiere reestructurar routing, state management o integracion con el backend, se documenta el impacto y se confirma antes de implementar. No se mueve un sidebar "porque se ve mejor" si eso rompe 40 componentes que dependen del layout actual.

## P10. Cada sesion termina con build + tests pasando

No importa si el cambio fue "solo CSS". Si toca el codebase, se verifica:
1. `npm test` — todos los tests pasando
2. `npm run build` — build de produccion exitoso
3. Revision visual en el navegador — ambos temas
