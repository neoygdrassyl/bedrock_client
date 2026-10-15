import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  received: {},
  get: vi.fn(),
  stub: (name) => function GeneratorStub(props) {
    mocks.received[name] = props;
    return <div data-testid={`generator-${name}`} />;
  },
}));

vi.mock('./fun_pdf', () => ({ default: mocks.stub('fun_pdf') }));
vi.mock('./fun_pdf_check', () => ({ default: mocks.stub('fun_pdf_check') }));
vi.mock('./fun_doc_confirminc', () => ({ default: mocks.stub('fun_doc_confirminc') }));
vi.mock('./fun_doc_confirmlegal', () => ({ default: mocks.stub('fun_doc_confirmlegal') }));
vi.mock('./fun_sign_pdf.component', () => ({ default: mocks.stub('fun_sign_pdf') }));
vi.mock('./fun_seals', () => ({ default: mocks.stub('fun_seals') }));
vi.mock('./fun_alertNeighbour', () => ({ default: mocks.stub('fun_alert_neighbour') }));
vi.mock('./fun_d_control.component', () => ({ default: mocks.stub('fun_d_control') }));
vi.mock('./fun_d_control.component_2', () => ({ default: mocks.stub('fun_d_control_2') }));
vi.mock('./fun_doc_abdicate.component', () => ({ default: mocks.stub('fun_doc_abdicate') }));
vi.mock('./fun_report_data_edit', () => ({ default: mocks.stub('fun_report_data_edit') }));
vi.mock('./fun_doc_certification.component', () => ({ default: mocks.stub('fun_doc_certification') }));
vi.mock('../fun_6.view', () => ({ default: () => null }));
vi.mock('./fun_moduleNav', () => ({ default: () => null }));
vi.mock('./fun_versionNav', () => ({ default: () => null }));
vi.mock('../../../../services/fun.service', () => ({ default: { get: mocks.get, loadPQRSxFUN: vi.fn(() => Promise.resolve({ data: [] })) } }));

const { DOCUMENT_GENERATORS, buildGeneratorContext, evaluateGenerator } = await import('./documentGeneratorsRegistry');
const { default: FUN_DOCS } = await import('./fun_docs');

// Legacy FUND list, in its historical order (state >= 5, rules allow neighbour notice).
const LEGACY_LABELS = [
  'PDF Formulario Único Nacional',
  'PDF Lista de Chekeo',
  'Documento de recordatorio incompleto',
  'Documento de Confirmación Legal y Debida Forma',
  'Valla',
  'DOCUMENTOS DE CITACIÓN A VECINOS',
  'HOJA DE CONTROL DOCUMENTAL',
  'HOJA DE CONTROL DE INVENTARIO',
  'Notificación Licencia - Renuncia de terminos',
  'CONTROL DE DOCUMENTO DE RECONOCIMIENTO',
  'CERTIFICACIONES',
];

const item = (over = {}) => ({ id: 9, id_public: 'FUN-9', state: 5, rules: '0;0', fun_1s: [{ id: 1, tramite: 'A' }], ...over });
const available = (fun0, globalId = 'cb2') => {
  const ctx = buildGeneratorContext({ currentItem: fun0, currentVersion: 1, requestUpdate: vi.fn(), globalId });
  return DOCUMENT_GENERATORS.filter((entry) => { const r = evaluateGenerator(entry, ctx); return r.visible && r.available; }).map((entry) => entry.id);
};

beforeEach(() => { vi.clearAllMocks(); mocks.received = {}; vi.stubEnv('VITE_GLOBAL_ID', 'cb2'); });
afterEach(() => { vi.unstubAllEnvs(); });

describe('documentGeneratorsRegistry', () => {
  it('keeps the legacy generators and order', () => {
    expect(DOCUMENT_GENERATORS.map((entry) => entry.label)).toEqual([...LEGACY_LABELS.slice(0, 5), 'Sello', ...LEGACY_LABELS.slice(5)]);
    expect(new Set(DOCUMENT_GENERATORS.map((entry) => entry.id)).size).toBe(DOCUMENT_GENERATORS.length);
  });

  it('applies the legacy state, neighbour-notice and tenant gates', () => {
    expect(available(item())).not.toContain('fun_seals');
    expect(available(item(), 'cb1')).toContain('fun_seals');
    const early = available(item({ state: 1 }));
    ['fun_doc_confirmlegal', 'fun_sign_pdf', 'fun_d_control', 'fun_d_control_2'].forEach((id) => expect(early).not.toContain(id));
    const noNotice = available(item({ rules: '1;0' }));
    expect(noNotice).not.toContain('fun_sign_pdf');
    expect(noNotice).not.toContain('fun_alert_neighbour');
    // OA modalities (B/D) keep the neighbour notice even when rules[0] == 1.
    expect(available(item({ rules: '1;0', fun_1s: [{ id: 1, tramite: 'B' }] }))).toContain('fun_alert_neighbour');
  });

  it('reports why a visible generator is not available', () => {
    const ctx = buildGeneratorContext({ currentItem: item({ state: 1 }), currentVersion: 1, globalId: 'cb2' });
    const result = evaluateGenerator(DOCUMENT_GENERATORS.find((entry) => entry.id === 'fun_d_control'), ctx);
    expect(result).toMatchObject({ visible: true, available: false });
    expect(result.reason).toMatch(/legal y debida forma/);
  });
});

describe('FUN_DOCS (legacy module) rendered from the registry', () => {
  it('renders the same list and props as before', async () => {
    mocks.get.mockResolvedValue({ data: item() });
    render(<FUN_DOCS currentId={9} currentVersion={1} swaMsg={{}} translation={{}} globals={{}} />);
    await waitFor(() => expect(screen.getByText('CERTIFICACIONES')).toBeInTheDocument());
    const labels = Array.from(document.querySelectorAll('label.fw-normal.text-info')).map((node) => node.textContent);
    expect(labels).toEqual(LEGACY_LABELS);
    expect(mocks.received.fun_doc_confirmlegal).toMatchObject({ VIEW_G: true, currentVersion: 1 });
    expect(typeof mocks.received.fun_d_control.requestUpdate).toBe('function');
    expect(mocks.received.fun_pdf).not.toHaveProperty('requestUpdate');
    expect(mocks.received.fun_doc_certification).toMatchObject({ id_related: 'FUN-9', related: 'fun' });
  });

  it('hides the state-gated generators before legal y debida forma', async () => {
    mocks.get.mockResolvedValue({ data: item({ state: 1, rules: '1' }) });
    render(<FUN_DOCS currentId={9} currentVersion={1} swaMsg={{}} translation={{}} globals={{}} />);
    await waitFor(() => expect(screen.getByText('CERTIFICACIONES')).toBeInTheDocument());
    const labels = Array.from(document.querySelectorAll('label.fw-normal.text-info')).map((node) => node.textContent);
    expect(labels).toEqual(['PDF Formulario Único Nacional', 'PDF Lista de Chekeo', 'Documento de recordatorio incompleto', 'Notificación Licencia - Renuncia de terminos', 'CONTROL DE DOCUMENTO DE RECONOCIMIENTO', 'CERTIFICACIONES']);
  });
});
