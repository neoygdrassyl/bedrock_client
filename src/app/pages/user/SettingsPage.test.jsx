import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../services/data.service.js', () => ({ default: { getUserData: () => ({}) } }));
vi.mock('./AlarmsV2ConfigPanel.jsx', () => ({ default: () => <div /> }));
vi.mock('./document_requirements/DocumentRequirementsConfigPanel.jsx', () => ({ default: () => <div /> }));
vi.mock('./document_requirements/DocumentRequirementsExplorerPage.jsx', () => ({ default: () => <div /> }));
vi.mock('./legal_config/LegalConfigInitialPage.jsx', () => ({ default: () => <div /> }));
vi.mock('./legal_config/DocumentReviewChecksPage.jsx', () => ({ default: () => <div data-testid="document-review-page" /> }));
vi.mock('./ErrorReportsPanel.jsx', () => ({ default: () => <div /> }));
import SettingsPage from './SettingsPage.jsx';

describe('SettingsPage navigation', () => {
  it('keeps the configuration navigation compact and without repeated descriptions', () => {
    render(<MemoryRouter><SettingsPage /></MemoryRouter>);
    expect(screen.getByText('Catálogo documental')).toBeInTheDocument();
    expect(screen.getByText('Configuración documental')).toBeInTheDocument();
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

  it('opens document checks as an independent settings view', () => {
    render(<MemoryRouter initialEntries={['/?tab=revision-documentos']}><SettingsPage /></MemoryRouter>);
    expect(screen.getByRole('button', { name: 'Catálogo documental' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByTestId('document-review-page')).toBeInTheDocument();
  });
});
