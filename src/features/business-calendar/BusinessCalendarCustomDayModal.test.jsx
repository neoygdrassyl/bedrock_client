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
  // The footer action and the dialog's own close control both read "Cerrar"; each closes the modal.
  const onClose = baseProps.onClose;
  onClose.mockClear();
  const closeButtons = screen.getAllByRole('button', { name: 'Cerrar' });
  expect(closeButtons.length).toBeGreaterThanOrEqual(1);
  for (const button of closeButtons) {
    expect(button).toBeVisible();
    await user.click(button);
  }
  expect(onClose).toHaveBeenCalledTimes(closeButtons.length);
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
