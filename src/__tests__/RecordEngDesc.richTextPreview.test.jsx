import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import RECORD_ENG_DESC from '../app/pages/user/records/eng/record_eng_desc.component';
import { serializeRichTextBlocks } from '../app/utils/richTextBlockNote';

vi.mock('@/components/rich-text-editor', () => ({
  __esModule: true,
  default: ({ value, readOnly, hiddenName, hiddenId, placeholder }) => (
    <section
      data-testid="rich-text-editor-preview"
      data-value={value || ''}
      data-read-only={String(Boolean(readOnly))}
      data-hidden-name={hiddenName || ''}
      data-hidden-id={hiddenId || ''}
      aria-label={placeholder || 'Editor enriquecido'}
    />
  ),
}));

vi.mock('../app/services/record_eng.service', () => ({
  __esModule: true,
  default: {
    create_review: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update_review: vi.fn(() => Promise.resolve({ data: 'OK' })),
    create_step: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update_step: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
}));

vi.mock('@/app/utils/swalAdapter', () => ({
  swalError: vi.fn(),
  swalLoading: vi.fn(),
  swalSuccess: vi.fn(),
}));

function richTextValue(text) {
  return serializeRichTextBlocks([
    {
      type: 'paragraph',
      content: [{ type: 'text', text, styles: {} }],
    },
  ]);
}

const baseProps = {
  translation: {},
  swaMsg: {
    title_wait: 'Espere...',
    text_wait: 'Procesando...',
    publish_success_title: 'Guardado',
    publish_success_text: 'Cambios guardados',
    generic_eror_title: 'Error',
    generic_error_text: 'No fue posible guardar',
    text_footer: '',
  },
  globals: {},
  currentVersion: 1,
  currentVersionR: 1,
  category: '1',
  requestUpdateRecord: vi.fn(),
  currentItem: {
    fun_1s: [
      {
        id: 1,
        tipo: 'G',
        tramite: 'A',
        m_urb: '',
        m_sub: '',
        m_lic: '',
        usos: '',
        area: '',
        vivienda: '',
        cultural: '',
        description: 'Descripción del proyecto radicado',
      },
    ],
  },
  currentRecord: {
    id: 7,
    record_eng_reviews: [],
    record_eng_steps: [],
  },
};

describe('RECORD_ENG_DESC rich-text previews from Arquitectura', () => {
  it('renders linked architecture rich-text fields in read-only editors without leaking serialized values into textareas', () => {
    const antecedents = richTextValue('Antecedente enriquecido desde arquitectura');
    const architectureDescription = richTextValue('Descripción arquitectónica vinculada');

    render(
      <RECORD_ENG_DESC
        {...baseProps}
        arcSteps={[
          {
            id: 33,
            version: 1,
            id_public: 's33',
            value: `${antecedents};${architectureDescription};`,
          },
        ]}
      />,
    );

    const previews = screen.getAllByTestId('rich-text-editor-preview');

    expect(previews).toHaveLength(2);
    expect(previews[0]).toHaveAttribute('data-read-only', 'true');
    expect(previews[0]).toHaveAttribute('data-value', antecedents);
    expect(previews[0]).toHaveAttribute('data-hidden-name', '');
    expect(previews[1]).toHaveAttribute('data-read-only', 'true');
    expect(previews[1]).toHaveAttribute('data-value', architectureDescription);
    expect(previews[1]).toHaveAttribute('data-hidden-name', '');

    expect(screen.queryByDisplayValue(antecedents)).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue(architectureDescription)).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('Descripción arquitectónica vinculada')).toBeInTheDocument();
  });
});
