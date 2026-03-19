const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, AlignmentType, WidthType, ShadingType, BorderStyle } = require('docx');

const borderStyle = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle };
const headerShading = { fill: "D5E8F0", type: ShadingType.CLEAR };

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 24 } } }, // 12pt default
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal", next: "Normal", run: { size: 48, bold: true, color: "000000" }, paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 240, after: 240 } } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, color: "003366" },
        paragraph: { spacing: { before: 360, after: 240 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, color: "004080" },
        paragraph: { spacing: { before: 240, after: 180 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, color: "0059b3" },
        paragraph: { spacing: { before: 180, after: 120 }, outlineLevel: 2 } },
    ]
  },
  sections: [
    {   // Portada
      properties: {
        page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
      },
      children: [
        new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: "Portal Front Office Ciudadano", break: 2 })] }),
        new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: "Plan Estratégico y Arquitectura", size: 36 })] }),
        new Paragraph({ children: [new TextRun({ text: "", break: 4 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Curaduría Urbana 1 de Bucaramanga", bold: true, size: 28 })] }),
        new Paragraph({ children: [new TextRun({ text: "", break: 4 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Versión: 1.0", size: 24 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Fecha: 18 de Marzo de 2026`, size: 24 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Preparado por: Líder Técnico Full Stack y Equipo de Transformación", size: 24 })] }),
      ]
    },
    {   // Body
      properties: {
        page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
      },
      children: [
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("1. Resumen Ejecutivo")] }),
        new Paragraph({ children: [new TextRun("El presente informe documenta la estrategia, arquitectura y plan de ejecución para la creación del Nuevo Portal Front Office Ciudadano de la Curaduría Urbana 1. Actualmente, el sistema interno gestiona exhaustivamente los expedientes (clocks/records), radicaciones (FUN) y peticiones (PQRS) de forma centralizada y operativa (Backoffice).")] }),
        new Paragraph({ children: [new TextRun("El propósito de este nuevo portal es extender dichas capacidades hacia el usuario final (el ciudadano), permitiéndole autogestionar radicaciones, hacer auto-diagnósticos con base en los formularios reales, realizar seguimiento transparente del estado de sus trámites mediante los relojes legales existentes, y canalizar sus PQRS directamente.")] }),
        new Paragraph({ children: [new TextRun("Este despliegue entregará un valor significativo al agilizar la ventana de atención, reducir errores documentales previos a la radicación y brindar total transparencia de los procesos en tiempo real, conectándose a la infraestructura de React y PHP ya consolidada.")] }),

        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("2. Diagnóstico del Sistema Actual")] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Arquitectura y Módulos Existentes")] }),
        new Paragraph({ children: [new TextRun("Tras la exploración exhaustiva del repositorio frontend, se evidencia un sistema fuertemente estructurado bajo procesos operativos (SPA en React 19 + Vite 6).")] }),
        new Paragraph({
            bullet: { level: 0 },
            children: [
                new TextRun({ text: "Módulo Clocks (Relojes Legales): ", bold: true }),
                new TextRun("Control estricto de tiempos de respuesta por trámite."),
            ]
        }),
        new Paragraph({
            bullet: { level: 0 },
            children: [
                new TextRun({ text: "Formularios FUN (fun_forms): ", bold: true }),
                new TextRun("Mapeo directo del Formulario Único Nacional, con campos granulares (f_11 a f_16, etc.) que estructuran legalmente las solicitudes."),
            ]
        }),
        new Paragraph({
            bullet: { level: 0 },
            children: [
                new TextRun({ text: "Módulo PQRS: ", bold: true }),
                new TextRun("Gestión administrativa de los estados de quejas y reclamos."),
            ]
        }),
        new Paragraph({
            bullet: { level: 0 },
            children: [
                new TextRun({ text: "Expedientes y Resoluciones: ", bold: true }),
                new TextRun("Flujo transaccional robusto apoyado por el TemplateEngine de documentos PDF."),
            ]
        }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Brechas y Limitaciones")] }),
        new Paragraph({ children: [new TextRun("La brecha principal radica en la bidireccionalidad. La aplicación actual funciona como una herramienta de Backoffice puro. No provee un canal expuesto directamente al ciudadano sin fricciones administrativas, lo cual centraliza el peso de digitación en los operadores y genera cuellos de botella en la ventanilla. Además, la carencia de un sistema de autovalidación de documentos eleva la tasa de radicaciones incompletas.")] }),

        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("3. Propuesta del Sistema Front Office Ciudadano")] }),
        new Paragraph({ children: [new TextRun("El portal estará diseñado bajo un enfoque ciudadano céntrico, exponiendo los contratos de la API existente mediante una interfaz simplificada.")] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Módulo 1: Radicación Ciudadana")] }),
        new Paragraph({ children: [new TextRun("El ciudadano dispondrá de un Single Page Application donde inicializará sus solicitudes asociadas a los formularios FUN ya modelados en backend (creaciones FUN 1, 2, 3, etc.). La carga de documentos se validará contra el motor documental actual.")] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Módulo 2: Seguimiento Transparente")] }),
        new Paragraph({ children: [new TextRun("El portal consumirá las entidades subyacentes del módulo  "), new TextRun({ text: "clocks", italics: true }), new TextRun(" (como se expone en "), new TextRun({ text: "fun.service.js", italics: true }), new TextRun(") para graficar una línea de tiempo intuitiva de avance de licencias, exponiendo etapas como 'Revisión Estructural', 'Observaciones', etc.")] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Módulo 3: Checklist de Auto-Diagnóstico")] }),
        new Paragraph({ children: [new TextRun("Basado en el desglose del Formulario Único Nacional, el sistema expondrá un formulario simplificado previo a la radicación oficial. Evaluará campos como uso de suelo, tipo de obra y estratificación técnica (campos mapeados de la serie f_1X de la base de datos).")] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Módulo 4: Portal de PQRS y Módulo 5: Canal Informativo")] }),
        new Paragraph({ children: [new TextRun("Integración directa al endpoint de "), new TextRun({ text: "pqrs_main.service.js", italics: true }), new TextRun(" habilitando a los usuarios para asentar y rastrear sugerencias. Junto a este, un banco de conocimiento y FAQs administrable.")] }),

        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("4. Arquitectura Técnica Propuesta")] }),
        new Paragraph({
            bullet: { level: 0 },
            children: [
                new TextRun({ text: "Stack Recomendado: ", bold: true }),
                new TextRun("Mantenemos React 19 y Vite 6 para asegurar reutilización de componentes y helpers (como el ThemeProvider y las llamadas HTTP con axios ya configuradas en "), new TextRun({ text: "http-common.js", italics: true }), new TextRun(")."),
            ]
        }),
        new Paragraph({
            bullet: { level: 0 },
            children: [
                new TextRun({ text: "Integración Frontend-Backend: ", bold: true }),
                new TextRun("El Front Office se comunicará al mismo API PHP/MySQL. Se requerirá un nuevo middleware en el API (`CitizenGateway`) para aplicar rate-limiting y sanitización, y evitar exponer lógica de Backoffice."),
            ]
        }),
        new Paragraph({
            bullet: { level: 0 },
            children: [
                new TextRun({ text: "Autenticación: ", bold: true }),
                new TextRun("JWT (JSON Web Tokens) federado, extendiendo el AuthProvider actual hacia un rol de 'Ciudadano', restringido solo a lectura o escritura de entidades de propia titularidad."),
            ]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("5. Plan de Trabajo")] }),
        new Paragraph({ children: [new TextRun("La implementación dependerá del equipo compuesto por: 1 Senior Full Stack (Líder), 1 Junior Full Stack, y la orquestación IA.")] }),
        createSimpleTable([
            ["Fase", "Hito Principal", "Responsable"],
            ["Fase 1: Framework y Setup", "Estructura del Repositorio Citizen, UI Base (Bootstrap/RSuite)", "Junior, bajo diseño Senior"],
            ["Fase 2: Auth y PQRS", "Registro/Login Ciudadano y Módulo de radicación simple PQRS", "Líder Senior, Agente IA"],
            ["Fase 3: Auto-diagnóstico", "Motor de Reglas replicando validaciones del modulo FUN local", "Agente IA (Extracción de Lógica), Junior"],
            ["Fase 4: Integración Expedientes", "Dashboard Transparente conectando Clocks API", "Líder Senior"],
            ["Fase 5: Testing E2E", "Validación Playwright sobre portales expuestos", "Agente IA, Junior"]
        ]),

        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("6. Presupuesto y Recursos")] }),
        createSimpleTable([
            ["Recurso", "Rol / Función", "Dedicación Estimada"],
            ["Desarrollador Senior", "Arquitectura, Revisión y Códificación central", "100% Core de Proyecto"],
            ["Desarrollador Junior", "Componentes UI, Validaciones Frontend", "100% Ejecución de UI"],
            ["Agentes de IA", "Generador de código y Testing E2E, Refactor", "Orquestado On-demand"],
            ["AWS/GCP Hosting", "Contenedor Frontend independiente", "Infraestructura Cloud"]
        ]),

        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("7. Riesgos y Mitigaciones")] }),
        createSimpleTable([
            ["Riesgo Técnico / Adopción", "Nivel", "Estrategia de Mitigación"],
            ["Exposición inadvertida de datos vía endpoints antiguos (Ej. records) sin ACL restringido", "Alto", "El Líder Senior liderará la extensión de Roles en Backend (Role: CIUDADANO)."],
            ["Fricción UX que ahuyente el registro del ciudadano", "Medio", "Implementación de Single Sign-On (Google/Facebook) y UX ultra limpia."],
            ["Baja Adopción ante complejidad del Formulario FUN", "Medio", "Auto-diagnóstico como paso previo amable, apoyado por UI conversacional si es posible."]
        ]),

        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("8. Especificación para Prototipado (UX Pilot Ready)")] }),
        new Paragraph({ children: [new TextRun("Especificaciones directas para generación del mock UI:")] }),
        new Paragraph({
            bullet: { level: 0 },
            children: [
                new TextRun({ text: "Pantalla Dashboard (Ciudadano): ", bold: true }),
                new TextRun("Tarjetas Bootstrap limpias usando colores de la variable global de portal (`background: var(--lightTheme)`). Gráfica horizontal de línea de tiempo con iconos (radicado -> revisión -> aprobado)."),
            ]
        }),
        new Paragraph({
            bullet: { level: 0 },
            children: [
                new TextRun({ text: "Pantalla Radicación (Step by Step): ", bold: true }),
                new TextRun("Wizard estilo \"Paso 1: ¿Qué vas a construir?\", \"Paso 2: Subir PDF Cédula\", \"Paso 3: Subir Levantamiento\". Botones deshabilitados hasta que el checklist interno dé verde."),
            ]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("9. Métricas de Éxito")] }),
        new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun("Tasa de radicaciones digitales ciudadanas versus presenciales (>40% en primer trimestre).")]
        }),
        new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun("Reducción del tiempo promedio en ventanilla (-50%).")]
        }),
        new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun("Cero incidentes de regresión en el Backoffice actual posterior al deployment (Cobertura 100% en Vitest/Playwright).")]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Anexos")] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Mapeo de Campos del Backend (Extraído de FUN Forms)")] }),
        createSimpleTable([
            ["Módulo Original", "Campo en Back", "Uso Front Office Ciudadano"],
            ["fun_n_1", "f_11 (Modalidad Licencia)", "Wizard Inicial de Radicación (Radio Buttons UI)"],
            ["fun_n_1", "f_12 (Usos Solicitados)", "Cheklist de validación urbana"],
            ["pqrsadmin", "Asignación / Tipo", "Tipo de Petición Básica a listar"],
            ["clocks", "checkcontrol_2", "Línea de tiempo del Dashboard"]
        ]),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Glosario Técnico")] }),
        new Paragraph({ children: [new TextRun({ text: "FUN: ", bold: true }), new TextRun("Formulario Único Nacional, base de todas las radicaciones legales de curaduría.")] }),
        new Paragraph({ children: [new TextRun({ text: "Clocks: ", bold: true }), new TextRun("Sistema interno de medición de tiempos reglamentarios por radicado.")] }),
        new Paragraph({ children: [new TextRun({ text: "Backoffice: ", bold: true }), new TextRun("Sistema actual usado por los operadores de la entidad.")] })
      ]
    }
  ]
});

function createSimpleTable(rowsData) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: rowsData[0].map(() => Math.floor(9360 / rowsData[0].length)),
    rows: rowsData.map((row, index) => 
      new TableRow({
        children: row.map(cellText => 
          new TableCell({
            borders,
            width: { size: Math.floor(9360 / row.length), type: WidthType.DXA },
            shading: index === 0 ? headerShading : {},
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: cellText, bold: index === 0 })] })]
          })
        )
      })
    )
  });
}

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("Informe_FrontOffice_Ciudadano.docx", buffer);
  console.log("Documento generado exitosamente.");
}).catch(err => {
  console.error("Error al generar", err);
});
