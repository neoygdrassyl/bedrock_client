import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DocumentaryOriginStatus, OriginCaption, OriginNotices } from './DocumentaryOriginStatus';

const traditional = (warnings = []) => ({ mode: 'traditional', project: { fun0Id: 1, idPublic: 'FUN-1' }, publication: null, warnings });

describe('DocumentaryOriginStatus', () => {
  it('shows a non-blocking notice for a portal radication pending Central activation', () => {
    render(<DocumentaryOriginStatus origin={traditional([{ code: 'CENTRAL_ACTIVATION_PENDING', message: 'x', releaseId: 'release-a', releaseVersion: 3 }])} refresh={vi.fn()} />);

    expect(screen.getByText('Documentación tradicional del expediente')).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent('versión 3 (release-a), pendiente de activación');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows no notice for an ordinary traditional project', () => {
    render(<DocumentaryOriginStatus origin={traditional()} refresh={vi.fn()} />);

    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });
});

describe('OriginCaption and OriginNotices', () => {
  it('renders a compact chip with the catalogue version and keeps the full sentence in its title', () => {
    render(<OriginCaption origin={{ mode: 'canonical', project: { idPublic: 'FUN-9' }, publication: { releaseVersion: 4 } }} />);
    expect(screen.queryByText('FUN-9')).not.toBeInTheDocument();
    expect(screen.getByText('Catálogo v4').closest('p')).toHaveAttribute('title', 'Documentación según el catálogo documental (versión 4)');
  });

  it('uses the short traditional label and keeps load and error states out of the caption', () => {
    const { rerender } = render(<OriginCaption origin={traditional()} currentPublic="FUN-1" />);
    expect(screen.getByText('Documentación tradicional')).toBeInTheDocument();
    rerender(<OriginCaption origin={null} />);
    expect(screen.getByRole('status')).toHaveTextContent('Consultando la configuración del expediente');
    rerender(<OriginCaption origin={null} error="Fallo" />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows the query error with a retry action', () => {
    const refresh = vi.fn();
    render(<OriginNotices origin={null} error="Fallo de consulta" refresh={refresh} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Fallo de consulta');
    screen.getByRole('button', { name: 'Reintentar' }).click();
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
