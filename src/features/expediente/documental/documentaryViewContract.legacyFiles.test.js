import { describe, expect, it } from 'vitest';
import { validateDocumentaryReceipt } from './documentaryViewContract';

const base = {
  id: 58, fun0Id: 1770, configurationId: 4, documentClass: 'requirement', documentId: '7a6e2325-f0b5-4bec-8194-1efaa0097866',
  documentCode: '511', title: 'Formulario', documentKey: 'k-511', versionSequence: 1, rowVersion: 1, evidenceRevision: 1,
  contributor: null, channel: 'counter',
};
const receipt = (files) => ({ ...base, files });

describe('view contract: files imported from the legacy model', () => {
  it('accepts a legacy file that is missing on disk (no hash, no size, generic mime)', () => {
    const scan = { sha256: null, bytes: null, mimeType: 'application/octet-stream', originalName: 'escaneo.pdf', evidenceRevision: 1, missing: true,
      downloadUrl: '/api/fun/documentary/v1/projects/1770/legacy-migration/files/58/scan' };
    expect(() => validateDocumentaryReceipt(receipt({ digital: null, scan }), 1770)).not.toThrow();
  });
  it('requires hash and size for a legacy file that exists', () => {
    const scan = { sha256: null, bytes: null, mimeType: 'application/pdf', originalName: 'escaneo.pdf', evidenceRevision: 1, missing: false };
    expect(() => validateDocumentaryReceipt(receipt({ digital: null, scan }), 1770)).toThrow();
  });
  it('keeps native files strict', () => {
    const digital = { sha256: null, bytes: 10, mimeType: 'application/pdf', originalName: 'a.pdf', evidenceRevision: 1 };
    expect(() => validateDocumentaryReceipt(receipt({ digital, scan: null }), 1770)).toThrow();
  });
});
