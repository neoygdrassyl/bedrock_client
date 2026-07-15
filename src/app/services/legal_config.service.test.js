import { beforeEach, describe, expect, it, vi } from 'vitest';

const http = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn(), post: vi.fn() }));
vi.mock('../../http-common', () => ({ default: http }));

import LegalConfigService from './legal_config.service.js';

describe('legal_config.service document reviews', () => {
  beforeEach(() => vi.resetAllMocks());

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
