/**
 * Regression test for H-17: the document viewer opened by `id` must request
 * the real file path, not the bare `/files/` apipath.
 */

import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import VIZUALIZER from './vizualizer.component';

const hoisted = vi.hoisted(() => ({
    getFun6: vi.fn(),
}));

vi.mock('@/shared/components/legacy-modal', () => ({
    LegacyModal: ({ children, isOpen }) => (isOpen ? React.createElement('div', null, children) : null),
}));

vi.mock('@/shared/components/ProtectedDocument', () => ({
    ProtectedDocumentPreview: ({ source }) => React.createElement('div', { 'data-testid': 'pdf-viewer', 'data-source': source }),
}));

vi.mock('../../app/services/fun.service', () => ({
    __esModule: true,
    default: { getFun6: (...args) => hoisted.getFun6(...args) },
}));

describe('VIZUALIZER PDF viewer request (H-17)', () => {
    beforeEach(() => {
        hoisted.getFun6.mockReset();
    });

    it('requests the real path/filename when opened by id', async () => {
        hoisted.getFun6.mockResolvedValue({ data: { path: 'documents/2024', filename: 'file.pdf' } });

        render(<VIZUALIZER id={'42'} apipath={'/files/'} icon={'IdCard'} />);

        fireEvent.click(screen.getByRole('button'));

        const viewer = await waitFor(() => screen.getByTestId('pdf-viewer'));

        expect(viewer.getAttribute('data-source')).toBe('/files/documents/2024/file.pdf?inline=1');
    });

    it('keeps the non-id request unchanged', async () => {
        render(<VIZUALIZER url={'documents/2024/file.pdf'} apipath={'/files/'} icon={'IdCard'} />);

        fireEvent.click(screen.getByRole('button'));

        const viewer = await waitFor(() => screen.getByTestId('pdf-viewer'));

        expect(viewer.getAttribute('data-source')).toBe('/files/documents/2024/file.pdf?inline=1');
        expect(hoisted.getFun6).not.toHaveBeenCalled();
    });
});
