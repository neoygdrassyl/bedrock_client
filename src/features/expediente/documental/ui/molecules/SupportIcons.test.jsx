import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SupportIcons } from './SupportIcons';
import { supportIconTexts } from './DocumentReceiptStatus';

const support = (physical, digital, scan, pages = null) => ({ mediumPresence: { physical, digital }, scanned: { applies: physical, value: scan }, pagesPhysical: pages });

describe('SupportIcons', () => {
  it('describes each support: physical with folios and location, digital, and the scan of the physical copy', () => {
    expect(supportIconTexts(support(true, true, true, 4), 'Caja demo 1')).toEqual({ physical: 'Físico · 4 folios · Caja demo 1', digital: 'Digital recibido', scan: 'Escaneado del físico' });
    expect(supportIconTexts(support(true, false, false, 1))).toMatchObject({ physical: 'Físico · 1 folio', digital: 'Sin soporte digital', scan: 'Escaneo del físico pendiente' });
    expect(supportIconTexts(support(false, true, false))).toMatchObject({ physical: 'Sin soporte físico', scan: 'Escaneado: no aplica (sin soporte físico)' });
  });

  it('renders three focusable icons with accessible names and a tooltip on focus', async () => {
    render(<SupportIcons support={support(true, false, true, 4)} location="Caja demo 1" />);
    const physical = screen.getByRole('img', { name: 'Físico · 4 folios · Caja demo 1' });
    expect(physical).toHaveAttribute('tabindex', '0');
    expect(physical).toHaveAttribute('data-state-support', 'present');
    expect(screen.getByRole('img', { name: 'Sin soporte digital' })).toHaveAttribute('data-state-support', 'absent');
    expect(screen.getByRole('img', { name: 'Escaneado del físico' })).toHaveAttribute('data-state-support', 'done');
    fireEvent.focus(physical);
    expect((await screen.findAllByText('Físico · 4 folios · Caja demo 1')).length).toBeGreaterThan(0);
  });
});
