import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import RequirementPreviewPanel from './RequirementPreviewPanel.jsx';

const readyPreview = {
  configVersion: 8,
  sourceLabel: 'Publicada',
  requiredDocuments: [
    { code: '6601', label: 'Documento técnico backend', groupKey: 'construccion', groupLabel: 'Construcción' },
    { code: '6602', label: 'Plano arquitectónico', groupKey: 'construccion', groupLabel: 'Construcción' },
  ],
  matchedRules: [
    { key: 'rule-construction', conditionSummary: 'tipoAny=D', documentCodes: ['6601', '6602'] },
  ],
};

describe('RequirementPreviewPanel', () => {
  it('muestra exactamente el estado de información incompleta', () => {
    render(
      <RequirementPreviewPanel
        state={{
          status: 'insufficient',
          message: 'Información incompleta para resolver requisitos',
          preview: { requiredDocuments: [], matchedRules: [] },
        }}
      />
    );

    expect(screen.getByText('Información incompleta para resolver requisitos')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Información incompleta para resolver requisitos');
  });

  it('muestra fuente publicada, conteo y contexto conciso de reglas', () => {
    render(
      <RequirementPreviewPanel
        state={{
          status: 'ready',
          message: '',
          preview: readyPreview,
        }}
      />
    );

    expect(screen.getByText('Publicada')).toBeInTheDocument();
    expect(screen.getByText('2 requisitos')).toBeInTheDocument();
    expect(screen.getByText('Documento técnico backend')).toBeInTheDocument();
    expect(screen.getByText('Plano arquitectónico')).toBeInTheDocument();
    expect(screen.getByText(/rule-construction/i)).toBeInTheDocument();
    expect(screen.getByText(/tipoAny=D/i)).toBeInTheDocument();
  });

  it('muestra advertencia de endpoint sin bloquear edición ni guardado', () => {
    render(
      <RequirementPreviewPanel
        state={{
          status: 'warning',
          message: 'Fallo interno del preview documental.',
          preview: { requiredDocuments: [], matchedRules: [] },
        }}
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent('Fallo interno del preview documental.');
    expect(screen.getByText(/Puedes seguir editando y guardar la actuación/i)).toBeInTheDocument();
  });
});
