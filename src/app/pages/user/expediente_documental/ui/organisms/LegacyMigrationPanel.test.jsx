import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LegacyMigrationPanel } from './LegacyMigrationPanel';
import { useLegacyMigration } from '../../hooks/useLegacyMigration';

vi.mock('../../hooks/useLegacyMigration', () => ({ useLegacyMigration: vi.fn() }));

const preview = {
  release: { releaseVersion: 5, isCurrent: true, configurationId: 5, checksum: 'c' },
  releaseOptions: [{ configurationId: 5, releaseVersion: 5, isCurrent: true }],
  stats: { vrs: 14, pqrsVrs: 1, deliveries: 44, documents: 35, versionedDocuments: 6, files: { imported: 31, found: 0, missing: 31 }, issues: { blocking: 1, warning: 2 }, checklist: null },
  issues: [
    { code: 'DIGITAL_WITHOUT_VR', severity: 'blocking' },
    { code: 'UNKNOWN_CODE', severity: 'warning' }, { code: 'UNKNOWN_CODE', severity: 'warning' },
  ],
  vrs: [{ submitId: 9, vrLabel: 'VR-1', date: '2026-01-02' }],
  files: [{ id: 7, assignable: true, table: 'fun_6s', description: 'Planos estructurales.pdf', originalName: 'p.pdf', code: 'A-12', createdAt: '2026-03-04T10:00:00Z', status: 'unassigned' }],
  deliveries: [],
};

beforeEach(() => {
  vi.mocked(useLegacyMigration).mockReturnValue({ preview, loading: false, committing: false, choices: {}, choose: vi.fn(), chooseRelease: vi.fn(), analyze: vi.fn(), commit: vi.fn(), resolutionsChanged: false, configurationId: null, error: '' });
});

describe('LegacyMigrationPanel', () => {
  it('summarises what will be migrated without PQRS hints', () => {
    render(<LegacyMigrationPanel fun0Id={1} />);
    expect(screen.getByText('VR a migrar').parentElement).toHaveTextContent('14');
    expect(screen.queryByText(/PQRS/)).not.toBeInTheDocument();
    expect(screen.queryByText('Incidencias')).not.toBeInTheDocument();
  });

  it('renders issues as count tags with a short what-to-do sentence', () => {
    render(<LegacyMigrationPanel fun0Id={1} />);
    const warning = screen.getByText('Código fuera del catálogo: el documento se importa como anexo.').closest('.d-tag');
    expect(warning).toHaveClass('d-tag--warning');
    expect(within(warning).getByText('2')).toBeInTheDocument();
  });

  it('shows pending digital files in one dense row with a code tag and a compact date', () => {
    render(<LegacyMigrationPanel fun0Id={1} />);
    const row = screen.getByText('Planos estructurales.pdf').closest('tr');
    expect(within(row).getByText('A-12')).toHaveClass('d-tag--code');
    expect(within(row).getByText('04/03/26')).toBeInTheDocument();
    expect(within(row).getByLabelText('Decisión para el archivo 7')).toBeInTheDocument();
  });
});
