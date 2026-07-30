import { saveAs } from 'file-saver';

import http from '@/http-common';
import {
  buildProtectedFilePath,
  downloadGeneratedPdf,
  downloadProtectedFile,
  downloadProtectedPdf,
  requestProtectedArrayBuffer,
  requestProtectedBlob,
  toProtectedApiPath,
} from './pdfDownload';

vi.mock('@/http-common', () => ({
  default: { request: vi.fn() },
}));

vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}));

describe('downloadProtectedPdf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('downloads a protected PDF through the authenticated HTTP client', async () => {
    const pdf = new Blob(['pdf'], { type: 'application/pdf' });
    http.request.mockResolvedValue({ data: pdf, headers: { 'content-type': 'application/pdf' } });

    await downloadProtectedPdf('/pdf/expdocres/Resolucion.pdf', 'Resolucion.pdf');

    expect(http.request).toHaveBeenCalledWith({
      method: 'GET',
      responseType: 'blob',
      url: '/pdf/expdocres/Resolucion.pdf',
    });
    expect(saveAs).toHaveBeenCalledWith(pdf, 'Resolucion.pdf');
  });

  it('downloads a generated artifact by its server-issued identifier', async () => {
    const pdf = new Blob(['isolated-pdf'], { type: 'application/pdf' });
    http.request.mockResolvedValue({ data: pdf, headers: { 'content-type': 'application/pdf' } });

    await downloadGeneratedPdf(
      { data: { status: 'OK', artifactId: '4f3372ad-7f63-44d7-a315-32f36020b468' } },
      '/pdf/recordeng/legacy-name.pdf',
      'Informe.pdf',
    );

    expect(http.request).toHaveBeenCalledWith({
      method: 'GET',
      responseType: 'blob',
      url: '/pdf/artifacts/4f3372ad-7f63-44d7-a315-32f36020b468',
    });
    expect(saveAs).toHaveBeenCalledWith(pdf, 'Informe.pdf');
  });

  it('keeps the legacy generated PDF path for an older backend response', async () => {
    const pdf = new Blob(['legacy-pdf'], { type: 'application/pdf' });
    http.request.mockResolvedValue({ data: pdf, headers: { 'content-type': 'application/pdf' } });

    await downloadGeneratedPdf({ data: 'OK' }, '/pdf/recordeng/legacy-name.pdf', 'Informe.pdf');

    expect(http.request).toHaveBeenCalledWith({
      method: 'GET',
      responseType: 'blob',
      url: '/pdf/recordeng/legacy-name.pdf',
    });
  });

  it('fails closed when a migrated generator does not return an artifact id', async () => {
    await expect(downloadGeneratedPdf({ data: 'OK' }, null, 'Informe.pdf')).rejects.toThrow(
      'El servidor no devolvió un PDF generado seguro.',
    );

    expect(http.request).not.toHaveBeenCalled();
    expect(saveAs).not.toHaveBeenCalled();
  });

  it('supports authenticated JSON POST generation with progress', async () => {
    const pdf = new Blob(['pdf'], { type: 'application/pdf' });
    const onDownloadProgress = vi.fn();
    http.request.mockResolvedValue({ data: pdf, headers: { 'content-type': 'application/pdf' } });

    await downloadProtectedPdf('/pdf-generate/generate-pdf', 'Ejecutoria.pdf', {
      method: 'POST',
      data: { html: '<p>Ejecutoria</p>' },
      headers: { 'Content-Type': 'application/json' },
      onDownloadProgress,
    });

    expect(http.request).toHaveBeenCalledWith({
      data: { html: '<p>Ejecutoria</p>' },
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      onDownloadProgress,
      responseType: 'blob',
      url: '/pdf-generate/generate-pdf',
    });
    expect(saveAs).toHaveBeenCalledWith(pdf, 'Ejecutoria.pdf');
  });

  it('propagates download errors without saving an invalid file', async () => {
    const error = new Error('Unauthorized');
    http.request.mockRejectedValue(error);

    await expect(downloadProtectedPdf('/pdf/expdocres/Resolucion.pdf', 'Resolucion.pdf')).rejects.toBe(error);

    expect(saveAs).not.toHaveBeenCalled();
  });

  it('downloads protected attachments without restricting their MIME type', async () => {
    const document = new Blob(['document'], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    http.request.mockResolvedValue({
      data: document,
      headers: { 'content-type': document.type },
    });

    await downloadProtectedFile('/files/docs/example.docx', 'example.docx');

    expect(http.request).toHaveBeenCalledWith({
      method: 'GET',
      responseType: 'blob',
      url: '/files/docs/example.docx',
    });
    expect(saveAs).toHaveBeenCalledWith(document, 'example.docx');
  });

  it('rejects JSON success responses instead of saving them as documents', async () => {
    const errorPayload = new Blob([JSON.stringify({ message: 'Document unavailable' })], {
      type: 'application/json',
    });
    http.request.mockResolvedValue({
      data: errorPayload,
      headers: { 'content-type': 'application/json' },
    });

    await expect(requestProtectedBlob('/files/missing.pdf')).rejects.toThrow('Document unavailable');
    expect(saveAs).not.toHaveBeenCalled();
  });

  it('normalizes absolute and /api document URLs for the Axios base URL', () => {
    expect(toProtectedApiPath('/api/files/process/file.pdf')).toBe('/files/process/file.pdf');
    expect(toProtectedApiPath('/files/process/file.pdf')).toBe('/files/process/file.pdf');
    expect(toProtectedApiPath('blob:local-document')).toBeNull();
    expect(toProtectedApiPath('https://external.example/document.pdf')).toBeNull();
  });

  it('loads protected PDF templates as bytes through the authenticated client', async () => {
    const bytes = new ArrayBuffer(8);
    http.request.mockResolvedValue({ data: bytes, headers: { 'content-type': 'application/pdf' } });

    const response = await requestProtectedArrayBuffer('/pdf/funflat2026');

    expect(http.request).toHaveBeenCalledWith({
      method: 'GET',
      responseType: 'arraybuffer',
      url: '/pdf/funflat2026',
    });
    expect(response.data).toBe(bytes);
  });

  it('encodes every protected file path segment exactly once', () => {
    expect(buildProtectedFilePath('pqrs', 'evidence #1?.pdf')).toBe('/files/pqrs/evidence%20%231%3F.pdf');
    expect(buildProtectedFilePath('process/2026/0084', 'already%20encoded.pdf')).toBe('/files/process/2026/0084/already%20encoded.pdf');
  });
});
