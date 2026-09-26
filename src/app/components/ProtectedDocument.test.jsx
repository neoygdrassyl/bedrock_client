import { render, screen, waitFor } from '@testing-library/react';

import { requestProtectedBlob } from '@/app/utils/pdfDownload';
import { ProtectedDocumentPreview } from './ProtectedDocument';

vi.mock('@/app/utils/pdfDownload', async (importOriginal) => {
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

    expect(await screen.findByRole('alert')).toHaveTextContent('no se puede previsualizar');
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });
});
