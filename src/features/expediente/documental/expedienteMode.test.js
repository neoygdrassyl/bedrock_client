import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { expedienteModeOf, isCanonicalExpediente, usesTraditionalIntake, useExpedienteMode } from './expedienteMode';

describe('expedienteMode', () => {
  it('derives the mode from the expediente row', () => {
    expect(expedienteModeOf({ centralReleaseId: 3 })).toBe('canonical');
    expect(expedienteModeOf({ centralReleaseId: null })).toBe('traditional');
    expect(expedienteModeOf({})).toBe('traditional');
    expect(expedienteModeOf(null)).toBeNull();
    expect(isCanonicalExpediente({ centralReleaseId: 0 })).toBe(true);
    expect(isCanonicalExpediente(undefined)).toBe(false);
  });

  it('lets a loaded origin override the row hint', () => {
    expect(expedienteModeOf({ centralReleaseId: 3 }, { mode: 'traditional' })).toBe('traditional');
    expect(expedienteModeOf(null, { mode: 'unlinked' })).toBe('unlinked');
    expect(usesTraditionalIntake('unlinked')).toBe(true);
    expect(usesTraditionalIntake('canonical')).toBe(false);
    expect(usesTraditionalIntake(null)).toBe(false);
  });

  it('exposes the same selector as a hook', () => {
    expect(renderHook(() => useExpedienteMode({ centralReleaseId: 1 })).result.current).toBe('canonical');
    expect(renderHook(() => useExpedienteMode(null, { mode: 'traditional' })).result.current).toBe('traditional');
  });
});
