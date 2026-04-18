# 04 — Antipatrones: que evitar y como prevenirlo

Errores concretos que han ocurrido o que pueden ocurrir durante el rediseno. Cada antipatron incluye la causa raiz, el sintoma visible, y la prevencion.

---

## AP1. "Template-ish" — resultado generico sin identidad

**Causa raiz:** Usar componentes shadcn/ui con sus defaults sin personalizarlos. Aplicar tokens de color pero sin refinar espaciado, sombras, bordes, micro-interacciones.

**Sintoma:** La app se ve "como cualquier template de shadcn" — funcional pero sin caracter. No se distingue de un dashboard generico de GitHub.

**Prevencion:**
- Despues de instalar un componente shadcn, SIEMPRE personalizarlo: ajustar padding, border-radius, sombras, hover states.
- Agregar el logo real, colores institucionales, y datos de la curaduria en puntos clave (header, footer, login).
- Comparar cada pantalla contra las apps de referencia (ver `03-apps-referencia.md`). Si se ve generico, iterar.
- Los tokens de color son el piso, no el techo — el diseno emerge de como se combinan, no solo de que existan.

---

## AP2. Desalineacion de estilos — legacy vs nuevo

**Causa raiz:** El shell nuevo usa Tailwind/shadcn pero las paginas internas siguen con Bootstrap + CSS custom. El contraste visual es chocante.

**Sintoma:** El sidebar y header se ven modernos, pero al navegar a una pagina de licencias o PQRS el contenido se ve de 2018. Bordes gruesos, colores diferentes, tipografia distinta, spacing inconsistente.

**Prevencion:**
- Al migrar cada modulo, empezar por el **contenedor exterior** (wrapper de la pagina, headers de seccion, tablas principales) antes de tocar componentes internos.
- Crear clases de transicion en `index.css` que aplican los nuevos tokens a containers Bootstrap legacy: `bg-background`, `text-foreground`, `border-border`.
- NUNCA dejar una pagina "mitad nueva mitad vieja" en un commit — o la pagina completa se migra o se deja como esta.

---

## AP3. Desacoplamiento de capas CSS — 6 fuentes de verdad

**Causa raiz:** Coexisten Tailwind, Bootstrap 5, App.css, global.js (styled-components), CSS de componentes individuales, y restos de RSuite. Las reglas se pisan entre si de formas impredecibles.

**Sintoma:** Un `padding` definido en Tailwind es overrideado por Bootstrap. Un color de `global.js` pisa el token CSS. Un `!important` en App.css rompe el hover de shadcn.

**Prevencion:**
- `preflight: false` en Tailwind esta activado por necesidad — no cambiarlo hasta Fase 6.
- Cada vez que se migra un componente, eliminar TODAS las reglas CSS legacy que lo afectaban. No dejar codigo muerto.
- Usar `@layer base {}` en `index.css` para que los tokens tengan la especificidad correcta.
- Antes de agregar un `!important`, preguntarse: "Que regla legacy esta pisando esto?" y eliminar esa regla en vez de escalar la guerra de especificidad.
- Auditar con DevTools: abrir el panel de Computed Styles y verificar que las reglas que ganan son las esperadas.

---

## AP4. Tests primero, diseno despues — prioridad invertida

**Causa raiz:** Enfocarse en que los tests pasen antes de que el componente se vea bien. Se termina con un componente "correcto" pero feo.

**Sintoma:** Los 449 tests pasan pero la captura de pantalla muestra una UI que no se acerca al objetivo visual.

**Prevencion:**
- El flujo correcto es: **disenar → implementar → verificar visualmente → LUEGO escribir tests**.
- Los tests validan que el diseno implementado no se rompe — no son el objetivo en si mismos.
- Despues de cada componente, abrir el navegador, alternar dark/light mode, y comparar contra las apps de referencia ANTES de escribir un solo test.
- Los tests de regresion visual (screenshots) son mas valiosos que tests unitarios para el rediseno.

---

## AP5. Hardcodear valores en vez de usar tokens

**Causa raiz:** Escribir `text-slate-600` directamente en vez de `text-muted-foreground`. Usar `bg-[#2563EB]` en vez de `bg-primary`.

**Sintoma:** Al cambiar de tema o ajustar la paleta, algunos elementos no se actualizan. El dark mode tiene textos ilegibles o fondos incorrectos.

**Prevencion:**
- REGLA: Nunca usar colores directos de Tailwind (`slate-600`, `blue-500`) en componentes. Siempre usar tokens semanticos (`foreground`, `muted-foreground`, `primary`, `border`).
- El unico lugar donde se definen colores HSL es `src/index.css` bajo `:root` y `.dark`.
- Si se necesita un color que no existe como token, agregarlo como token nuevo — no hardcodearlo.

---

## AP6. Migrar sin entender el componente legacy

**Causa raiz:** Reescribir un componente legacy basandose solo en su markup HTML sin entender la logica de negocio, los side effects, o las dependencias de datos.

**Sintoma:** El componente nuevo se ve mejor pero le faltan flujos (un boton que generaba un PDF, un select que disparaba una recarga, un modal que validaba datos antes de enviar).

**Prevencion:**
- Antes de migrar un componente, leer el archivo completo y documentar:
  - Que props recibe
  - Que services llama
  - Que modales abre
  - Que efectos secundarios tiene
  - Que otros componentes lo consumen
- Crear un checklist de funcionalidades y verificar cada una despues de la migracion.
- En caso de duda, preguntar antes de borrar.

---

## AP7. Romper URLs bookmarkeadas

**Causa raiz:** Renombrar rutas sin crear redirects.

**Sintoma:** Usuarios que tenian `/fun/123` bookmarkeado llegan a un 404 despues del deploy.

**Prevencion:**
- Toda ruta legacy tiene su redirect en `getRouteRedirects()` de `navigation-config.js`.
- Al agregar una ruta nueva que reemplaza una vieja, agregar SIEMPRE el redirect en la misma sesion.
- Los tests e2e validan que las URLs principales resuelven correctamente.

---

## AP8. Olvidar el dark mode

**Causa raiz:** Desarrollar solo en light mode y "despues le ponemos el dark".

**Sintoma:** Al activar dark mode, textos blancos sobre fondos blancos, bordes invisibles, inputs sin contraste, badges ilegibles.

**Prevencion:**
- Desarrollar con el toggle de tema abierto. Despues de cada cambio, verificar ambos modos.
- Los tokens CSS en `.dark {}` de `index.css` son la unica fuente de verdad para dark mode.
- Si un componente shadcn no se ve bien en dark, verificar que usa tokens semanticos y no colores directos.

---

## AP9. Crear componentes "isla" desconectados del sistema

**Causa raiz:** Un componente nuevo usa su propia paleta, su propio font-size, su propio spacing — sin referirse a los tokens del sistema.

**Sintoma:** La pagina se ve como un collage de 3 apps diferentes.

**Prevencion:**
- Todo componente nuevo debe usar EXCLUSIVAMENTE:
  - Colores: tokens de `index.css` via clases Tailwind (`bg-background`, `text-foreground`, etc.)
  - Tipografia: `font-sans` (Inter) o `font-mono` (JetBrains Mono)
  - Spacing: escala de Tailwind (p-1 a p-8, gap-1 a gap-6)
  - Bordes: `border-border`, `rounded-md` o `rounded-lg`
  - Sombras: `shadow-sm`, `shadow-md` (no custom box-shadow)

---

## AP10. Commits gigantes que mezclan refactor + feature + fix

**Causa raiz:** Hacer un commit con 40 archivos que toca estilos, rutas, logica y tests.

**Sintoma:** Si algo se rompe, no se puede aislar que cambio fue. Los code reviews son imposibles.

**Prevencion:**
- Un commit = un tipo de cambio:
  - `style:` solo cambios visuales
  - `refactor:` solo reestructuracion sin cambio de comportamiento
  - `feat:` solo funcionalidad nueva
  - `fix:` solo correccion de bug
  - `test:` solo tests
- Si un cambio toca estilo Y funcionalidad, dividirlo en 2 commits.

---

## Checklist rapido antes de cada commit

- [ ] Se ve bien en light mode?
- [ ] Se ve bien en dark mode?
- [ ] Usa solo tokens semanticos (no colores hardcoded)?
- [ ] No introduce nueva dependencia de estilos?
- [ ] No deja CSS muerto?
- [ ] Los tests pasan (`npm test`)?
- [ ] El build pasa (`npm run build`)?
- [ ] Se comparo visualmente contra las apps de referencia?
