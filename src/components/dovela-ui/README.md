# Dovela UI

Capa local de componentes parametrizados para normalizar la interfaz de Dovela sin acoplar las vistas directamente a Tailwind, shadcn/ui o CSS hardcodeado.

## Decisión actual

- `src/components/ui/*` conserva los primitives shadcn/ui.
- `src/components/dovela-ui/*` expone los componentes de producto que deben consumir los módulos.
- `src/index.css` define tokens globales y tokens de componente (`--button-*`, `--card-*`, `--alert-*`, etc.).
- Cada vista mantiene CSS local solo para layout específico del módulo, no para redefinir estados visuales comunes.

## Componentes disponibles

- `DovelaButton`: acciones primarias, secundarias, destructivas y estados `loading`.
- `DovelaBadge`: estados semánticos `neutral`, `info`, `success`, `warning`, `danger`, `outline`.
- `DovelaCard`: superficie base, con `tone` y `as` para semántica (`section`, `article`, etc.).
- `DovelaInlineAlert`: mensajes de estado, advertencia, éxito y error con iconografía consistente.
- `DovelaField`, `DovelaInput`, `DovelaTextarea`, `DovelaSelect`: contratos accesibles para formularios.
- `DovelaPageHeader`: encabezados de páginas o submódulos.
- `DovelaSectionPanel`: panel de sección con título, descripción, acciones y contenido.

## Regla de adopción gradual

Cuando se toque una vista existente, primero sustituir patrones repetidos por componentes Dovela:

- Botones y acciones por `DovelaButton`.
- Badges y pills por `DovelaBadge`.
- Tarjetas, resúmenes y superficies por `DovelaCard` o `DovelaSectionPanel`.
- Estados informativos, errores y advertencias por `DovelaInlineAlert`.
- Campos y editores por `DovelaField` + control Dovela correspondiente.

Si una clase CSS local solo existe para color, borde, radio, sombra o tono de estado, debe moverse a token/componente. Si existe para grid, sticky behavior, alturas de módulo o layout específico, puede quedarse en la vista.

## Capa operacional municipal

La capa operacional traduce estados legales y administrativos a componentes reutilizables. No reemplaza los datos del backend ni inventa módulos: solo normaliza cómo se muestran estados, documentos y acciones transversales.

### Estados aprobados

- `en_revision`: revisión interna del expediente o solicitud.
- `requiere_subsanacion`: el solicitante debe corregir o completar información.
- `pendiente_respuesta`: actuación o PQRS pendiente de respuesta formal.
- `respondido`: respuesta registrada.
- `vencido`: plazo legal u operativo terminado.
- `proximo_a_vencer`: plazo cercano a terminar.
- `archivado`: expediente o actuación cerrado para consulta.
- `bloqueado`: el trámite no puede avanzar por una condición administrativa.

### Documentos aprobados

- `requisito`
- `soporte`
- `respuesta`
- `acto_administrativo`
- `revision_tecnica`

### Reglas de uso

- Use `DovelaOperationalState` cuando el estado requiera contexto operacional visible.
- Use `DovelaDocumentChip` para listar documentos adjuntos, requisitos, respuestas o actos administrativos.
- No use color como único indicador; incluya etiqueta y texto operativo.
- No agregue estados nuevos sin un flujo real que los use.
- No agregue hexadecimales locales para estados; use tokens de `src/index.css`.
