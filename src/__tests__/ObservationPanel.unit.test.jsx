import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import ObservationPanel from '@/app/components/ObservationPanel';

describe('ObservationPanel', () => {
  test('opens a textarea panel by default when it has content and toggles it from the header', async () => {
    render(
      <ObservationPanel
        title="OBSERVACIONES TOTALES"
        textareaProps={{
          name: 's_flaw_values',
          rows: '8',
          maxLength: '10100',
          readOnly: true,
          value: 'Texto agregado',
        }}
      />
    );

    const trigger = screen.getByRole('button', { name: /OBSERVACIONES TOTALES/i });
    expect(trigger).toHaveAttribute('type', 'button');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('name', 's_flaw_values');
    expect(textarea).toHaveAccessibleName(/OBSERVACIONES TOTALES/);
    expect(textarea).toHaveAttribute('readonly');
    expect(textarea).toHaveValue('Texto agregado');
    expect(textarea.closest('.op__content')).toHaveClass('op__content--open');

    await userEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(textarea.closest('.op__content')).not.toHaveClass('op__content--open');
  });

  test('keeps empty textarea panels collapsed by default', () => {
    render(
      <ObservationPanel
        title="OBSERVACIONES VACIAS"
        textareaProps={{
          name: 'empty_observations',
          rows: '4',
          defaultValue: '   ',
        }}
      />
    );

    const trigger = screen.getByRole('button', { name: /OBSERVACIONES VACIAS/i });
    const textarea = screen.getByRole('textbox', { hidden: true });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(textarea.closest('.op__content')).not.toHaveClass('op__content--open');
  });

  test('respects explicit defaultOpen false even when textarea has content', () => {
    render(
      <ObservationPanel
        title="OBSERVACIONES CONTROLADAS"
        defaultOpen={false}
        textareaProps={{
          name: 'controlled_observations',
          rows: '4',
          readOnly: true,
          value: 'Texto existente',
        }}
      />
    );

    const trigger = screen.getByRole('button', { name: /OBSERVACIONES CONTROLADAS/i });
    const textarea = screen.getByRole('textbox', { hidden: true });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(textarea).toHaveValue('Texto existente');
  });

  test('expands textarea and panel height when user types more content', () => {
    const onInput = vi.fn();

    render(
      <ObservationPanel
        title="OBSERVACIONES DINAMICAS"
        defaultOpen
        textareaProps={{
          name: 'dynamic_observations',
          rows: '2',
          defaultValue: 'Texto inicial',
          onInput,
        }}
      />
    );

    const textarea = screen.getByRole('textbox');
    const content = textarea.closest('.op__content');

    Object.defineProperty(textarea, 'scrollHeight', { configurable: true, value: 180 });
    Object.defineProperty(content, 'scrollHeight', { configurable: true, value: 220 });

    fireEvent.input(textarea, {
      target: { value: 'Texto inicial\nlinea 2\nlinea 3\nlinea 4\nlinea 5\nlinea 6' },
    });

    expect(onInput).toHaveBeenCalledTimes(1);
    expect(textarea.style.height).toBe('180px');
    expect(content.style.maxHeight).toBe('220px');
  });

  test('preserves editable textarea attributes and helper text', () => {
    const onBlur = vi.fn();

    render(
      <ObservationPanel
        title="OBSERVACIONES INVENTARIO"
        defaultOpen
        helperText="(máximo 4000 caracteres)"
        textareaProps={{
          className: 'input-group',
          maxLength: '4096',
          name: 's_1_values',
          rows: '4',
          defaultValue: 'Detalle editable',
          onBlur,
        }}
      />
    );

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('name', 's_1_values');
    expect(textarea).toHaveAttribute('maxlength', '4096');
    expect(textarea).toHaveAttribute('rows', '4');
    expect(textarea).toHaveClass('op__textarea');
    expect(textarea).not.toHaveAttribute('readonly');
    expect(textarea).toHaveValue('Detalle editable');
    expect(screen.getByText('(máximo 4000 caracteres)')).toBeInTheDocument();
  });

  test('uses the full available page width without a fixed max width', () => {
    const css = readFileSync('src/app/components/ObservationPanel.css', 'utf8');

    expect(css).toMatch(/\.op__panel\s*{[^}]*width:\s*100%;/s);
    expect(css).not.toContain('width: min(100%, 720px);');
  });
});
