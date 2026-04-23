export function getExpeditionPaymentVisibility({ globalId, isOtherActuation, strata }) {
  const normalizedGlobalId = globalId || '';
  const numericStrata = Number(strata);

  const isCb1 = normalizedGlobalId === 'cb1';
  const isCp1 = normalizedGlobalId === 'cp1';
  const isFl2 = normalizedGlobalId === 'fl2';

  const showVariableFees = isCp1 || isFl2 || (isCb1 && !isOtherActuation);
  const showTaxPayment = isCp1 || isFl2 || (isCb1 && !isOtherActuation);
  const showUrbanDuties = isCb1 && Number.isFinite(numericStrata) && numericStrata > 2;

  return {
    showVariableFees,
    showTaxPayment,
    showUrbanDuties,
  };
}

export function getDesistActState(model, persistedState) {
  if (persistedState) return persistedState;

  const stateByModel = {
    delete: 'DESISTIDA',
    return: 'DEVOLUCION',
    transfer: 'TRASLADO',
  };

  return stateByModel[model] || 'DESISTIDA';
}