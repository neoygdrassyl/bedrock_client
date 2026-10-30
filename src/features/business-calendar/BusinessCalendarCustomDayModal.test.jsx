import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import BusinessCalendarCustomDayModal from './BusinessCalendarCustomDayModal';

const baseProps = {
  open: true,
  date: '2026-09-04',
  reason: '',
  pending: false,
  error: '',
  onClose: vi.fn(),
  onChooseCreate: vi.fn(),
  onReasonChange: vi.fn(),
  onSave: vi.fn(),
  onRevert: vi.fn(),
};

it('offers marking a normal day as non-business', async () => {
  const user = userEvent.setup();
  const onChooseCreate = vi.fn();
  render(<BusinessCalendarCustomDayModal {...baseProps} phase="select" onChooseCreate={onChooseCreate} />);

  await user.click(screen.getByRole('button', { name: 'Marcar como día no hábil' }));

  expect(onChooseCreate).toHaveBeenCalledOnce();
  expect(screen.getByRole('button', { name: 'Cerrar' })).toBeVisible();
});

it('requires a non-empty reason before saving', async () => {
  const user = userEvent.setup();
  const onReasonChange = vi.fn();
  render(<BusinessCalendarCustomDayModal {...baseProps} phase="create" onReasonChange={onReasonChange} />);

  expect(screen.getByLabelText('Motivo')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled();
  await user.type(screen.getByLabelText('Motivo'), 'Cierre institucional');
  expect(onReasonChange).toHaveBeenCalled();
});

it('offers direct reversion without a reason field', async () => {
  const user = userEvent.setup();
  const onRevert = vi.fn();
  render(<BusinessCalendarCustomDayModal {...baseProps} phase="revert" onRevert={onRevert} />);

  expect(screen.queryByLabelText('Motivo')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Marcar como día hábil' }));
  expect(onRevert).toHaveBeenCalledOnce();
});
