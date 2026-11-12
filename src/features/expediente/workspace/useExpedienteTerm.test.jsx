import { describe, expect, it } from 'vitest';
import { render, renderHook, screen } from '@testing-library/react';
import dayjs from 'dayjs';
import { useClocksManager } from '../clocks/hooks/useClocksManager';
import { getDefaultPhaseIndex } from '../clocks/utils/phaseTerm';
import { TermStrip } from '../clocks/components/TermStrip';
import { SidebarInfo } from '../clocks/components/SidebarInfo';
import { useExpedienteTerm } from './useExpedienteTerm';

const LDF = { state: 5, date_start: '2026-01-05', name: 'Radicación en legal y debida forma' };
const ACTA = { state: 30, date_start: '2026-02-02', name: 'Acta parte 1', desc: 'ACTA PARTE 1 OBSERVACIONES: NO CUMPLE' };
const routeClock = (phaseEstudio) => ({ state: 1001, name: 'phase_options', desc: JSON.stringify({ phase_estudio: phaseEstudio }) });

const expediente = (clocks) => ({ id: 77, id_public: '68001-1-26-9950', type: 'i', date: '2026-01-02', state: 5, fun_clocks: clocks });

/** The phase the Tiempos module itself (manager + pager) reports for the same item. */
function useEnginePhase(item) {
  const phaseOptionsClock = item.fun_clocks.find((clock) => String(clock.state) === '1001');
  const phaseOptions = phaseOptionsClock ? JSON.parse(phaseOptionsClock.desc) : {};
  const manager = useClocksManager(item, item.fun_clocks, undefined, dayjs().format('YYYY-MM-DD'), phaseOptions);
  return { manager, phase: manager.processPhases[getDefaultPhaseIndex(manager.processPhases)] };
}

describe('useExpedienteTerm (Tiempos engine)', () => {
  it.each([
    ['no stored route (default: notificar personal)', [LDF, ACTA], 'Notificación Observaciones', 10],
    ['notificar personal', [LDF, ACTA, routeClock({ notificationType: 'notificar', byAviso: false })], 'Notificación Observaciones', 10],
    ['notificar por aviso', [LDF, ACTA, routeClock({ notificationType: 'notificar', byAviso: true })], 'Notificación Observaciones', 15],
    ['comunicar (communication registered)', [LDF, ACTA, { state: 33, date_start: '2026-02-03' }, routeClock({ notificationType: 'comunicar', byAviso: false })], 'Correcciones del Solicitante', 30],
    ['comunicar (communication pending)', [LDF, ACTA, routeClock({ notificationType: 'comunicar', byAviso: false })], 'Estudio y Observaciones', 20],
  ])('%s: picks the same phase and figures as the engine', (_label, clocks, title, totalDays) => {
    const item = expediente(clocks);
    const { result: engine } = renderHook(() => useEnginePhase(item));
    const { result } = renderHook(() => useExpedienteTerm(item));

    expect(engine.current.phase.title).toBe(title);
    expect(result.current.phaseTitle).toBe(title);
    expect(result.current.totalDays).toBe(totalDays);
    expect(result.current.usedDays).toBe(engine.current.phase.usedDays);
    expect(result.current.limitDate).toBe(engine.current.phase.limitDate);
  });

  it('renders exactly what the Tiempos strip renders for the same item', () => {
    const item = expediente([LDF, ACTA, routeClock({ notificationType: 'notificar', byAviso: true })]);
    const { result: engine } = renderHook(() => useEnginePhase(item));
    const { result } = renderHook(() => useExpedienteTerm(item));

    render(<TermStrip manager={engine.current.manager} />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(result.current.phaseTitle);
    expect(screen.getByTestId('tiempos-term-text')).toHaveTextContent(result.current.text);
    expect(screen.getByTestId('tiempos-term-ratio')).toHaveTextContent(result.current.ratioText);
  });

  it('the phase panel (real SidebarInfo, using the shared phase helpers) opens on the same phase', () => {
    const item = expediente([LDF, ACTA]);
    const { result: engine } = renderHook(() => useEnginePhase(item));
    const { result } = renderHook(() => useExpedienteTerm(item));

    const { container } = render(<SidebarInfo manager={engine.current.manager} />);

    expect(container.querySelector('.tc-phase-summary-title')).toHaveTextContent(result.current.phaseTitle);
  });

  it('follows new clocks: registering the notification moves the term to the next phase', () => {
    const before = expediente([LDF, ACTA]);
    const { result, rerender } = renderHook(({ item }) => useExpedienteTerm(item), { initialProps: { item: before } });
    expect(result.current.phaseTitle).toBe('Notificación Observaciones');

    rerender({ item: expediente([LDF, ACTA, { state: 32, date_start: '2026-02-10' }]) });
    expect(result.current.phaseTitle).toBe('Correcciones del Solicitante');
    expect(result.current.totalDays).toBe(30);
  });

  it('without a clocks array: "Sin estado", or the loading placeholder', () => {
    expect(renderHook(() => useExpedienteTerm({ id: 1, id_public: 'X' })).result.current.kind).toBe('unknown');
    expect(renderHook(() => useExpedienteTerm(null, { loading: true })).result.current.kind).toBe('loading');
  });
});
