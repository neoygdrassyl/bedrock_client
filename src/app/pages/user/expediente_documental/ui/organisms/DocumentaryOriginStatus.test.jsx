import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DocumentaryOriginStatus } from './DocumentaryOriginStatus';

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
