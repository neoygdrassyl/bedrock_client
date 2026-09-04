import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import ExpandableTableSection from '../app/pages/user/records/arc/components/ExpandableTableSection';

describe('ExpandableTableSection', () => {
  test('starts expanded when it has items and collapsed when it is empty', () => {
    const { rerender } = render(
      <ExpandableTableSection id="parking-table" title="Cupos en sitio" itemCount={1}>
        <div>Contenido de parqueaderos</div>
      </ExpandableTableSection>
    );

    expect(screen.getByRole('button', { name: /cupos en sitio/i })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Contenido de parqueaderos')).toBeVisible();

    rerender(
      <ExpandableTableSection id="parking-table" title="Cupos en sitio" itemCount={0}>
        <div>Contenido de parqueaderos</div>
      </ExpandableTableSection>
    );

    expect(screen.getByRole('button', { name: /cupos en sitio/i })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Contenido de parqueaderos').closest('#parking-table')).toHaveAttribute('data-state', 'closed');
  });

  test('allows the reviewer to expand an empty table', () => {
    render(
      <ExpandableTableSection id="location-table" title="Localización de parqueaderos" itemCount={0}>
        <div>Contenido de localización</div>
      </ExpandableTableSection>
    );

    fireEvent.click(screen.getByRole('button', { name: /localización de parqueaderos/i }));

    expect(screen.getByRole('button', { name: /localización de parqueaderos/i })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Contenido de localización')).toBeVisible();
  });
});
