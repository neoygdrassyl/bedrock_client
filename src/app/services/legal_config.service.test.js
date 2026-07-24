import { beforeEach, describe, expect, it, vi } from 'vitest';

const http = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn(), post: vi.fn() }));
vi.mock('../../http-common', () => ({ default: http }));

import LegalConfigService from './legal_config.service.js';

describe('legal_config.service document reviews', () => {
  beforeEach(() => vi.resetAllMocks());

  it('sends workspace mutations as JSON instead of inheriting the global multipart default', () => {
    const payload = { name: 'Planos', code: 'Planos' };

    LegalConfigService.create('typologies', payload);
    LegalConfigService.update('labels', 'label/1', payload);
    LegalConfigService.saveAssociations('actuation/1', { label_ids: ['label/1'] });

    const json = { headers: { 'Content-Type': 'application/json' } };
    expect(http.post).toHaveBeenCalledWith('/legal-config/workspace/typologies', payload, json);
    expect(http.put).toHaveBeenCalledWith('/legal-config/workspace/labels/label%2F1', payload, json);
    expect(http.put).toHaveBeenCalledWith('/legal-config/workspace/actuations/actuation%2F1/associations', { label_ids: ['label/1'] }, json);
  });

  it('sends review JSON explicitly and lets the module handle validation errors locally', () => {
    const payload = { review_config: { schemaVersion: 1, checks: [] } };

    LegalConfigService.updateDocumentReviews('document/1', payload);

    expect(http.put).toHaveBeenCalledWith(
      '/legal-config/workspace/document-reviews/document%2F1',
      payload,
      {
        headers: { 'Content-Type': 'application/json' },
        skipDovelaErrorCapture: true,
      },
    );
  });
});
