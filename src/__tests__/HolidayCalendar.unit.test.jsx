import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import '../app/utils/dayjs.config';
import { HolidayCalendar } from '../app/pages/user/clocks/components/HolidayCalendar';

describe('HolidayCalendar', () => {
  test('renderiza una grilla mensual finita y sigue respondiendo al cambiar de mes', () => {
    const { container } = render(<HolidayCalendar />);

    expect(screen.getByText('Días Hábiles')).toBeInTheDocument();

    const getDayCells = () => container.querySelectorAll('.day-cell');

    expect(getDayCells().length).toBeGreaterThanOrEqual(28);
    expect(getDayCells().length).toBeLessThanOrEqual(42);

    const nextMonthButton = container.querySelectorAll('.nav-btn-compact')[1];
    fireEvent.click(nextMonthButton);

    expect(getDayCells().length).toBeGreaterThanOrEqual(28);
    expect(getDayCells().length).toBeLessThanOrEqual(42);
  });
});