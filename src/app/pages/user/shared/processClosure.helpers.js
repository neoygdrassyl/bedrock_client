const EMPTY_VALUE = '—';

const COMPLETION_CLOCKS = [
  { state: 99, label: 'Ejecutoria - Licencia' },
  { state: 98, label: 'Entrega de Licencia' },
];

const PAYMENT_FIELDS = [
  { key: 'fixed', label: 'Expensas fijas', fields: ['clock_payment'] },
  { key: 'variable', label: 'Expensas variables', fields: ['clock_pay_62'] },
  { key: 'municipal', label: 'Impuestos municipales', fields: ['clock_pay_63'] },
  { key: 'uis', label: 'Estampilla PRO-UIS', fields: ['clock_pay_64', 'clock_payment_uis'] },
  { key: 'duties', label: 'Deberes urbanísticos', fields: ['clock_pay_65'] },
  { key: 'last', label: 'Último pago radicado', fields: ['clock_pay_69', 'clock_payment_2'] },
];

function firstValue(row, fields) {
  return fields.map(field => row?.[field]).find(value => value != null && value !== '') ?? null;
}

export function getLicenseCompletionClock(item) {
  const clocks = item?.fun_clocks || [];
  const match = COMPLETION_CLOCKS
    .map(definition => ({ ...definition, clock: clocks.find(clock => Number(clock?.state) === definition.state) }))
    .find(definition => definition.clock?.date_start);

  return {
    state: match?.state ?? null,
    dateStart: match?.clock?.date_start ?? null,
    label: match?.label ?? null,
    clock: match?.clock ?? null,
  };
}

export function getPaymentDateRows(row) {
  return PAYMENT_FIELDS.map(payment => ({
    key: payment.key,
    label: payment.label,
    value: firstValue(row, payment.fields) ?? EMPTY_VALUE,
  }));
}

export function getPrimaryPaymentDate(row) {
  return firstValue(row, ['clock_pay_69', 'clock_payment_2', 'clock_payment']);
}
