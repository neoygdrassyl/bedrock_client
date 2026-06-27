export function normalizeDictionarySearchValue(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function isPlaceholderPqrsId(id) {
  return normalizeDictionarySearchValue(id) === '1';
}

export function getCubProcessLabel(item) {
  return item?.res || '—';
}

export function getCubRelationValue(item) {
  if (!item) {
    return '';
  }

  return isPlaceholderPqrsId(item.id) ? item.vr || '' : item.id || '';
}

export function isPqrsDictionaryItem(item) {
  if (!item) {
    return false;
  }

  return (
    isPlaceholderPqrsId(item.id)
    || normalizeDictionarySearchValue(getCubProcessLabel(item)).includes('pqrs')
  );
}

export function matchesCubDictionaryFilter(item, filter, process = '') {
  const normalizedFilter = normalizeDictionarySearchValue(filter);

  if (!normalizedFilter) {
    return true;
  }

  const selectedProcess = normalizeDictionarySearchValue(process);

  if (selectedProcess === 'pqrs') {
    if (!isPqrsDictionaryItem(item)) {
      return false;
    }

    return [
      getCubRelationValue(item),
      item?.vr,
      item?.id,
      getCubProcessLabel(item),
    ].some((value) => normalizeDictionarySearchValue(value).includes(normalizedFilter));
  }

  if (selectedProcess === 'id') {
    if (isPlaceholderPqrsId(item?.id)) {
      return false;
    }

    return normalizeDictionarySearchValue(item?.id).includes(normalizedFilter);
  }

  if (selectedProcess === 'vr') {
    return normalizeDictionarySearchValue(item?.vr).includes(normalizedFilter);
  }

  return normalizeDictionarySearchValue(item?.cub).includes(normalizedFilter);
}

export function filterCubDictionary(list = [], filter = '', process = '') {
  return list.filter((item) => matchesCubDictionaryFilter(item, filter, process));
}

export function mapCubDictionaryItem(item) {
  return {
    ...item,
    relationValue: getCubRelationValue(item),
    processLabel: getCubProcessLabel(item),
    isPqrsLike: isPqrsDictionaryItem(item),
  };
}

export function normalizeCubDictionaryPayload(payload) {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.map(mapCubDictionaryItem);
}
