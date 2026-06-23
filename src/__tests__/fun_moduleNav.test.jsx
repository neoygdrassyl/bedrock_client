import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import FUN_MODULE_NAV from '../app/pages/user/fun_forms/components/fun_moduleNav';

describe('FUN_MODULE_NAV', () => {
  const originalGetComputedStyle = window.getComputedStyle;
  const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

  beforeEach(() => {
    window.getComputedStyle = vi.fn(() => ({
      getPropertyValue: () => '240px',
    }));
  });

  afterEach(() => {
    window.getComputedStyle = originalGetComputedStyle;
    logSpy.mockClear();
  });

  it('no emite logs de diagnostico al renderizar la navegacion', () => {
    render(
      <FUN_MODULE_NAV
        currentItem={{
          fun_1s: [{ tipo: '', tramite: '', m_urb: '', m_sub: '', m_lic: '' }],
          id_public: '68001-1-25-0233',
          rules: '0;0',
          state: 1,
          version: 1,
        }}
        FROM="check"
        NAVIGATION={vi.fn()}
        pqrsxfun={[]}
      />
    );

    expect(screen.getByRole('button', { name: /checkeo/i })).toBeInTheDocument();
    expect(logSpy).not.toHaveBeenCalled();
  });
});
