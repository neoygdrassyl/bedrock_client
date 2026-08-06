import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

const { getIdRelatedMock, updateReviewMock } = vi.hoisted(() => ({
  getIdRelatedMock: vi.fn().mockResolvedValue({ data: [] }),
  updateReviewMock: vi.fn().mockResolvedValue({ data: 'OK' }),
}));

vi.mock('../app/services/fun.service', () => ({
  default: { update_r: updateReviewMock },
}));

vi.mock('../app/services/submit.service', () => ({
  default: { getIdRelated: getIdRelatedMock },
}));

vi.mock('../app/components/customClasses/typeParse', () => ({
  GEM_CODE_LIST: () => [{ parent: '6.1 DOC COMUNES A TODA SOLIC', codes: ['511'] }],
  VR_DOCUMENTS_OF_INTEREST: { arc: ['511'] },
}));

vi.mock('../app/components/vizualizer.component', () => ({
  default: () => <span>Visualizador</span>,
}));

vi.mock('../app/utils/swalAdapter', () => ({
  swalError: vi.fn(),
  swalLoading: vi.fn(),
  swalSuccess: vi.fn(),
}));

import RecordLawDocsCheck from '../app/pages/user/records/law/record_law_docs_check';

describe('Inf. Arq document inventory EditableDataGrid', () => {
  test('renders the opt-in visual grid and preserves evaluation saving without attachment controls', async () => {
    const user = userEvent.setup();
    const requestUpdate = vi.fn();
    const { container } = render(
      <RecordLawDocsCheck
        currentItem={{ id: 1, id_public: '68001-1-26-0084', fun_1s: [{}] }}
        _FUN_6={[]}
        _FUN_R={{
          id: 9,
          code: '511',
          checked: '1',
          review: '511&0',
          id6: '',
        }}
        docsScope="arc"
        readOnly={false}
        showAttachmentColumns={false}
        showFilters
        useEditableGrid
        requestUpdate={requestUpdate}
        swaMsg={{}}
      />,
    );

    const grid = await screen.findByRole('grid', { name: 'Inventario de Informacion Aportada' });
    expect(grid).not.toHaveAttribute('tabindex');
    expect(screen.getByRole('columnheader', { name: 'MODALIDAD' })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'EVALUACION' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'APORTO' })).toBeTruthy();
    expect(container.querySelector('.data-table-component')).toBeNull();
    expect(grid.closest('[data-editable-grid-scroll]')).not.toHaveClass('overflow-auto');
    expect(grid.closest('[data-editable-grid-scroll]')).not.toHaveClass('max-h-[360px]');

    await user.selectOptions(screen.getByRole('combobox'), '1');

    await waitFor(() => expect(updateReviewMock).toHaveBeenCalledTimes(1));
    const formData = updateReviewMock.mock.calls[0][1];
    expect(formData.get('review')).toBe('511&1');
    expect(formData.has('id6')).toBe(false);
  });
});
