import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FunUpdateSectionLegend from './FunUpdateSectionLegend.jsx';

describe('FunUpdateSectionLegend', () => {
  it('renders a fieldset legend by default', () => {
    render(<fieldset><FunUpdateSectionLegend id="funn_1" step="1">Identificación de la Solicitud</FunUpdateSectionLegend></fieldset>);
    const legend = screen.getByText('Identificación de la Solicitud').closest('legend');
    expect(legend).toHaveAttribute('id', 'funn_1');
    expect(legend).toHaveClass('fun-update-section-legend');
    expect(legend).toHaveTextContent('1Identificación de la Solicitud');
  });

  it('can render the same heading outside a fieldset', () => {
    render(<FunUpdateSectionLegend as="h2" id="doc-title" className="m-0">Gestión documental</FunUpdateSectionLegend>);
    const heading = screen.getByRole('heading', { level: 2, name: 'Gestión documental' });
    expect(heading).toHaveAttribute('id', 'doc-title');
    expect(heading).toHaveClass('fun-update-section-legend', 'm-0');
  });
});
