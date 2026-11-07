import { beforeEach, describe, expect, it, vi } from 'vitest';

const lookup = vi.hoisted(() => vi.fn());
vi.mock('@/features/professional-registry', () => ({ professionalRegistryService: { lookup } }));

import {
  MANUAL_529_HINT, certifiedExperience, certifiedForLabel, certifiedHint, registryIdByCc, roleOfLabel,
} from './fun529Source';

const CERTIFIED = { roleCode: 'GEOTEC', label: 'INGENIERO CIVIL GEOTECNISTA', specificMonths: 78, specificSource: 'certificados', certificateCount: 3 };

describe('certifiedExperience', () => {
  it('takes the whole months and the certificate count of a certified role', () => {
    expect(certifiedExperience(CERTIFIED)).toEqual({ months: 78, count: 3 });
  });

  it('is null without certificates, for an older server source or without a value', () => {
    expect(certifiedExperience({ ...CERTIFIED, certificateCount: 0 })).toBeNull();
    expect(certifiedExperience({ ...CERTIFIED, specificSource: 'manual' })).toBeNull();
    expect(certifiedExperience({ ...CERTIFIED, specificSource: 'expediente' })).toBeNull();
    expect(certifiedExperience({ ...CERTIFIED, specificMonths: null })).toBeNull();
    expect(certifiedExperience({ ...CERTIFIED, certificateCount: undefined })).toBeNull();
    expect(certifiedExperience(null)).toBeNull();
  });

  it('finds the entry of a 5.2.5 label', () => {
    const eligibility = { roles: [CERTIFIED] };
    expect(roleOfLabel(eligibility, 'INGENIERO CIVIL GEOTECNISTA')).toBe(CERTIFIED);
    expect(roleOfLabel(eligibility, 'ARQUITECTO PROYECTISTA')).toBeNull();
    expect(roleOfLabel(null, 'X')).toBeNull();
    expect(certifiedForLabel(eligibility, 'INGENIERO CIVIL GEOTECNISTA')).toEqual({ months: 78, count: 3 });
  });

  it('writes the hints', () => {
    expect(certifiedHint(1)).toBe('Tomada de BD Profesionales (1 certificación).');
    expect(certifiedHint(4)).toBe('Tomada de BD Profesionales (4 certificaciones).');
    expect(MANUAL_529_HINT).toMatch(/no se registra en BD Profesionales/);
  });
});

describe('registryIdByCc', () => {
  beforeEach(() => lookup.mockReset());

  it('searches the digits and keeps only the person with exactly that cédula', async () => {
    lookup.mockResolvedValue({ data: { data: [{ registryId: 4, cc: '10987654321' }, { registryId: 9, cc: '1098765432' }] } });
    expect(await registryIdByCc('1.098.765.432')).toBe(9);
    expect(lookup).toHaveBeenCalledWith('1098765432', { signal: undefined });
  });

  it('is null for a short cédula, no match, two matches or a failing search', async () => {
    expect(await registryIdByCc('12')).toBeNull();
    expect(lookup).not.toHaveBeenCalled();
    lookup.mockResolvedValueOnce({ data: { data: [{ registryId: 4, cc: '10987654321' }] } });
    expect(await registryIdByCc('1098765432')).toBeNull();
    lookup.mockResolvedValueOnce({ data: { data: [{ registryId: 4, cc: '1098765432' }, { registryId: 5, cc: '1098765432' }] } });
    expect(await registryIdByCc('1098765432')).toBeNull();
    lookup.mockRejectedValueOnce(Object.assign(new Error('404'), { response: { status: 404 } }));
    expect(await registryIdByCc('1098765432')).toBeNull();
  });
});
