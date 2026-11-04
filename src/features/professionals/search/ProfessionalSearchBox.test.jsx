import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

vi.mock('./fallbackSearch', () => ({ professionalSearch: vi.fn() }));

import ProfessionalSearchBox, { NAME_REVIEW_HINT, STATUS_TEXT } from './ProfessionalSearchBox';

const suggestion = {
  key: 'registry:7', source: 'registry', givenNames: 'Ana María', surnames: 'Pérez', cc: '123', email: '',
  phone: '', registration: '', registrationDate: '', sanction: undefined, nameNeedsReview: true,
};

const type = (value) => fireEvent.change(screen.getByRole('combobox'), { target: { value } });

describe('ProfessionalSearchBox', () => {
  it('shows "Sin resultados" when nobody matches', async () => {
    render(<ProfessionalSearchBox onSelect={vi.fn()} search={vi.fn().mockResolvedValue([])} />);
    type('ana');
    expect(await screen.findByText(STATUS_TEXT.empty)).toBeInTheDocument();
  });

  it('tells the user to type the data when the search is unavailable', async () => {
    render(<ProfessionalSearchBox onSelect={vi.fn()} search={vi.fn().mockRejectedValue(new Error('down'))} />);
    type('ana');
    expect(await screen.findByText(STATUS_TEXT.unavailable)).toBeInTheDocument();
  });

  it('shows "Buscando…" while searching', async () => {
    render(<ProfessionalSearchBox onSelect={vi.fn()} search={vi.fn(() => new Promise(() => {}))} />);
    type('ana');
    expect(await screen.findByText(STATUS_TEXT.loading)).toBeInTheDocument();
  });

  it('hands the picked suggestion to onSelect and hints when the name split needs review', async () => {
    const onSelect = vi.fn();
    const search = vi.fn().mockResolvedValue([suggestion]);
    const { container } = render(<ProfessionalSearchBox onSelect={onSelect} search={search} />);
    type('ana');
    await vi.waitFor(() => expect(container.querySelectorAll('option')).toHaveLength(1));
    type('ANA MARIA PEREZ · CC 123');
    expect(onSelect).toHaveBeenCalledWith(suggestion);
    expect(screen.getByText(NAME_REVIEW_HINT)).toBeInTheDocument();
    expect(search).toHaveBeenCalledTimes(1);
  });
});
