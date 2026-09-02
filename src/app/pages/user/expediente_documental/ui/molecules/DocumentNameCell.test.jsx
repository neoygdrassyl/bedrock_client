import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DocumentNameCell } from './DocumentNameCell';
import { LEGAL_FORM_FILTER } from '../../../shared/expediente-documental.utils';

describe('DocumentNameCell', () => {
    it('renders the document name and code without legal-form data', () => {
        render(<DocumentNameCell name="Certificado de tradición" code="F-102" />);

        const cell = screen.getByTestId('document-name-cell');
        expect(cell).toHaveTextContent('Certificado de tradición');
        expect(cell).toHaveTextContent('F-102');
        expect(screen.queryByTestId('legal-form-badge')).not.toBeInTheDocument();
    });

    it('renders nothing for the code when it is missing', () => {
        render(<DocumentNameCell name="Documento sin nombre" code="" />);

        expect(screen.getByTestId('document-name-cell')).not.toHaveTextContent('undefined');
    });

    it('renders legal-form status, source, and reason badges when present', () => {
        render(<DocumentNameCell
            name="Certificado de tradición"
            code="F-102"
            legalForm={{
                status: LEGAL_FORM_FILTER.MISSING,
                statusLabel: 'Faltante',
                statusReason: 'No se encontró evidencia documental.',
                sourceLabel: 'Snapshot activo',
            }}
        />);

        expect(screen.getByText('Faltante')).toBeInTheDocument();
        expect(screen.getByText('Snapshot activo')).toBeInTheDocument();
        expect(screen.getByText('No se encontró evidencia documental.')).toBeInTheDocument();
        expect(screen.queryByText('Fila sintética')).not.toBeInTheDocument();
    });

    it('flags synthetic preview rows', () => {
        render(<DocumentNameCell
            name="Requisito faltante"
            legalForm={{ status: LEGAL_FORM_FILTER.MISSING, statusLabel: 'Faltante', sourceLabel: 'Snapshot activo' }}
            isPreviewRow
        />);

        expect(screen.getByText('Fila sintética')).toBeInTheDocument();
    });
});
