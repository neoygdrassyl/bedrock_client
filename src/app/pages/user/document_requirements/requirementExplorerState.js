const STATE_LABELS = Object.freeze({
  'always-required': 'Siempre requerido',
  'conditional-required': 'Por condición',
  'not-applicable': 'No aplica con estos datos',
  'non-determinable': 'Regla no determinable',
  'not-simulated': 'Pendiente de simulación',
});

function uniqueRuleKeys(ruleKeys = []) {
  const seen = new Set();
  const uniqueKeys = [];

  ruleKeys.forEach((ruleKey) => {
    if (typeof ruleKey !== 'string' || !ruleKey || seen.has(ruleKey)) return;
    seen.add(ruleKey);
    uniqueKeys.push(ruleKey);
  });

  return uniqueKeys;
}

function buildPreviewMap(previewRequirements = []) {
  const previewMap = new Map();

  previewRequirements.forEach((requirement) => {
    const documentCode = requirement?.documentCode;
    if (typeof documentCode !== 'string' || !documentCode) return;

    const current = previewMap.get(documentCode) || {
      matchedCount: 0,
      matchedRuleKeys: [],
    };

    if (requirement?.matched !== false) {
      current.matchedCount += 1;
      current.matchedRuleKeys = uniqueRuleKeys([
        ...current.matchedRuleKeys,
        requirement?.ruleKey,
      ]);
    }

    previewMap.set(documentCode, current);
  });

  return previewMap;
}

function buildNonDeterminableRuleKeySet(rules = [], warnings = []) {
  const ruleKeys = [
    ...rules
      .filter((rule) => rule?.determinable === false)
      .map((rule) => rule?.ruleKey),
    ...warnings.map((warning) => warning?.ruleKey),
  ].filter((ruleKey) => typeof ruleKey === 'string' && ruleKey);

  return new Set(ruleKeys);
}

function getVisualState({ hasPreview, hasWarning, hasMatchedRequirement, matchedRuleKeys, rulesByKey }) {
  if (!hasPreview) return 'not-simulated';
  if (hasWarning) return 'non-determinable';
  if (!hasMatchedRequirement) return 'not-applicable';

  const hasAlwaysRequiredRule = matchedRuleKeys.some((ruleKey) => {
    const rule = rulesByKey.get(ruleKey);
    return Boolean(rule) && rule.required !== false && rule.hasConditions !== true;
  });

  return hasAlwaysRequiredRule ? 'always-required' : 'conditional-required';
}

export function buildRequirementExplorerState({
  explorer,
  preview,
  selection,
  selectedDocumentCode,
}) {
  const documents = explorer?.documents || [];
  const rules = explorer?.rules || [];
  const warnings = explorer?.warnings || [];
  const hasPreview = Boolean(preview);
  const hasScenario = Boolean(selection) && Object.keys(selection).length > 0;

  const rulesByKey = new Map(
    rules
      .filter((rule) => typeof rule?.ruleKey === 'string' && rule.ruleKey)
      .map((rule) => [rule.ruleKey, rule]),
  );

  const warningRuleKeys = buildNonDeterminableRuleKeySet(rules, warnings);

  const previewByDocument = buildPreviewMap(preview?.requirements || []);

  const computedDocuments = documents.map((document) => {
    const activatingRuleKeys = uniqueRuleKeys(document?.activatingRules || []);
    const documentPreview = previewByDocument.get(document?.documentCode) || {
      matchedCount: 0,
      matchedRuleKeys: [],
    };
    const documentWarningRuleKeys = activatingRuleKeys.filter((ruleKey) => warningRuleKeys.has(ruleKey));
    const visualState = getVisualState({
      hasPreview,
      hasWarning: documentWarningRuleKeys.length > 0,
      hasMatchedRequirement: documentPreview.matchedCount > 0,
      matchedRuleKeys: documentPreview.matchedRuleKeys,
      rulesByKey,
    });

    return {
      ...document,
      activatingRuleKeys,
      matchedRuleKeys: documentPreview.matchedRuleKeys,
      warningRuleKeys: documentWarningRuleKeys,
      visualState,
      stateLabel: STATE_LABELS[visualState],
    };
  });

  const selectedDocument = computedDocuments.find(
    (document) => document.documentCode === selectedDocumentCode,
  ) || null;

  return {
    stepState: {
      hasScenario,
      hasPreview,
      hasSelectedDocument: Boolean(selectedDocument),
    },
    selectedDocument,
    selectedDocumentStillVisible: Boolean(selectedDocument),
    documents: computedDocuments,
  };
}

export { STATE_LABELS };
