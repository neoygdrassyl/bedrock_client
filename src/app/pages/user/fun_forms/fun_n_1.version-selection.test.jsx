import { describe, expect, it } from 'vitest';

import { getFun1ForVersion } from './fun_n_1.js';

describe('getFun1ForVersion', () => {
  it('selects the requested version regardless of array order and preserves the backend tie-breaker', () => {
    const entries = [
      { id: 30, version: 3 },
      { id: 21, version: 2 },
      { id: 20, version: 2 },
      { id: 10, version: 1 },
    ];

    expect(getFun1ForVersion(entries, 2)).toEqual({ id: 21, version: 2 });
    expect(getFun1ForVersion(entries, '1')).toEqual({ id: 10, version: 1 });
    expect(getFun1ForVersion(entries, 4)).toBeNull();
  });
});
