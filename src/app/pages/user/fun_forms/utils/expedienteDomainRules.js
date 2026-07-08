const SUBDIVISION_TIPO_CODE = 'C';
const NO_STRUCTURAL_RULE_INDEX = 1;
const ENABLED_RULE_VALUE = '1';
const DISABLED_RULE_VALUE = '0';

function isEmptyValue(value) {
  return value === undefined || value === null || value === '' || value === false;
}

function normalizeCodeList(value, { splitLetters = false } = {}) {
  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeCodeList(item, { splitLetters }));
  }

  if (isEmptyValue(value)) return [];

  const text = String(value).trim();
  if (!text) return [];

  if (/[;,|]/.test(text)) {
    return text
      .split(/[;,|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (splitLetters && /^[A-Za-z]+$/.test(text) && text.length > 1) {
    return text.split('').filter(Boolean);
  }

  return [text];
}

function normalizeRules(rules) {
  if (Array.isArray(rules)) {
    return rules.map((rule) => String(rule ?? DISABLED_RULE_VALUE).trim() || DISABLED_RULE_VALUE);
  }

  if (isEmptyValue(rules)) return [];

  return String(rules)
    .split(';')
    .map((rule) => String(rule ?? DISABLED_RULE_VALUE).trim() || DISABLED_RULE_VALUE);
}

function readField(source, keys) {
  if (!source || typeof source !== 'object') return undefined;
  for (const key of keys) {
    if (!isEmptyValue(source[key])) return source[key];
  }
  return undefined;
}

export function getVersionFun1(expediente, version) {
  if (!expediente || typeof expediente !== 'object') return null;

  if (Array.isArray(expediente.fun_1s) && expediente.fun_1s.length) {
    if (version !== undefined && version !== null && version !== '') {
      const byVersion = expediente.fun_1s.find((fun1) => String(fun1?.version) === String(version));
      if (byVersion) return byVersion;

      const byIndex = expediente.fun_1s[Number(version) - 1];
      if (byIndex) return byIndex;
    }

    return expediente.fun_1s[0];
  }

  if (expediente.fun_1 && typeof expediente.fun_1 === 'object') return expediente.fun_1;
  if (expediente.fun1 && typeof expediente.fun1 === 'object') return expediente.fun1;

  return null;
}

export function getActuacionTipoValue(expediente, version) {
  const fun1 = getVersionFun1(expediente, version);

  return readField(fun1, ['tipo', 'item_1'])
    ?? readField(expediente, ['tipo', 'item_1', 'fun_1s.tipo', 'fun_1.tipo', 'fun1.tipo']);
}

export function getActuacionTramiteValue(expediente, version) {
  const fun1 = getVersionFun1(expediente, version);

  return readField(fun1, ['tramite', 'item_2'])
    ?? readField(expediente, ['tramite', 'item_2', 'fun_1s.tramite', 'fun_1.tramite', 'fun1.tramite']);
}

export function isSubdivisionExpediente(expediente, version) {
  const tipo = getActuacionTipoValue(expediente, version);
  return normalizeCodeList(tipo, { splitLetters: true })
    .map((code) => code.toUpperCase())
    .includes(SUBDIVISION_TIPO_CODE);
}

export function hasNoStructuralRule(expedienteOrRules) {
  const rules = typeof expedienteOrRules === 'object' && expedienteOrRules !== null
    ? normalizeRules(expedienteOrRules.rules)
    : normalizeRules(expedienteOrRules);

  return String(rules[NO_STRUCTURAL_RULE_INDEX] ?? DISABLED_RULE_VALUE) === ENABLED_RULE_VALUE;
}

export function shouldUseStructuralReport(expediente, version, options = {}) {
  if (options.isPropertyHorizontal) return false;
  if (hasNoStructuralRule(expediente)) return false;
  if (isSubdivisionExpediente(expediente, version)) return false;
  return true;
}

export function getRulesWithSubdivisionNoStructural(currentRules, expedienteOrActuacion, version) {
  if (!isSubdivisionExpediente(expedienteOrActuacion, version)) {
    return typeof currentRules === 'string'
      ? currentRules
      : normalizeRules(currentRules).join(';');
  }

  const rules = normalizeRules(currentRules);
  while (rules.length <= NO_STRUCTURAL_RULE_INDEX) {
    rules.push(DISABLED_RULE_VALUE);
  }

  rules[NO_STRUCTURAL_RULE_INDEX] = ENABLED_RULE_VALUE;
  return rules.join(';');
}

export function getApplicableReportSections(expediente, version, options = {}) {
  if (options.isPropertyHorizontal) return ['ph'];

  return [
    'juridico',
    'arquitectonico',
    ...(shouldUseStructuralReport(expediente, version, options) ? ['estructural'] : []),
  ];
}
