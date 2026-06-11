import { dvCheckList, fatherValues } from '@/app/pages/user/fun_forms/utils/funChecklistRules';
import JsonDocList from '@/app/components/jsons/fun6DocsList.json';
import { Lists } from '@/app/components/jsons/lists_submit';
import { getSimulatorOptionLabel } from './simulatorOptionLabels';

const DEFAULT_SELECTION = {
  tipo: [],
  tramite: '',
  m_urb: '',
  m_sub: '',
  m_lic: [],
  area: '',
  cultural: '',
  usos: [],
  vivienda: '',
};

const COMMON_CODES = new Set(['511', '512', '513', '516', '517', '518', '519']);
const ALWAYS_CURRENT_RULE_CODES = new Set(['660f', '6891', '6892', '6893']);

const FIELD_TRACE_RULES = [
  { codes: ['621', '601a', '622', '602a'], field: 'm_urb', values: ['A'], prefix: 'Urbanización', source: 'dvCheckList: m_urb === A' },
  { codes: ['623', '601b', '602b', '624', '625'], field: 'm_urb', values: ['B'], prefix: 'Urbanización', source: 'dvCheckList: m_urb === B' },
  { codes: ['626', '627', '601c', '602c'], field: 'm_urb', values: ['C'], prefix: 'Urbanización', source: 'dvCheckList: m_urb === C' },
  { codes: ['630', '631', '632', '633', '634', '635', '636'], field: 'tipo', values: ['B'], prefix: 'Tipo', source: 'dvCheckList: tipo incluye B' },
  { codes: ['641'], field: 'm_sub', values: ['A'], prefix: 'Subdivisión', source: 'dvCheckList: m_sub === A' },
  { codes: ['642', '643'], field: 'm_sub', values: ['B'], prefix: 'Subdivisión', source: 'dvCheckList: m_sub === B' },
  { codes: ['651', '652', '653'], field: 'tipo', values: ['F'], prefix: 'Tipo', source: 'dvCheckList: tipo incluye F' },
  { codes: ['6601', '6602', '6603', '6604', '6605', '911'], field: 'tipo', values: ['D'], prefix: 'Tipo', source: 'dvCheckList: tipo incluye D' },
  { codes: ['660a'], field: 'area', values: ['B'], prefix: 'Área', source: 'dvCheckList: area === B' },
  { codes: ['660b', '660d'], field: 'area', values: ['C'], prefix: 'Área', source: 'dvCheckList: area === C' },
  { codes: ['660c', '660e'], field: 'area', values: ['D'], prefix: 'Área', source: 'dvCheckList: area === D' },
  { codes: ['6607', '6608'], field: 'area', values: ['B', 'C', 'D'], prefix: 'Área', source: 'dvCheckList: area es B, C o D' },
  { codes: ['6611'], field: 'm_lic', values: ['B', 'C', 'F'], prefix: 'Construcción', source: 'dvCheckList: m_lic incluye B, C o F' },
  { codes: ['6612', '6613'], field: 'tipo', values: ['B', 'A'], prefix: 'Tipo', source: 'dvCheckList: tipo incluye B o A' },
  { codes: ['6615'], field: 'm_lic', values: ['C', 'D'], prefix: 'Construcción', source: 'dvCheckList: m_lic incluye C o D' },
  { codes: ['6616', '6617', '6618', '6619'], field: 'm_lic', values: ['g', 'G', 'I'], prefix: 'Construcción', source: 'dvCheckList: m_lic incluye G.2, G.1 o I' },
  { codes: ['671', '672'], field: 'tipo', values: ['E'], prefix: 'Tipo', source: 'dvCheckList: tipo incluye E' },
];

const FIELD_TRACE_BY_CODE = FIELD_TRACE_RULES.reduce((rulesByCode, rule) => {
  for (const code of rule.codes) {
    rulesByCode[code] = rule;
  }
  return rulesByCode;
}, {});

const TRAMITE_TRACE_RULES = {
  680: { label: 'ajuste cota', source: 'dvCheckList: trámite contiene ajuste de cota' },
  681: { label: 'propiedad horizontal', source: 'dvCheckList: trámite contiene propiedad horizontal' },
  682: { label: 'propiedad horizontal', source: 'dvCheckList: trámite contiene propiedad horizontal' },
  683: { label: 'propiedad horizontal', source: 'dvCheckList: trámite contiene propiedad horizontal' },
  684: { label: 'propiedad horizontal', source: 'dvCheckList: trámite contiene propiedad horizontal' },
  685: { label: 'propiedad horizontal', source: 'dvCheckList: trámite contiene propiedad horizontal' },
  686: { label: 'movimiento tierra', source: 'dvCheckList: trámite contiene movimiento de tierra' },
  687: { label: 'piscina', source: 'dvCheckList: trámite contiene piscina' },
  6862: { label: 'piscina', source: 'dvCheckList: trámite contiene piscina' },
  688: { label: 'modificación plano', source: 'dvCheckList: trámite contiene modificación de plano' },
  689: { label: 'modificación plano', source: 'dvCheckList: trámite contiene modificación de plano' },
};

export function getInitialSimulatorSelection() {
  return { ...DEFAULT_SELECTION };
}

export function normalizeSimulatorSelection(selection = {}) {
  const normalized = { ...DEFAULT_SELECTION, ...selection };

  if (typeof normalized.tipo === 'string') {
    normalized.tipo = normalized.tipo ? [normalized.tipo] : [];
  } else if (Array.isArray(normalized.tipo)) {
    normalized.tipo = normalized.tipo.filter(Boolean);
  } else {
    normalized.tipo = [];
  }

  if (typeof normalized.m_lic === 'string') {
    normalized.m_lic = normalized.m_lic ? [normalized.m_lic] : [];
  } else if (Array.isArray(normalized.m_lic)) {
    normalized.m_lic = normalized.m_lic.filter(Boolean);
  } else {
    normalized.m_lic = [];
  }

  if (typeof normalized.usos === 'string') {
    normalized.usos = normalized.usos ? [normalized.usos] : [];
  } else if (Array.isArray(normalized.usos)) {
    normalized.usos = normalized.usos.filter(Boolean);
  } else {
    normalized.usos = [];
  }

  return normalized;
}

export function buildSimulatedFunItem(selection = {}) {
  const normalizedSelection = normalizeSimulatorSelection(selection);
  return {
    fun_1s: [normalizedSelection],
  };
}

export function buildDocumentRequirementPreviewPayload(selection = {}, configStatus = 'published') {
  const normalizedSelection = normalizeSimulatorSelection(selection);

  return {
    configStatus,
    actuacion: normalizedSelection,
  };
}

function getPreviewGroupLabel(groupKey, groupsByKey) {
  if (!groupKey) return 'Documentos configurados';
  return groupsByKey.get(groupKey)?.label || groupKey;
}

function getPreviewDocumentLabel(document, documentsByCode) {
  const code = String(document?.code ?? '');
  return document?.label || documentsByCode.get(code)?.label || JsonDocList[code] || `Sin etiqueta registrada para el código ${code}`;
}

function buildPreviewTrace(rule) {
  const ruleKey = rule?.key || 'Regla backend sin identificador';
  const conditionSummary = rule?.conditionSummary || 'Condición backend sin resumen';

  return createTrace({
    kind: 'backend-rule',
    reason: `${ruleKey}: ${conditionSummary}`,
    source: 'document-requirements/preview',
    label: ruleKey,
    value: conditionSummary,
  });
}

function normalizeTracesForPreview(traces = []) {
  if (Array.isArray(traces) && traces.length) return traces;

  return [createTrace({
    kind: 'backend-rule',
    reason: 'Documento requerido por preview backend sin traza detallada',
    source: 'document-requirements/preview',
  })];
}

export function normalizeDocumentRequirementPreviewResponse(responseData = {}, selection = {}) {
  const config = responseData?.config || {};
  const groupsByKey = new Map((Array.isArray(config.groups) ? config.groups : []).map((group) => [group.key, group]));
  const documentsByCode = new Map((Array.isArray(config.documents) ? config.documents : []).map((document) => [String(document.code), document]));
  const matchedRules = Array.isArray(responseData?.matchedRules) ? responseData.matchedRules : [];
  const tracesByCode = {};

  for (const rule of matchedRules) {
    const trace = buildPreviewTrace(rule);
    const documentCodes = Array.isArray(rule?.documentCodes) ? rule.documentCodes : [];
    for (const rawCode of documentCodes) {
      const code = String(rawCode);
      if (!tracesByCode[code]) tracesByCode[code] = [];
      tracesByCode[code].push(trace);
    }
  }

  const requiredDocuments = (Array.isArray(responseData?.requiredDocuments) ? responseData.requiredDocuments : []).map((document) => {
    const code = String(document?.code ?? '');
    const configDocument = documentsByCode.get(code) || {};
    const groupKey = document?.groupKey || configDocument.groupKey || 'backend';
    const groupLabel = getPreviewGroupLabel(groupKey, groupsByKey);

    return {
      code,
      label: getPreviewDocumentLabel(document, documentsByCode),
      applies: true,
      groupId: groupKey,
      groupKey,
      groupLabel,
      traces: normalizeTracesForPreview(tracesByCode[code]),
    };
  });

  const groupedDocuments = Array.from(requiredDocuments.reduce((groups, document) => {
    if (!groups.has(document.groupKey)) {
      groups.set(document.groupKey, {
        groupId: document.groupKey,
        groupLabel: document.groupLabel,
        items: [],
      });
    }
    groups.get(document.groupKey).items.push(document);
    return groups;
  }, new Map()).values());

  const diagnostics = Array.isArray(responseData?.diagnostics) ? responseData.diagnostics : [];

  return {
    source: responseData?.status || 'published',
    configVersion: responseData?.configVersion ?? null,
    config,
    requiredDocuments,
    matchedRules,
    diagnostics,
    checklistItems: requiredDocuments,
    evaluatedChecklistItems: requiredDocuments,
    applicableCodes: requiredDocuments.map((document) => document.code),
    groupedDocuments,
    ruleTracesByCode: tracesByCode,
    selectionSummary: normalizeSimulatorSelection(selection),
    warnings: diagnostics.map((diagnostic) => diagnostic?.message || diagnostic).filter(Boolean),
  };
}

const VARIANT_CODE_REGEXES = [
  { pattern: /^601[abc]$/, groupId: 'list_62' },
  { pattern: /^602[abc]$/, groupId: 'list_62' },
  { pattern: /^660[abcdef]$/, groupId: 'list_66' },
  { pattern: /^6862$/, groupId: 'list_68' },
];

export function getVuGroupIdForCode(rawCode) {
  if (!rawCode) return null;

  for (const { pattern, groupId } of VARIANT_CODE_REGEXES) {
    if (pattern.test(rawCode)) {
      return groupId;
    }
  }

  const codeAsNumber = Number(rawCode);
  const codeAsString = String(rawCode);

  for (const groupKey of Object.keys(Lists)) {
    const group = Lists[groupKey];
    const groupName = Object.keys(group)[0];
    const codes = group[groupName];
    if (codes.includes(codeAsNumber) || codes.includes(codeAsString)) {
      return groupKey;
    }
  }

  return null;
}

export function getVuGroupLabelForCode(rawCode) {
  const groupId = getVuGroupIdForCode(rawCode);
  if (!groupId) return null;
  const group = Lists[groupId];
  return group ? Object.keys(group)[0] : null;
}

function getSelectedValues(selection, field) {
  const value = selection[field];
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
}

function formatSelectedValues(selection, field) {
  const selectedValues = getSelectedValues(selection, field);
  if (!selectedValues.length) return 'Sin seleccionar';
  return selectedValues.map((value) => getSimulatorOptionLabel(field, value)).join(', ');
}

function createTrace({ kind = 'selection', field = '', value = '', label = '', reason, source }) {
  return {
    kind,
    field,
    value,
    label,
    reason,
    source,
  };
}

function buildFieldTrace(rule, selection) {
  const selectedValues = getSelectedValues(selection, rule.field);
  const matchingValues = selectedValues.filter((value) => rule.values.includes(value));

  if (matchingValues.length) {
    return matchingValues.map((value) => {
      const label = getSimulatorOptionLabel(rule.field, value);
      return createTrace({
        field: rule.field,
        value,
        label,
        reason: `${rule.prefix}: ${label}`,
        source: rule.source,
      });
    });
  }

  const expectedLabel = rule.values.map((value) => getSimulatorOptionLabel(rule.field, value)).join(' o ');
  return [createTrace({
    kind: 'selection-mismatch',
    field: rule.field,
    value: rule.values.join('|'),
    label: expectedLabel,
    reason: `${rule.prefix} requerido: ${expectedLabel}; selección actual: ${formatSelectedValues(selection, rule.field)}`,
    source: rule.source,
  })];
}

function buildConstructionWithoutNewWorkTrace(selection, code) {
  const selectedValues = getSelectedValues(selection, 'm_lic');
  const matchingValues = selectedValues.filter((value) => value !== 'A');
  const source = `dvCheckList[${code}]: m_lic no incluye A Obra Nueva`;

  if (matchingValues.length) {
    return matchingValues.map((value) => {
      const label = getSimulatorOptionLabel('m_lic', value);
      return createTrace({
        field: 'm_lic',
        value,
        label,
        reason: `Construcción: ${label}; no incluye A Obra Nueva`,
        source,
      });
    });
  }

  if (!selectedValues.length) {
    return [createTrace({
      kind: 'current-rule',
      field: 'm_lic',
      value: '',
      label: 'Sin modalidad de construcción',
      reason: 'Regla actual: aplica cuando la modalidad de construcción no incluye A Obra Nueva; sin modalidad seleccionada aplica por defecto',
      source,
    })];
  }

  return [createTrace({
    kind: 'selection-mismatch',
    field: 'm_lic',
    value: 'A',
    label: 'A Obra Nueva',
    reason: `Construcción requerida: cualquier modalidad distinta de A Obra Nueva; selección actual: ${formatSelectedValues(selection, 'm_lic')}`,
    source,
  })];
}

function buildCulturalTrace(selection) {
  const selectedValue = selection.cultural;
  const source = 'dvCheckList[6609]: BIC es A Sí; sin BIC aplica por defecto';

  if (selectedValue === 'A') {
    const label = getSimulatorOptionLabel('cultural', selectedValue);
    return [createTrace({
      field: 'cultural',
      value: selectedValue,
      label,
      reason: `BIC: ${label}`,
      source,
    })];
  }

  if (!selectedValue) {
    return [createTrace({
      kind: 'current-rule',
      field: 'cultural',
      value: '',
      label: 'Sin seleccionar',
      reason: 'Regla actual: aplica si BIC es A Sí; sin BIC seleccionado aplica por defecto',
      source,
    })];
  }

  return [createTrace({
    kind: 'selection-mismatch',
    field: 'cultural',
    value: 'A',
    label: 'A Sí',
    reason: `BIC requerido: A Sí; selección actual: ${formatSelectedValues(selection, 'cultural')}`,
    source,
  })];
}

function normalizeTraceText(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function matchesTramiteTraceRule(value, label) {
  const normalizedValue = normalizeTraceText(value);
  const normalizedLabel = normalizeTraceText(label);

  if (normalizedLabel === 'propiedad horizontal') {
    return /(^|[^a-z])p\s*\.?\s*h(?=$|[^a-z])/.test(normalizedValue) || normalizedValue.includes('propiedad horizontal');
  }

  if (normalizedLabel === 'ajuste cota') {
    return /ajuste.*cota/.test(normalizedValue);
  }

  if (normalizedLabel === 'movimiento tierra') {
    return /movimiento.*tierra/.test(normalizedValue);
  }

  if (normalizedLabel === 'modificacion plano') {
    return /modificacion.*plano/.test(normalizedValue);
  }

  return normalizedValue.includes(normalizedLabel);
}

function buildTramiteTrace(selection, code) {
  const rule = TRAMITE_TRACE_RULES[code];
  const selectedValue = selection.tramite;
  const selectedLabel = selectedValue ? getSimulatorOptionLabel('tramite', selectedValue) : 'Sin seleccionar';

  if (!rule) {
    return null;
  }

  if (selectedValue && matchesTramiteTraceRule(selectedValue, rule.label)) {
    return [createTrace({
      field: 'tramite',
      value: selectedValue,
      label: selectedLabel,
      reason: `Trámite contiene "${rule.label}": ${selectedLabel}`,
      source: rule.source,
    })];
  }

  if (!selectedValue) {
    return [createTrace({
      kind: 'current-rule',
      field: 'tramite',
      value: '',
      label: 'Sin seleccionar',
      reason: 'Regla actual: aplica cuando el trámite está sin definir',
      source: `${rule.source}; fallback actual sin trámite seleccionado`,
    })];
  }

  return [createTrace({
    kind: 'selection-mismatch',
    field: 'tramite',
    value: rule.label,
    label: rule.label,
    reason: `Trámite debe contener "${rule.label}"; selección actual: ${selectedLabel}`,
    source: rule.source,
  })];
}

export function getRuleTraceForCode(rawCode, selection = {}) {
  const code = String(rawCode ?? '');
  const normalizedSelection = normalizeSimulatorSelection(selection);

  if (COMMON_CODES.has(code)) {
    return [createTrace({
      kind: 'common',
      reason: 'Común a toda solicitud',
      source: `dvCheckList[${code}]: () => true`,
    })];
  }

  if (ALWAYS_CURRENT_RULE_CODES.has(code)) {
    return [createTrace({
      kind: 'current-rule',
      reason: 'Regla actual: aplica siempre',
      source: `dvCheckList[${code}]: () => true`,
    })];
  }

  if (FIELD_TRACE_BY_CODE[code]) {
    return buildFieldTrace(FIELD_TRACE_BY_CODE[code], normalizedSelection);
  }

  if (code === '6609') {
    return buildCulturalTrace(normalizedSelection);
  }

  if (code === '6610' || code === '6614') {
    return buildConstructionWithoutNewWorkTrace(normalizedSelection, code);
  }

  const tramiteTrace = buildTramiteTrace(normalizedSelection, code);
  if (tramiteTrace) {
    return tramiteTrace;
  }

  return [createTrace({
    kind: 'fallback',
    reason: 'Regla actual evaluada sin metadata específica; revisar funChecklistRules.js',
    source: `dvCheckList[${code}]`,
  })];
}

function buildChecklistItem(code, applies, traces) {
  const groupId = getVuGroupIdForCode(code);
  const groupLabel = getVuGroupLabelForCode(code);

  return {
    code,
    label: JsonDocList[code] || null,
    applies,
    traces,
    groupId,
    groupLabel,
  };
}

export function evaluateDocumentRequirements(selection = {}) {
  const simulatedItem = buildSimulatedFunItem(selection);
  const checklistItems = [];
  const evaluatedChecklistItems = [];
  const applicableCodes = [];
  const groupedDocuments = {};
  const selectionSummary = normalizeSimulatorSelection(selection);
  const warnings = [];
  const ruleTracesByCode = {};

  for (const code of fatherValues) {
    if (dvCheckList[code]) {
      const traces = getRuleTraceForCode(code, selectionSummary);
      ruleTracesByCode[code] = traces;

      try {
        const applies = Boolean(dvCheckList[code](simulatedItem));
        const checklistItem = buildChecklistItem(code, applies, traces);
        evaluatedChecklistItems.push(checklistItem);

        if (applies) {
          applicableCodes.push(code);
          checklistItems.push(checklistItem);

          if (!JsonDocList[code]) {
            warnings.push(`Missing label for code: ${code}`);
          }

          const groupId = getVuGroupIdForCode(code);
          if (groupId) {
            if (!groupedDocuments[groupId]) {
              groupedDocuments[groupId] = [];
            }
            if (!groupedDocuments[groupId].includes(code)) {
              groupedDocuments[groupId].push(code);
            }
          }
        }
      } catch (err) {
        warnings.push(`Failed to evaluate code: ${code} — ${err?.message || err}`);
      }
    }
  }

  const orderedGroupedDocuments = {};
  const groupOrder = ['list_61', 'list_62', 'list_63', 'list_64', 'list_65', 'list_66', 'list_67', 'list_68', 'list_Z'];
  for (const groupKey of groupOrder) {
    if (groupedDocuments[groupKey]) {
      orderedGroupedDocuments[groupKey] = groupedDocuments[groupKey];
    }
  }

  return {
    checklistItems,
    evaluatedChecklistItems,
    applicableCodes,
    groupedDocuments: orderedGroupedDocuments,
    ruleTracesByCode,
    selectionSummary,
    warnings,
  };
}
