import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import FunChecklistWindowSwitcher from '../app/pages/user/fun_forms/components/FunChecklistWindowSwitcher';

function LegacyChecklistStub() {
  return <div data-testid="legacy-checklist">Lista clásica renderizada</div>;
}

function IntelligentChecklistStub() {
  return <div data-testid="intelligent-checklist">Lista inteligente renderizada</div>;
}

const baseProps = {
  translation: {},
  swaMsg: {},
  globals: {},
  currentItem: {
    id: 1,
    id_public: 'FUN-001',
    fun_1s: [],
    fun_rs: [],
    fun_6s: [],
  },
  currentVersion: 1,
  requestUpdate: vi.fn(),
  readOnly: true,
};

describe('FunChecklistWindowSwitcher', () => {
  it('renders the legacy checklist by default and keeps the intelligent checklist unmounted', () => {
    render(
      <FunChecklistWindowSwitcher
        {...baseProps}
        LegacyChecklistComponent={LegacyChecklistStub}
        IntelligentChecklistComponent={IntelligentChecklistStub}
      />,
    );

    expect(screen.getByRole('tab', { name: /versión anterior/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /versión nueva/i })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByTestId('legacy-checklist')).toBeInTheDocument();
    expect(screen.queryByTestId('intelligent-checklist')).not.toBeInTheDocument();
  });

  it('switches to the intelligent checklist only after selecting its tab', async () => {
    const user = userEvent.setup();

    render(
      <FunChecklistWindowSwitcher
        {...baseProps}
        LegacyChecklistComponent={LegacyChecklistStub}
        IntelligentChecklistComponent={IntelligentChecklistStub}
      />,
    );

    await user.click(screen.getByRole('tab', { name: /versión nueva/i }));

    expect(screen.getByRole('tab', { name: /versión anterior/i })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tab', { name: /versión nueva/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByTestId('legacy-checklist')).not.toBeInTheDocument();
    expect(screen.getByTestId('intelligent-checklist')).toBeInTheDocument();
  });

  it('renders the provided legacy checklist without fallback copy', () => {
    render(
      <FunChecklistWindowSwitcher
        {...baseProps}
        LegacyChecklistComponent={LegacyChecklistStub}
        IntelligentChecklistComponent={IntelligentChecklistStub}
      />,
    );

    const panel = screen.getByRole('tabpanel', { name: /versión anterior/i });
    expect(within(panel).getByTestId('legacy-checklist')).toBeInTheDocument();
    expect(within(panel).queryByText(/lista clásica.*no está disponible/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId('intelligent-checklist')).not.toBeInTheDocument();
  });
});
