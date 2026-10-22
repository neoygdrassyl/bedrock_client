import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { buildSelfAssessmentRows, SelfAssessmentSection } from './SelfAssessmentSection';

const item = (selfAssessment) => ({
  id: 7,
  evaluatedDocuments: [{ documentCode: 'DOC-A', label: 'Formulario único', required: true }],
  snapshot: { summary: { labels: { 'DOC-B': 'Plano de localización' } } },
  selfAssessment,
});

const assessment = {
  enabled: true,
  releaseId: 'rel-1',
  documents: [
    { documentCode: 'DOC-A', items: [{ controlId: 'c-1', title: 'Firma del titular', selectedValueId: 'v1', valueLabel: 'Sí, firmado', effect: 'complies', observation: 'Firmado en notaría', assessedAt: '2026-10-01T10:00:00.000Z' }], summary: { total: 1, complies: 1, doesNotComply: 0, noDecision: 0 } },
    { documentCode: 'DOC-B', items: [{ controlId: 'c-2', title: 'Escala del plano', selectedValueId: 'v2', valueLabel: 'No', effect: 'does_not_comply', observation: null, assessedAt: null }], summary: { total: 1, complies: 0, doesNotComply: 1, noDecision: 0 } },
  ],
  summary: { total: 2, complies: 1, doesNotComply: 1, noDecision: 0 },
};

describe('SelfAssessmentSection', () => {
  it('resolves the document labels from the evaluated requirements and the snapshot labels', () => {
    const rows = buildSelfAssessmentRows(item(assessment));
    expect(rows.map((row) => row.label)).toEqual(['Formulario único', 'Plano de localización']);
    expect(buildSelfAssessmentRows(item(null))).toEqual([]);
    expect(buildSelfAssessmentRows(item({ enabled: true, documents: [] }))).toEqual([]);
  });

  it('renders every document with its answers and hides itself without a self-assessment', () => {
    const { rerender, container } = render(<SelfAssessmentSection item={item(assessment)} />);
    const section = screen.getByRole('region', { name: 'Autoevaluación del solicitante' });
    expect(within(section).getByText('Firma del titular')).toBeInTheDocument();
    expect(within(section).getByText('Sí, firmado')).toBeInTheDocument();
    expect(within(section).getByText('Firmado en notaría')).toBeInTheDocument();
    expect(within(section).getByText('Cumple')).toBeInTheDocument();
    expect(within(section).getByText('No cumple')).toBeInTheDocument();
    expect(within(section).getByText('DOC-B')).toBeInTheDocument();
    rerender(<SelfAssessmentSection item={item(null)} />);
    expect(container).toBeEmptyDOMElement();
  });
});
