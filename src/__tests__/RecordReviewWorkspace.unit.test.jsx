import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { RecordReviewWorkspace } from '../app/pages/user/records/components/RecordReviewWorkspace';

describe('RecordReviewWorkspace', () => {
    it('muestra inventario por defecto y cambia a expediente documental al navegar', async () => {
        const user = userEvent.setup();

        render(
            <RecordReviewWorkspace
                inventoryLabel="2.2 Inventario de Información Aportada"
                documentsLabel="2.3 Expediente documental"
                inventoryContent={<div>Inventario visible</div>}
                documentsContent={<div>Documentos visibles</div>}
            />
        );

        expect(screen.getByText('Inventario visible')).toBeInTheDocument();
        expect(screen.queryByText('Documentos visibles')).not.toBeInTheDocument();

        await user.click(screen.getByRole('tab', { name: /2.3 expediente documental/i }));

        expect(screen.getByText('Documentos visibles')).toBeInTheDocument();
        expect(screen.queryByText('Inventario visible')).not.toBeInTheDocument();
    });
});