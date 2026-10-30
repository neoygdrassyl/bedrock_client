const entry = (storageCode, descriptionCode = storageCode, displayCode = storageCode) => ({
  displayCode,
  storageCode,
  descriptionCode,
});

const COMMON_ENTRIES = [
  entry('511'), entry('512'), entry('513'), entry('516'), entry('517'), entry('518'), entry('519'),
];

const URBANIZATION_ENTRIES = Object.freeze({
  A: [entry('621'), entry('601a'), entry('622'), entry('602a')],
  B: [entry('623'), entry('601b'), entry('602b'), entry('624'), entry('625')],
  C: [entry('626'), entry('627'), entry('601c'), entry('602c')],
});

const PARCELATION_ENTRIES = [
  entry('631', '630'),
  entry('632', '631'),
  entry('633', '632'),
  entry('6023', '633', '602'),
  entry('634'), entry('635'), entry('636'),
];

const SUBDIVISION_ENTRIES = [entry('641'), entry('642'), entry('643')];
const RECOGNITION_ENTRIES = [entry('651'), entry('652'), entry('653')];

const CONSTRUCTION_ENTRIES = [
  entry('6601'), entry('6602'), entry('6603'), entry('6604'), entry('6605'),
  entry('660a'), entry('660b'), entry('660c'), entry('660d'), entry('660e'), entry('660f'),
  entry('6611', '6607'),
  entry('6612', '6608'),
  entry('6613', '6609'),
  entry('6614', '6610'),
  entry('6615', '6611'),
  entry('6616', '6612'),
  entry('6617', '6613'),
  entry('6618', '6614'),
];

const PUBLIC_SPACE_ENTRIES = [entry('671'), entry('672')];
const OTHER_ACTION_ENTRIES = [
  entry('681'), entry('682'), entry('683'), entry('684'), entry('685'),
  entry('6861', '686', '686'),
  entry('687'), entry('6862'), entry('688'), entry('689'),
];

const LEGACY_CONSTRUCTION_CODES = Object.freeze({
  6611: '6607',
  6612: '6608',
  6613: '6609',
  6614: '6610',
  6615: '6611',
  6616: '6612',
  6617: '6613',
  6618: '6614',
});
const CURRENT_CONSTRUCTION_CODES = Object.freeze(
  Object.fromEntries(Object.entries(LEGACY_CONSTRUCTION_CODES).map(([current, legacy]) => [legacy, current])),
);

function usesHistoricalConstructionCodes(codes) {
  return codes.some(code => ['6607', '6608', '6609', '6610'].includes(code))
    && !codes.some(code => ['6615', '6616', '6617', '6618'].includes(code));
}

export function normalizeLegacyReview(review) {
  if (!review?.code) return review;

  const codes = String(review.code).split(',').map(code => code.trim());
  const checked = String(review.checked || '').split(',').map(value => value.trim());
  const historicalConstruction = usesHistoricalConstructionCodes(codes);
  const hasCurrent686 = codes.includes('6861');
  const normalized = new Map();

  codes.forEach((code, index) => {
    let currentCode = historicalConstruction ? CURRENT_CONSTRUCTION_CODES[code] || code : code;
    if (code === '686' && !hasCurrent686) currentCode = '6861';
    if (!normalized.has(currentCode) || currentCode === code) {
      normalized.set(currentCode, checked[index] || '');
    }
  });

  return {
    ...review,
    code: [...normalized.keys()].join(','),
    checked: [...normalized.values()].join(','),
  };
}

export function findVersion(entries, currentVersion) {
  if (!Array.isArray(entries)) return null;
  return entries.find(item => Number(item?.version) === Number(currentVersion)) || null;
}

export function isLegacyChecklistSectionVisible(section, application) {
  const types = String(application?.tipo || '');
  if (section === '6.1') return Boolean(application);
  if (section === '6.2') return types.includes('A');
  if (section === '6.3') return types.includes('B');
  if (section === '6.4') return types.includes('C');
  if (section === '6.5') return types.includes('F');
  if (section === '6.6') return types.includes('D');
  if (section === '6.7') return types.includes('E');
  if (section === '6.8') return types.includes('G');
  return false;
}

export function isLegacyChecklistGroupVisible(group, application) {
  if (!isLegacyChecklistSectionVisible('6.2', application)) return false;
  return String(application?.m_urb || '').includes(group);
}

export function getVisibleLegalReviewEntries(item, currentVersion) {
  const application = findVersion(item?.fun_1s, currentVersion);
  if (!application) return [];

  const entries = [...COMMON_ENTRIES];
  if (isLegacyChecklistSectionVisible('6.2', application)) {
    for (const group of ['A', 'B', 'C']) {
      if (isLegacyChecklistGroupVisible(group, application)) entries.push(...URBANIZATION_ENTRIES[group]);
    }
  }
  if (isLegacyChecklistSectionVisible('6.3', application)) entries.push(...PARCELATION_ENTRIES);
  if (isLegacyChecklistSectionVisible('6.4', application)) entries.push(...SUBDIVISION_ENTRIES);
  if (isLegacyChecklistSectionVisible('6.5', application)) entries.push(...RECOGNITION_ENTRIES);
  if (isLegacyChecklistSectionVisible('6.6', application)) entries.push(...CONSTRUCTION_ENTRIES);
  if (isLegacyChecklistSectionVisible('6.7', application)) entries.push(...PUBLIC_SPACE_ENTRIES);
  if (isLegacyChecklistSectionVisible('6.8', application)) entries.push(...OTHER_ACTION_ENTRIES);
  return entries;
}

export function evaluateLegalReviewEligibility(item, currentVersion) {
  const review = normalizeLegacyReview(findVersion(item?.fun_rs, currentVersion));
  if (!review) return { allowed: false, blockers: [] };

  const storedCodes = String(review.code || '').split(',').map(code => code.trim());
  const storedEvaluations = String(review.checked || '').split(',').map(value => value.trim());
  const evaluations = new Map(storedCodes.map((code, index) => [code, storedEvaluations[index] || '']));
  const entries = getVisibleLegalReviewEntries(item, currentVersion);
  const blockers = entries.filter(({ storageCode }) => {
    const evaluation = evaluations.get(storageCode);
    return evaluation !== '1' && evaluation !== '2';
  });

  return {
    allowed: entries.length > 0 && blockers.length === 0,
    blockers,
  };
}

export function resolveLegalReviewCondition(requestedCondition, eligibility) {
  return eligibility?.allowed ? requestedCondition : '0';
}
