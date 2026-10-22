import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../shared/api/data.service.js', () => ({ default: { getUserData: () => ({}) } }));
vi.mock('./document_requirements/CentralConfigurationPanel.jsx', () => ({
  default: () => <div data-testid="central-configuration-panel" />,
}));
vi.mock('./ErrorReportsPanel.jsx', () => ({ default: () => <div /> }));
import SettingsPage from './SettingsPage.jsx';

describe('SettingsPage navigation', () => {
  it('keeps the configuration navigation compact and without repeated descriptions', () => {
    render(<MemoryRouter><SettingsPage /></MemoryRouter>);
    expect(screen.getByRole('button', { name: 'Configuración documental' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Catálogo documental' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Actuaciones y documentos' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Revisión de documentos' })).not.toBeInTheDocument();
    expect(screen.queryByText('Configura catálogos, asociaciones y documentos')).not.toBeInTheDocument();
    expect(screen.queryByText('Umbrales por fase, actor y nivel')).not.toBeInTheDocument();
    expect(screen.queryByText('Ajustes globales de la curaduría.')).not.toBeInTheDocument();
    expect(screen.queryByText('Actuaciones y textos')).not.toBeInTheDocument();
  });

  it('uses ordinary navigation buttons instead of incomplete tab semantics', () => {
    render(<MemoryRouter><SettingsPage /></MemoryRouter>);
    expect(screen.getByRole('button', { name: 'Configuración documental' })).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  it.each([
    'revision-documentos',
    'requisitos-documentales',
    'catalogo-documental',
    'alarmas',
  ])('maps the retired %s link to the document configuration view', (tab) => {
    render(<MemoryRouter initialEntries={[`/?tab=${tab}`]}><SettingsPage /></MemoryRouter>);
    expect(screen.getByRole('button', { name: 'Configuración documental' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByTestId('central-configuration-panel')).toBeInTheDocument();
  });
});
