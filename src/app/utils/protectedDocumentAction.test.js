import { downloadProtectedFile, requestProtectedArrayBuffer } from './pdfDownload';
import {
  downloadProtectedFileWithFeedback,
  requestProtectedArrayBufferWithFeedback,
} from './protectedDocumentAction';
import { swalClose, swalError } from './swalAdapter';

vi.mock('./pdfDownload', () => ({
  downloadProtectedFile: vi.fn(),
  requestProtectedArrayBuffer: vi.fn(),
}));

vi.mock('./swalAdapter', () => ({
  swalError: vi.fn(),
  swalClose: vi.fn(),
}));

describe('downloadProtectedFileWithFeedback', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows a controlled error instead of leaving an unhandled rejection', async () => {
    downloadProtectedFile.mockRejectedValue(new Error('Forbidden'));

    await expect(downloadProtectedFileWithFeedback('/files/pqrs/evidence.pdf', 'evidence.pdf')).resolves.toBeNull();

    expect(swalError).toHaveBeenCalledWith({
      title: 'ERROR AL DESCARGAR',
      text: 'Forbidden',
    });
  });

  it('closes loading feedback when a protected template cannot be loaded', async () => {
    requestProtectedArrayBuffer.mockRejectedValue(new Error('Template missing'));

    await expect(requestProtectedArrayBufferWithFeedback('/pdf/form')).resolves.toBeNull();

    expect(swalClose).toHaveBeenCalled();
    expect(swalError).toHaveBeenCalledWith({
      title: 'ERROR AL CARGAR',
      text: 'Template missing',
    });
  });
});
