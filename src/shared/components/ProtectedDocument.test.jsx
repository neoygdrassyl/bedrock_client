import { render, screen, waitFor } from '@testing-library/react';

import { requestProtectedBlob } from '@/shared/utils/pdfDownload';
import { ProtectedDocumentPreview } from './ProtectedDocument';

vi.mock('@/shared/utils/pdfDownload', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    requestProtectedBlob: vi.fn(),
  };
});

describe('ProtectedDocumentPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    URL.createObjectURL = vi.fn(() => 'blob:protected-document');
    URL.revokeObjectURL = vi.fn();
  });

  it('loads protected previews through the authenticated blob request and revokes the URL', async () => {
    requestProtectedBlob.mockResolvedValue({ data: new Blob(['pdf'], { type: 'application/pdf' }) });

    const { unmount } = render(
      <ProtectedDocumentPreview
        source="/api/files/process/resolution.pdf"
        title="Resolution preview"
      />,
    );

    await waitFor(() => expect(screen.getByTitle('Resolution preview')).toHaveAttribute('src', 'blob:protected-document'));
    expect(requestProtectedBlob).toHaveBeenCalledWith('/files/process/resolution.pdf');

    unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:protected-document');
  });

  it('rejects active HTML instead of executing it in the preview iframe', async () => {
    requestProtectedBlob.mockResolvedValue({
      data: new Blob(['<script>localStorage.clear()</script>'], { type: 'text/html' }),
      headers: { 'content-type': 'text/html' },
    });

    render(<ProtectedDocumentPreview source="/api/files/process/untrusted.html" />);

    const state = await screen.findByRole('status', { name: 'No se pudo cargar el documento' });
    expect(state).toHaveTextContent('Este tipo de archivo (text/html) no se puede previsualizar.');
    expect(state).toHaveAttribute('data-illustrated-state', 'load-error');
    expect(screen.queryByTitle('Vista previa del documento')).not.toBeInTheDocument();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('shows the not-found state when the protected file answers 404', async () => {
    requestProtectedBlob.mockRejectedValue(Object.assign(new Error('Not found'), { response: { status: 404 } }));

    render(<ProtectedDocumentPreview source="/api/files/process/missing.pdf" />);

    const state = await screen.findByRole('status', { name: 'No se pudo cargar el documento' });
    expect(state).toHaveAttribute('data-illustrated-state', 'not-found');
  });

  it('shows the image placeholder when a protected image fails', async () => {
    requestProtectedBlob.mockRejectedValue(new Error('Network Error'));

    render(<ProtectedDocumentPreview kind="img" source="/api/files/process/photo.png" alt="Foto" />);

    const state = await screen.findByRole('status', { name: 'Imagen no disponible' });
    expect(state).toHaveAttribute('data-illustrated-state', 'image');
    expect(screen.queryByRole('img', { name: 'Foto' })).not.toBeInTheDocument();
  });
});
