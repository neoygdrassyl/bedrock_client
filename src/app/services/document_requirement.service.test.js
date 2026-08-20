import { describe, expect, it, vi } from 'vitest';

vi.mock('../../http-common', () => ({
  __esModule: true,
  default: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
  },
}));

import http from '../../http-common';
import documentRequirementService from './document_requirement.service.js';

describe('documentRequirementService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('previewRequirements', () => {
    it('calls POST /document-requirements/preview with status', () => {
      http.post.mockResolvedValue({ data: { requirements: [] } });

      documentRequirementService.previewRequirements({ tipo: 'B' }, { status: 'published' });

      expect(http.post).toHaveBeenCalledWith(
        '/document-requirements/preview?status=published',
        expect.objectContaining({ tipo: 'B', configStatus: 'published' }),
        undefined,
      );
    });
  });

});
