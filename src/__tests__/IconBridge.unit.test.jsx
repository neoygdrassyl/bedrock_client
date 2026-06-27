import { readFileSync } from 'node:fs';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Icon } from '@/components/icon';

describe('Icon bridge bundle hygiene', () => {
  it('does not namespace-import lucide-react into the shared app bundle', () => {
    const source = readFileSync('src/components/icon.jsx', 'utf8');

    expect(source).not.toContain("import * as LucideIcons from 'lucide-react'");
    expect(source).toContain('LUCIDE_ICON_REGISTRY');
  });

  it('renders mapped legacy FontAwesome names and direct Lucide names', () => {
    render(
      <>
        <Icon name="fa-file-alt" aria-label="file icon" />
        <Icon name="Search" aria-label="search icon" />
      </>,
    );

    expect(screen.getByLabelText('file icon')).toBeInTheDocument();
    expect(screen.getByLabelText('search icon')).toBeInTheDocument();
  });
});
