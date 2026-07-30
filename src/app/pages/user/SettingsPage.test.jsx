import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../services/data.service.js', () => ({ default: { getUserData: () => ({}) } }));
vi.mock('./AlarmsV2ConfigPanel.jsx', () => ({ default: () => <div /> }));
vi.mock('./legal_config/DocumentCatalogWorkspacePage.jsx', () => ({
  default: ({ activeSection }) => (
    <div data-testid="document-catalog-workspace" data-active-section={activeSection} />
  ),
  normalizeDocumentCatalogSection: (section) => (
    ['documentos', 'actuaciones', 'evaluacion-documentos'].includes(section) ? section : 'documentos'
  ),
}));
vi.mock('./ErrorReportsPanel.jsx', () => ({ default: () => <div /> }));
import SettingsPage from './SettingsPage.jsx';

describe('SettingsPage navigation', () => {
  it('keeps the configuration navigation compact and without repeated descriptions', () => {
    render(<MemoryRouter><SettingsPage /></MemoryRouter>);
    expect(screen.getByRole('button', { name: 'Catálogo documental' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Actuaciones y documentos' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Revisión de documentos' })).not.toBeInTheDocument();
    expect(screen.queryByText('Configura catálogos, asociaciones y documentos')).not.toBeInTheDocument();
    expect(screen.queryByText('Umbrales por fase, actor y nivel')).not.toBeInTheDocument();
    expect(screen.queryByText('Ajustes globales de la curaduría.')).not.toBeInTheDocument();
    expect(screen.queryByText('Actuaciones y textos')).not.toBeInTheDocument();
  });

  it('uses ordinary navigation buttons instead of incomplete tab semantics', () => {
    render(<MemoryRouter><SettingsPage /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /Alarmas/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  it('maps the legacy document-review link to the consolidated catalog section', () => {
    render(<MemoryRouter initialEntries={['/?tab=revision-documentos']}><SettingsPage /></MemoryRouter>);
    expect(screen.getByRole('button', { name: 'Catálogo documental' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByTestId('document-catalog-workspace')).toHaveAttribute('data-active-section', 'evaluacion-documentos');
  });
});
