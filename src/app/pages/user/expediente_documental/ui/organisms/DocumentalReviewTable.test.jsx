import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DocumentalReviewTable } from './DocumentalReviewTable';

function legacyRow(overrides = {}) {
  return {
    id: 1,
    documentName: 'Plano estructural',
    documentCode: 'DOC-1',
    latestVr: 'VR-1',
    latestDocumentDate: '2026-01-10',
    entries: [],
    scanned: { applies: true, value: true },
    mediumPresence: { physical: true, digital: false },
    folios: { physical: 2, digital: null },
    ...overrides,
  };
}

const rows = [
  legacyRow(),
  legacyRow({ id: 2, documentName: 'Memoria de cálculo', documentCode: 'DOC-2', latestVr: 'VR-2', folios: { physical: 511, digital: null } }),
];

function documentRows() {
  return screen.getAllByRole('row').filter((row) => row.hasAttribute('data-row-key'));
}

describe('DocumentalReviewTable', () => {
  it('selects a document by clicking anywhere on its row', () => {
    render(<DocumentalReviewTable rows={rows} resultCount={2} />);
    expect(screen.getByRole('grid', { name: 'Documentos new por unidad documental' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Plano estructural' })).toBeInTheDocument();
    const [first, second] = documentRows();
    expect(first).toHaveAttribute('aria-selected', 'true');
    expect(first).toHaveAttribute('tabindex', '0');
    expect(second).toHaveAttribute('tabindex', '-1');

    // A cell other than the title (the scan status) selects the row too.
    fireEvent.click([...second.querySelectorAll('td')].at(-1));
    expect(screen.getByRole('heading', { name: 'Memoria de cálculo' })).toBeInTheDocument();
    expect(screen.getByRole('complementary')).toHaveTextContent('511');
    expect(second).toHaveAttribute('aria-selected', 'true');
    expect(second).toHaveAttribute('tabindex', '0');
    expect(first).toHaveAttribute('aria-selected', 'false');
    expect(first).toHaveAttribute('tabindex', '-1');
  });

  it('moves focus with the arrow keys and selects with Enter or Space', () => {
    render(<DocumentalReviewTable rows={rows} resultCount={2} />);
    const [first, second] = documentRows();
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowDown' });
    expect(second).toHaveFocus();
    expect(screen.getByRole('heading', { name: 'Plano estructural' })).toBeInTheDocument();

    fireEvent.keyDown(second, { key: 'Enter' });
    expect(screen.getByRole('heading', { name: 'Memoria de cálculo' })).toBeInTheDocument();
    expect(second).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(second, { key: 'ArrowUp' });
    expect(first).toHaveFocus();
    fireEvent.keyDown(first, { key: ' ' });
    expect(screen.getByRole('heading', { name: 'Plano estructural' })).toBeInTheDocument();
    expect(first).toHaveAttribute('tabindex', '0');
  });

  it('keeps the title out of the tab order so the row is the single focus target', () => {
    render(<DocumentalReviewTable rows={rows} resultCount={2} />);
    const [first] = documentRows();
    expect(first.querySelector('button[aria-controls]')).toHaveAttribute('tabindex', '-1');
  });
});
