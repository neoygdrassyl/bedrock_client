import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import RECORDS_BINNACLE from './records_binnacles.component';

vi.mock('@/components/rich-text-editor', () => ({
    default: ({ value, hiddenId, readOnly, minHeight, toolbarItems, onSave }) => (
        <div>
            <textarea data-testid="mock-rich-text-editor" defaultValue={value} id={hiddenId} readOnly={readOnly} data-min-height={minHeight} data-toolbar-items={toolbarItems?.join(',') || ''} />
            {!readOnly ? <button type="button" onClick={() => onSave?.({ nextValue: 'Bitácora arquitectura actualizada' })}>Guardar editor</button> : null}
        </div>
    ),
}));

vi.mock('@/app/utils/swalAdapter', () => ({
    swalError: vi.fn(),
    swalSuccess: vi.fn(),
}));

vi.mock('./arc/recordArcRichTextUpload', () => ({
    uploadRecordArcRichTextImage: vi.fn(),
}));

describe('RECORDS_BINNACLE', () => {
    it('usa el lenguaje visual de observaciones sin volverse desplegable', async () => {
        const service = {
            getRecord: vi.fn().mockResolvedValue({ data: [{ id: 11, binnacle: 'Bitácora inicial' }] }),
            update: vi.fn(),
        };

        const { container } = render(
            <RECORDS_BINNACLE
                translation={{}}
                swaMsg={{}}
                globals={{}}
                currentItem={{ id: 25 }}
                currentVersion={1}
                currentRecord={{ id: 11 }}
                currentVersionR={1}
                SERVICE={service}
                AIM="Jurídico"
                readOnly={false}
                compact
            />,
        );

        await waitFor(() => expect(service.getRecord).toHaveBeenCalledWith(25));

        expect(screen.queryByRole('button', { name: /bitácora - jurídico/i })).not.toBeInTheDocument();
        expect(screen.getByText('Bitácora - Jurídico')).toBeInTheDocument();

        const header = container.querySelector('.op__static-header');
        const textarea = container.querySelector('#binnable_ta_Jurídico.op__textarea');

        expect(header).not.toBeNull();
        expect(textarea).not.toBeNull();
        expect(textarea).toHaveAttribute('rows', '3');
        expect(textarea).toHaveClass('op__static-textarea');

        const css = readFileSync('src/app/components/ObservationPanel.css', 'utf8');
        expect(css).toContain('.op__static-card--compact .op__static-body');
        expect(css).toContain('padding: 0.45rem 0.5rem 0.55rem;');
        expect(css).toContain('.op__static-card--compact .op__static-textarea');
        expect(css).toContain('width: 100%;');
    });

    it('da mas alto al editor enriquecido en modo compacto', async () => {
        const service = {
            getRecord: vi.fn().mockResolvedValue({ data: [{ id: 12, binnacle: '<p>Bitácora arquitectura</p>' }] }),
            update: vi.fn(),
        };

        render(
            <RECORDS_BINNACLE
                translation={{}}
                swaMsg={{}}
                globals={{}}
                currentItem={{ id: 26 }}
                currentVersion={1}
                currentRecord={{ id: 12 }}
                currentVersionR={1}
                SERVICE={service}
                AIM="Arquitectura"
                readOnly={false}
                compact
            />,
        );

        await waitFor(() => expect(service.getRecord).toHaveBeenCalledWith(26));

        expect(screen.getByTestId('mock-rich-text-editor')).toHaveAttribute('data-min-height', '140');
    });

    it('limita la barra enriquecida de arquitectura a negrilla e imagen', async () => {
        const service = {
            getRecord: vi.fn().mockResolvedValue({ data: [{ id: 12, binnacle: '<p>Bitácora arquitectura</p>' }] }),
            update: vi.fn(),
        };

        render(
            <RECORDS_BINNACLE
                translation={{}}
                swaMsg={{}}
                globals={{}}
                currentItem={{ id: 26 }}
                currentVersion={1}
                currentRecord={{ id: 12 }}
                currentVersionR={1}
                SERVICE={service}
                AIM="Arquitectura"
                readOnly={false}
                compact
            />,
        );

        await waitFor(() => expect(service.getRecord).toHaveBeenCalledWith(26));

        expect(screen.getByTestId('mock-rich-text-editor')).toHaveAttribute('data-toolbar-items', 'bold,image');
    });

    it('guarda el valor actualizado que entrega el editor enriquecido', async () => {
        const requestUpdateRecord = vi.fn();
        const service = {
            getRecord: vi.fn().mockResolvedValue({ data: { record_arc: { id: 12, binnacle: 'Bitácora anterior' } } }),
            update: vi.fn().mockResolvedValue({ data: 'OK' }),
        };

        render(
            <RECORDS_BINNACLE
                translation={{}}
                swaMsg={{}}
                globals={{}}
                currentItem={{ id: 26 }}
                currentVersion={1}
                currentRecord={null}
                currentVersionR={1}
                SERVICE={service}
                requestUpdateRecord={requestUpdateRecord}
                AIM="Arquitectura"
                PATH="record_arc"
                readOnly={false}
                compact
            />,
        );

        await waitFor(() => expect(service.getRecord).toHaveBeenCalledWith(26));

        fireEvent.click(screen.getByRole('button', { name: /guardar editor/i }));

        await waitFor(() => expect(service.update).toHaveBeenCalled());
        const [recordId, formData] = service.update.mock.calls[0];

        expect(recordId).toBe(12);
        expect(formData.get('binnacle')).toBe('Bitácora arquitectura actualizada');
        await waitFor(() => expect(requestUpdateRecord).toHaveBeenCalledWith(26));
    });
});
