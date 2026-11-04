import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

vi.mock('./fallbackSearch', async (importOriginal) => ({ ...(await importOriginal()), professionalSearch: vi.fn() }));

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

  it('fills the second namesake when the second one is picked', async () => {
    const onSelect = vi.fn();
    const first = { ...suggestion, key: 'external:1', cc: '', nameNeedsReview: false };
    const second = { ...first, key: 'external:2', email: 'second@test.co' };
    const { container } = render(<ProfessionalSearchBox onSelect={onSelect} search={vi.fn().mockResolvedValue([first, second])} />);
    type('ana');
    await vi.waitFor(() => expect(container.querySelectorAll('option')).toHaveLength(2));
    const texts = [...container.querySelectorAll('option')].map((option) => option.value);
    expect(new Set(texts).size).toBe(2);
    type(texts[1]);
    expect(onSelect).toHaveBeenCalledWith(second);
  });

  it('searches with the name part when a picked label is edited', async () => {
    const search = vi.fn().mockResolvedValue([suggestion]);
    const { container } = render(<ProfessionalSearchBox onSelect={vi.fn()} search={search} />);
    type('ana');
    await vi.waitFor(() => expect(container.querySelectorAll('option')).toHaveLength(1));
    type('ANA MARIA PEREZ · CC 123');
    type('ANA MARIA PEREZ · CC 12');
    await vi.waitFor(() => expect(search).toHaveBeenCalledTimes(2));
    expect(search.mock.calls[1][0]).toBe('ANA MARIA PEREZ');
  });

  it('searches the given sources in order', async () => {
    const sources = [
      { name: 'registry', search: vi.fn().mockResolvedValue([]) },
      { name: 'internal', search: vi.fn().mockResolvedValue([suggestion]) },
    ];
    const { container } = render(<ProfessionalSearchBox onSelect={vi.fn()} sources={sources} />);
    type('ana');
    await vi.waitFor(() => expect(container.querySelectorAll('option')).toHaveLength(1));
    expect(sources[0].search).toHaveBeenCalledBefore(sources[1].search);
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
