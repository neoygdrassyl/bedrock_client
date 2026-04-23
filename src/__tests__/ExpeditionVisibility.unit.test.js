import { describe, expect, it } from 'vitest';

import { getExpeditionPaymentVisibility } from '../app/pages/user/expeditions/expeditionVisibility';

describe('getExpeditionPaymentVisibility', () => {
  it('muestra los pagos base para cb1 cuando no es OA y el estrato habilita deberes urbanisticos', () => {
    expect(
      getExpeditionPaymentVisibility({
        globalId: 'cb1',
        isOtherActuation: false,
        strata: 4,
      })
    ).toEqual({
      showVariableFees: true,
      showTaxPayment: true,
      showUrbanDuties: true,
    });
  });

  it('oculta expensas variables e impuestos en cb1 para OA, pero conserva deberes urbanisticos si aplica el estrato', () => {
    expect(
      getExpeditionPaymentVisibility({
        globalId: 'cb1',
        isOtherActuation: true,
        strata: 5,
      })
    ).toEqual({
      showVariableFees: false,
      showTaxPayment: false,
      showUrbanDuties: true,
    });
  });

  it('muestra liquidacion e impuesto delineacion en fl2 aunque sea OA', () => {
    expect(
      getExpeditionPaymentVisibility({
        globalId: 'fl2',
        isOtherActuation: true,
        strata: 2,
      })
    ).toEqual({
      showVariableFees: true,
      showTaxPayment: true,
      showUrbanDuties: false,
    });
  });

  it('muestra liquidacion e impuesto delineacion en cp1 y no deberes urbanisticos', () => {
    expect(
      getExpeditionPaymentVisibility({
        globalId: 'cp1',
        isOtherActuation: true,
        strata: 6,
      })
    ).toEqual({
      showVariableFees: true,
      showTaxPayment: true,
      showUrbanDuties: false,
    });
  });
});