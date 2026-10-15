import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  received: {},
  stub: (name) => function GeneratorStub(props) {
    mocks.received[name] = props;
    return <div data-testid={`generator-${name}`} />;
  },
}));

vi.mock('../../../fun_forms/components/fun_pdf', () => ({ default: mocks.stub('fun_pdf') }));
vi.mock('../../../fun_forms/components/fun_pdf_check', () => ({ default: mocks.stub('fun_pdf_check') }));
vi.mock('../../../fun_forms/components/fun_doc_confirminc', () => ({ default: mocks.stub('fun_doc_confirminc') }));
vi.mock('../../../fun_forms/components/fun_doc_confirmlegal', () => ({ default: mocks.stub('fun_doc_confirmlegal') }));
vi.mock('../../../fun_forms/components/fun_sign_pdf.component', () => ({ default: mocks.stub('fun_sign_pdf') }));
vi.mock('../../../fun_forms/components/fun_seals', () => ({ default: mocks.stub('fun_seals') }));
vi.mock('../../../fun_forms/components/fun_alertNeighbour', () => ({ default: mocks.stub('fun_alert_neighbour') }));
vi.mock('../../../fun_forms/components/fun_d_control.component', () => ({ default: mocks.stub('fun_d_control') }));
vi.mock('../../../fun_forms/components/fun_d_control.component_2', () => ({ default: mocks.stub('fun_d_control_2') }));
vi.mock('../../../fun_forms/components/fun_doc_abdicate.component', () => ({ default: mocks.stub('fun_doc_abdicate') }));
vi.mock('../../../fun_forms/components/fun_report_data_edit', () => ({ default: mocks.stub('fun_report_data_edit') }));
vi.mock('../../../fun_forms/components/fun_doc_certification.component', () => ({ default: mocks.stub('fun_doc_certification') }));
vi.mock('@/app/services/fun.service', () => ({ default: { get: mocks.get } }));

const { DocumentGeneratorsPanel } = await import('./DocumentGeneratorsPanel');
const { DOCUMENT_GENERATORS } = await import('../../../fun_forms/components/documentGeneratorsRegistry');

const LEGACY_ITEM = { id: 9, id_public: 'FUN-9', state: 5, rules: '0', fun_1s: [{ id: 1, tramite: 'A' }], centralReleaseId: null };
const row = (title) => screen.getByText(title).closest('li');

beforeEach(() => { vi.clearAllMocks(); mocks.received = {}; vi.stubEnv('VITE_GLOBAL_ID', 'cb2'); });
afterEach(() => { vi.unstubAllEnvs(); });

describe('DocumentGeneratorsPanel', () => {
  it('lists the registry generators with the legacy gates and mounts one on demand', async () => {
    const user = userEvent.setup();
    mocks.get.mockResolvedValue({ data: LEGACY_ITEM });
    render(<DocumentGeneratorsPanel currentId={9} currentVersion={1} swaMsg={{}} translation={{}} globals={{}} />);
    await screen.findByText('Hoja de control documental');
    expect(mocks.get).toHaveBeenCalledWith(9);
    // Tenant-gated generators stay hidden like in the legacy module; the rest are listed.
    const expected = DOCUMENT_GENERATORS.filter((entry) => !entry.gates.tenant).map((entry) => entry.title);
    expect(screen.getAllByRole('listitem').map((item) => item.querySelector('p').textContent)).toEqual(expected);
    expect(within(row('Hoja de control documental')).getByText('Legacy')).toHaveAttribute('data-tone', 'neutral');
    expect(within(row('Hoja de control documental')).queryByText('Lectura')).not.toBeInTheDocument();
    expect(screen.queryByTestId('generator-fun_d_control')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Generar Hoja de control documental' }));
    expect(screen.getByTestId('generator-fun_d_control')).toBeInTheDocument();
    expect(mocks.received.fun_d_control).toMatchObject({ currentItem: LEGACY_ITEM, currentVersion: 1 });
    expect(typeof mocks.received.fun_d_control.requestUpdate).toBe('function');
  });

  it('keeps one generator open at a time so shared DOM ids never collide', async () => {
    const user = userEvent.setup();
    mocks.get.mockResolvedValue({ data: LEGACY_ITEM });
    render(<DocumentGeneratorsPanel currentId={9} currentVersion={1} swaMsg={{}} translation={{}} globals={{}} />);
    await screen.findByText('Hoja de control documental');
    await user.click(screen.getByRole('button', { name: 'Generar Hoja de control documental' }));
    await user.click(screen.getByRole('button', { name: 'Generar Citación a vecinos' }));
    expect(screen.getByTestId('generator-fun_alert_neighbour')).toBeInTheDocument();
    expect(screen.queryByTestId('generator-fun_d_control')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cerrar Citación a vecinos' }));
    expect(screen.queryByTestId('generator-fun_alert_neighbour')).not.toBeInTheDocument();
  });

  it('tags inventory-aware generators as new model for canonical expedientes', async () => {
    mocks.get.mockResolvedValue({ data: { ...LEGACY_ITEM, centralReleaseId: 'rel-1' } });
    render(<DocumentGeneratorsPanel currentId={9} currentVersion={1} />);
    await screen.findByText('Hoja de control documental');
    expect(within(row('Hoja de control documental')).getByText('Modelo nuevo')).toHaveAttribute('data-tone', 'info');
    expect(within(row('Lista de chequeo')).getByText('Modelo nuevo')).toBeInTheDocument();
    expect(within(row('Valla')).getByText('Legacy')).toBeInTheDocument();
    // confirminc reads /requirements/missing, so it is part of the new model too.
    expect(within(row('Recordatorio de radicación incompleta')).getByText('Modelo nuevo')).toBeInTheDocument();
    // Save capability tags only appear in the new model.
    expect(within(row('Hoja de control documental')).getByText('Lectura')).toBeInTheDocument();
    expect(within(row('Constancia de legal y debida forma')).getByText('Lectura + guardado')).toBeInTheDocument();
  });

  it('disables state-gated generators with the reason', async () => {
    mocks.get.mockResolvedValue({ data: { ...LEGACY_ITEM, state: 1 } });
    render(<DocumentGeneratorsPanel currentId={9} currentVersion={1} />);
    await screen.findByText('Hoja de control documental');
    const control = row('Hoja de control documental');
    expect(within(control).getByText('No disponible')).toBeInTheDocument();
    expect(within(control).getByRole('button', { name: /Generar/ })).toBeDisabled();
    expect(within(row('Formulario Único Nacional')).getByRole('button', { name: /Generar/ })).toBeEnabled();
  });

  it('shows a retry action when the expediente cannot be loaded', async () => {
    const user = userEvent.setup();
    mocks.get.mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce({ data: LEGACY_ITEM });
    render(<DocumentGeneratorsPanel currentId={9} currentVersion={1} />);
    await user.click(await screen.findByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('Hoja de control documental')).toBeInTheDocument();
  });
});
