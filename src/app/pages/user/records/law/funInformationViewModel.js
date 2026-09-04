import { _FUN_101_PARSER, _FUN_102_PARSER, _FUN_1_PARSER, _FUN_2_PARSER, _FUN_3_PARSER, _FUN_4_PARSER, _FUN_5_PARSER, _FUN_6_PARSER, _FUN_7_PARSER, _FUN_8_PARSER, _FUN_9_PARSER, _FUN_24_PARSER, _FUN_25_PARSER } from '../../../../components/customClasses/funCustomArrays';

const valueOrFallback = value => value === undefined || value === null || value === '' ? 'Sin registro' : String(value);
const documentStatus = value => {
  const id = String(value || '').trim();
  return !id || id === '0' ? 'No' : 'Sí';
};

const identificationFields = [
  { id: 'tipo', label: '1.1 Tipo de trámite', parser: _FUN_1_PARSER },
  { id: 'tramite', label: '1.2 Objeto', parser: _FUN_2_PARSER },
  { id: 'm_urb', label: '1.3 Modalidad licencia de urbanización', parser: _FUN_3_PARSER },
  { id: 'm_sub', label: '1.4 Modalidad licencia de subdivisión', parser: _FUN_4_PARSER },
  { id: 'm_lic', label: '1.5 Modalidad licencia de construcción', parser: _FUN_5_PARSER },
  { id: 'usos', label: '1.6 Usos', parser: _FUN_6_PARSER },
  { id: 'area', label: '1.7 Área construida', parser: _FUN_7_PARSER },
  { id: 'vivienda', label: '1.8 Tipo de vivienda', parser: _FUN_8_PARSER },
  { id: 'cultural', label: '1.9 Bien de interés cultural', parser: _FUN_9_PARSER },
  { id: 'regla_1', label: '1.10.1 Declaración sobre medidas de construcción sostenible', parser: _FUN_101_PARSER, model2021Only: true },
  { id: 'regla_2', label: '1.10.2 Zonificación climática', parser: _FUN_102_PARSER, model2021Only: true },
];

function selectVersion(items, version) {
  const rows = Array.isArray(items) ? items : [];
  return rows.find(item => String(item?.version) === String(version)) || rows[Math.max(0, Number(version) - 1)] || null;
}

function locationValue(property) {
  return [
    ['Barrio', property?.barrio], ['Vereda', property?.vereda], ['Comuna', property?.comuna], ['Sector', property?.sector],
    ['Corregimiento', property?.corregimiento], ['Lote', property?.lote], ['Estrato', property?.estrato], ['Manzana', property?.manzana],
  ].filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([label, value]) => `${label}: ${value}`)
    .join('\n');
}

function personType(value) {
  const normalized = String(value || '').trim().toUpperCase().replace(/\s+/g, ' ');
  if (normalized === 'PERSONA NATURAL' || normalized === 'NATURAL') return 'NATURAL';
  if (normalized === 'PERSONA JURIDICA' || normalized === 'JURIDICA') return 'JURIDICA';
  return 'Sin registro';
}

/**
 * Shared, document-only contract for FUN information tables.
 * It intentionally knows nothing about RecordLawService, legal review steps, or review versions.
 */
export function buildFunInformationViewModel({ currentItem, currentVersion }) {
  const version = currentVersion ?? currentItem?.version ?? 1;
  const form = selectVersion(currentItem?.fun_1s, version);
  const property = currentItem?.fun_2 || {};
  const holders = Array.isArray(currentItem?.fun_51s) ? currentItem.fun_51s : [];
  const professionals = Array.isArray(currentItem?.fun_52s) ? currentItem.fun_52s : [];
  const responsible = selectVersion(currentItem?.fun_53s, version);

  return {
    version,
    sections: [
      {
        id: 'identification', kind: 'matrix', title: '1. Identificación de la solicitud',
        emptyMessage: 'No hay información de identificación registrada para esta versión.',
        fields: identificationFields.filter(field => !field.model2021Only || Number(currentItem?.model) === 2021)
          .map((field, controlIndex) => ({ id: field.id, field: field.id, label: field.label, controlIndex, value: valueOrFallback(field.parser(form?.[field.id])) })),
      },
      {
        id: 'property', kind: 'matrix', title: '2. Información sobre el predio', emptyMessage: 'No hay información del predio registrada.',
        fields: [
          ['direccion', '2.1 Dirección actual', property?.direccion], ['direccion_ant', '2.1 Dirección anterior', property?.direccion_ant],
          ['matricula', '2.2 Matrícula inmobiliaria', property?.matricula], ['catastral', '2.3 ID. catastral (viejo)', property?.catastral],
          ['catastral_2', '2.3.2 ID. catastral (nuevo)', property?.catastral_2], ['suelo', '2.4 Clasificación del suelo', _FUN_24_PARSER(property?.suelo)],
          ['lote_pla', '2.5 Planimetría del lote', _FUN_25_PARSER(property?.lote_pla)], ['location', '2.6 Ubicación', locationValue(property)],
        ].map(([id, label, value], controlIndex) => ({ id, label, controlIndex, value: valueOrFallback(value), multiline: id === 'location' })),
      },
      {
        id: 'holders', kind: 'table', title: '5.1. Titulares de la licencia', emptyMessage: 'No hay titulares registrados.',
        columns: ['Nombre', 'CC / NIT', 'Tipo persona', 'Calidad', 'Doc. identidad', 'Cert. exist. / rep. legal', 'Estado'],
        sourceRows: holders,
        rows: holders.map((holder, index) => {
          const documents = String(holder?.docs || '').split(',');
          return { id: holder?.id ?? `holder-${index}`, values: [
            valueOrFallback(`${holder?.name || ''} ${holder?.surname || ''}`.trim() || null), valueOrFallback(holder?.id_number), personType(holder?.type), valueOrFallback(holder?.role),
            documentStatus(documents[0]), documentStatus(documents[1]), holder?.active === true || holder?.active === 1 || holder?.active === '1' ? 'ACTIVO' : 'INACTIVO',
          ] };
        }),
      },
      {
        id: 'professionals', kind: 'professionals', title: '5.2. Profesionales responsables', emptyMessage: 'No hay profesionales registrados.',
        legalFilingDate: (Array.isArray(currentItem?.fun_clocks) ? currentItem.fun_clocks : []).find(clock => String(clock?.state) === '5' && String(clock?.version) === String(version))?.date_start || null,
        rows: professionals,
      },
      {
        id: 'responsible', kind: 'table', title: '5.3. Responsable de la solicitud', emptyMessage: 'No hay responsable registrado para esta versión.',
        columns: ['Nombre', 'Cédula', 'Calidad', 'Doc. identidad', 'Poder o mandato'],
        sourceRecord: responsible,
        rows: responsible ? [{ id: responsible.id ?? 'responsible', values: [
          valueOrFallback(`${responsible.name || ''} ${responsible.surname || ''}`.trim() || null), valueOrFallback(responsible.id_number), valueOrFallback(responsible.role),
          documentStatus(String(responsible.docs || '').split(',')[0]), documentStatus(String(responsible.docs || '').split(',')[1]),
        ] }] : [],
      },
    ],
  };
}
