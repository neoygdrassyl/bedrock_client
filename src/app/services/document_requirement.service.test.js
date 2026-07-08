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

  describe('getExplorer', () => {
    it('calls GET /document-requirements/explorer with published status', () => {
      http.get.mockResolvedValue({ data: { readOnly: true, status: 'published' } });

      documentRequirementService.getExplorer('published');

      expect(http.get).toHaveBeenCalledWith('/document-requirements/explorer?status=published');
    });

    it('calls GET /document-requirements/explorer with draft status', () => {
      http.get.mockResolvedValue({ data: { readOnly: true, status: 'draft' } });

      documentRequirementService.getExplorer('draft');

      expect(http.get).toHaveBeenCalledWith('/document-requirements/explorer?status=draft');
    });

    it('defaults to published when no status given', () => {
      http.get.mockResolvedValue({ data: { readOnly: true, status: 'published' } });

      documentRequirementService.getExplorer();

      expect(http.get).toHaveBeenCalledWith('/document-requirements/explorer?status=published');
    });
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

  describe('no mutation methods in explorer flow', () => {
    it('getExplorer does not call saveDraft or publishConfig methods', () => {
      expect(documentRequirementService.saveDraft).toBeDefined();
      expect(documentRequirementService.publishConfig).toBeDefined();
      // getExplorer just makes GET call — no mutation
      http.get.mockResolvedValue({ data: {} });
      documentRequirementService.getExplorer();

      expect(http.put).not.toHaveBeenCalled();
      expect(http.post).not.toHaveBeenCalled();
    });
  });
});
