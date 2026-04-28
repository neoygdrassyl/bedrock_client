import React from 'react';
import { render, screen } from '@testing-library/react';

import '@/app/utils/dayjs.config';

vi.mock('@/components/icon', () => ({
  Icon: ({ name }) => <span data-testid={`icon-${name}`} aria-hidden="true" />,
  default: ({ name }) => <span data-testid={`icon-${name}`} aria-hidden="true" />,
}));

import { HolidayCalendar } from '../app/pages/user/clocks/components/HolidayCalendar';

describe('HolidayCalendar', () => {
  it('renderiza el grid mensual sin quedarse en un bucle de fechas', () => {
    const { container } = render(<HolidayCalendar />);

    expect(screen.getByText('Días Hábiles')).toBeInTheDocument();

    const dayCells = container.querySelectorAll('.day-cell');
    expect(dayCells.length).toBeGreaterThanOrEqual(28);
    expect(dayCells.length).toBeLessThanOrEqual(42);
  });
});