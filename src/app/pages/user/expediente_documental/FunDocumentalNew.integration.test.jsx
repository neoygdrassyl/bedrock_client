import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import FunDocumentalNew from './FunDocumentalNew';
const mocks = vi.hoisted(() => ({ origin: vi.fn(), legacy: vi.fn(), fund: vi.fn() }));
vi.mock('./hooks/useDocumentaryOrigin', () => ({ useDocumentaryOrigin: mocks.origin }));
vi.mock('./hooks/useExpedienteDocumental', () => ({ useExpedienteDocumental: mocks.legacy }));
vi.mock('./hooks/useCentralProjectLegalForm', () => ({ useCentralProjectLegalForm: () => { throw new Error('Legacy writer mounted'); } }));
vi.mock('./ui/organisms/CanonicalDocumentaryWorkspace', () => ({ CanonicalDocumentaryWorkspace: () => <div>Recepción canónica</div> }));
vi.mock('../document_requirements/ProjectDocumentConfigurationPanel', () => ({ default: () => null }));
vi.mock('../shared/UnifiedDocumentEntryModal', () => ({ default: () => null }));
vi.mock('./ui/organisms/DocumentalReviewTable', () => ({ DocumentalReviewTable: () => null }));
vi.mock('./ui/organisms/LegalFormControls', () => ({ LegalFormControls: () => null }));
vi.mock('./ui/organisms/LegalFormVrDialog', () => ({ LegalFormVrDialog: () => null }));
function Traditional() { mocks.fund(); return <div>Tradicional</div>; }
beforeEach(() => { vi.clearAllMocks(); });
it('does not call legacy loaders while resolving source or when canonical', async () => {
  mocks.origin.mockReturnValue({ origin:null, loading:true, refresh:vi.fn() });
  const { rerender } = render(<FunDocumentalNew currentId={1} traditionalContent={<Traditional />} />);
  expect(screen.getByRole('status')).toHaveTextContent('Consultando');
  expect(mocks.legacy).not.toHaveBeenCalled(); expect(mocks.fund).not.toHaveBeenCalled();
  mocks.origin.mockReturnValue({ origin:{ mode:'canonical', project:{fun0Id:1,idPublic:'FUN'}, publication:{configurationId:1,releaseVersion:1} }, refresh:vi.fn() });
  rerender(<FunDocumentalNew currentId={1} traditionalContent={<Traditional />} />);
  await waitFor(() => expect(screen.getByText('Recepción canónica')).toBeInTheDocument());
  expect(mocks.legacy).not.toHaveBeenCalled(); expect(mocks.fund).not.toHaveBeenCalled();
});
