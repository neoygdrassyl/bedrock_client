import { beforeEach, describe, expect, it, vi } from 'vitest';
import { logEvent } from '@/shared/observability/logger';
import '@/shared/utils/dayjs.config';
import { generateClocks } from '../config/clocks.definitions';
import { FUN_0_TYPE_TIME } from '../hooks/useClocksManager';
import {
  buildClockGroups,
  diffVisibleClockRows,
  filterClocksAfterDesist,
  flattenClockRows,
  getDefinitionClock,
  isClockRowHidden,
} from './clockRows';

vi.mock('@/shared/observability/logger', () => ({ logEvent: vi.fn(), logError: vi.fn() }));

const makeManager = (clocks = []) => ({
  getClock: (state) => clocks.find((clock) => String(clock.state) === String(state) && clock.version === undefined) || null,
  getClockVersion: (state, version) => clocks.find((clock) => String(clock.state) === String(state) && String(clock.version) === String(version)) || null,
});

describe('isClockRowHidden', () => {
  const manager = makeManager([{ state: 30, date_start: '2026-02-10' }, { state: 35, date_start: '' }, { state: 300, version: 2, date_start: '2026-02-12' }]);
  const hidden = (value, clock = null) => isClockRowHidden({ value, clock, ...manager });

  it('shows a plain event', () => {
    expect(hidden({ state: 5 })).toBe(false);
  });

  it('hides an event switched off by its definition', () => {
    expect(hidden({ state: 5, show: false })).toBe(true);
  });

  it('hides an event until the clock it requires has a date', () => {
    expect(hidden({ state: 32, requiredClock: 30 })).toBe(false);
    expect(hidden({ state: 36, requiredClock: 35 })).toBe(true);
    expect(hidden({ state: 36, requiredClock: 999 })).toBe(true);
  });

  it('resolves the required clock in the version of the event, falling back to the base one', () => {
    expect(hidden({ state: 350, version: 2, requiredClock: 300 })).toBe(false);
    expect(hidden({ state: 350, version: 3, requiredClock: 300 })).toBe(true);
    expect(hidden({ state: 31, version: 3, requiredClock: 30 })).toBe(false);
  });

  it('hides an optional event only while it has no record', () => {
    expect(hidden({ state: 33, optional: true })).toBe(true);
    expect(hidden({ state: 33, optional: true }, { state: 33, date_start: '' })).toBe(false);
  });
});

describe('getDefinitionClock', () => {
  it('reads the versioned clock for a versioned definition and the base clock otherwise', () => {
    const base = { state: 300, date_start: '2026-02-01' };
    const versioned = { state: 300, version: 2, date_start: '2026-02-12' };
    const manager = makeManager([base, versioned]);

    expect(getDefinitionClock({ state: 300 }, manager)).toBe(base);
    expect(getDefinitionClock({ state: 300, version: 2 }, manager)).toBe(versioned);
    expect(getDefinitionClock({ state: 300, version: 9 }, manager)).toBeNull();
  });
});

describe('filterClocksAfterDesist', () => {
  const items = [
    { title: 'Radicación' }, { state: 5, name: 'Legal y debida forma' },
    { title: 'Desistimiento' }, { state: -5, name: 'Declaración' },
    { title: 'Revisión y Viabilidad' }, { state: 61, name: 'Acto de viabilidad' },
    { title: 'Pagos' }, { state: 62, name: 'Pago' },
    { title: 'Ejecutoria' }, { state: 99, name: 'Ejecutoria' },
  ];

  it('returns the same list while the process is not desisted', () => {
    expect(filterClocksAfterDesist(items, false)).toBe(items);
  });

  it('drops the sections after the desistimiento block, except Ejecutoria', () => {
    expect(filterClocksAfterDesist(items, true).map((item) => item.title || item.name)).toEqual([
      'Radicación', 'Legal y debida forma', 'Desistimiento', 'Declaración', 'Ejecutoria', 'Ejecutoria',
    ]);
  });

  it('keeps everything when the desisted process has no desistimiento block', () => {
    const plain = items.filter((item) => item.title !== 'Desistimiento' && item.state !== -5);
    expect(filterClocksAfterDesist(plain, true)).toEqual(plain);
  });
});

describe('buildClockGroups', () => {
  const clocks = [{ state: 5, date_start: '2026-02-02', name: 'LDF GUARDADO' }, { state: 33, date_start: '' }];
  const manager = makeManager(clocks);
  const definitions = [
    { state: 1, name: 'Sin grupo' },
    { title: 'Radicación' },
    { state: 5, name: 'Legal y debida forma' },
    { state: 3, name: 'Fecha manual', manualDate: '2026-01-30' },
    { state: 33, name: 'Notificación por aviso', icon: 'empty' },
    { state: 34, icon: 'empty', optional: true },
    { title: 'Grupo oculto', show: false },
    { state: 70, name: 'No se muestra' },
    { title: 'Expedición' },
  ];

  it('lays the definitions out as groups with their rows, keeping the definition index', () => {
    const groups = buildClockGroups(definitions, manager);

    expect(groups.map((group) => [group.index, group.title, group.rows.map((row) => row.index)])).toEqual([
      [1, 'Radicación', [2, 3, 4, 5]],
      [8, 'Expedición', []],
    ]);
  });

  it('describes each row: date, record, optional and hidden flags', () => {
    const [ldf, manual, aviso, optional] = buildClockGroups(definitions, manager)[0].rows;

    expect(ldf).toMatchObject({ state: 5, name: 'Legal y debida forma', groupTitle: 'Radicación', groupIndex: 1, date: '2026-02-02', hasDate: true, optional: false, hidden: false });
    expect(ldf.clock).toBe(clocks[0]);
    expect(ldf.value).toBe(definitions[2]);
    expect(manual).toMatchObject({ date: '2026-01-30', hasDate: true, clock: null });
    // Stored without a date: shown as an optional event still to register.
    expect(aviso).toMatchObject({ date: '', hasDate: false, optional: true, hidden: false });
    expect(optional).toMatchObject({ name: '', hasDate: false, optional: true, hidden: true });
  });

  it('flattens the groups in table order and tolerates missing definitions', () => {
    expect(flattenClockRows(buildClockGroups(definitions, manager)).map((row) => row.state)).toEqual([5, 3, 33, 34]);
    expect(buildClockGroups(undefined, manager)).toEqual([]);
    expect(flattenClockRows(undefined)).toEqual([]);
  });
});

describe('diffVisibleClockRows', () => {
  const row = (state, name, extra = {}) => ({ state, name, date: '', hasDate: false, hidden: false, ...extra });
  const dated = (state, name, date, extra = {}) => row(state, name, { date, hasDate: true, ...extra });
  const groups = (...rows) => [{ title: 'Estudio y Observaciones', rows }];

  it('reports no change for the same visible rows', () => {
    const before = groups(row(30, 'Acta'), dated(32, 'Notificación personal', '2026-02-10'));
    expect(diffVisibleClockRows(before, before)).toEqual({ added: [], removed: [], hiddenDated: [], relabeledDated: [], appearingDated: [] });
  });

  it('lists the events that appear, and separately the ones that come back with a stored date', () => {
    const change = diffVisibleClockRows(
      groups(row(30, 'Acta')),
      groups(row(30, 'Acta'), row(31, 'Citación'), dated(33, 'Notificación por aviso', '2026-02-12')),
    );

    expect(change.added).toEqual([{ name: 'Citación', date: '' }, { name: 'Notificación por aviso', date: '2026-02-12' }]);
    expect(change.appearingDated).toEqual([{ name: 'Notificación por aviso', date: '2026-02-12' }]);
    expect(change.removed).toEqual([]);
  });

  it('lists the events that stop being shown, flagging the ones that hold a registered date', () => {
    const change = diffVisibleClockRows(
      groups(row(30, 'Acta'), row(31, 'Citación'), dated(32, 'Notificación personal', '2026-02-10')),
      groups(row(30, 'Acta')),
    );

    expect(change.removed).toEqual([{ name: 'Citación', date: '' }, { name: 'Notificación personal', date: '2026-02-10' }]);
    expect(change.hiddenDated).toEqual([{ name: 'Notificación personal', date: '2026-02-10' }]);
    expect(change.added).toEqual([]);
  });

  it('treats a row that becomes hidden as removed and one that was hidden as added', () => {
    const change = diffVisibleClockRows(
      groups(dated(32, 'Notificación personal', '2026-02-10'), row(33, 'Por aviso', { hidden: true })),
      groups(dated(32, 'Notificación personal', '2026-02-10', { hidden: true }), row(33, 'Por aviso')),
    );

    expect(change.hiddenDated).toEqual([{ name: 'Notificación personal', date: '2026-02-10' }]);
    expect(change.added).toEqual([{ name: 'Por aviso', date: '' }]);
  });

  it('reports a dated event shown under another name when two definitions share its clock state', () => {
    const change = diffVisibleClockRows(
      groups(dated(33, 'Notificación por aviso', '2026-02-12')),
      groups(dated(33, 'Comunicación', '2026-02-12')),
    );

    expect(change.relabeledDated).toEqual([{ name: 'Notificación por aviso', nextName: 'Comunicación', date: '2026-02-12' }]);
    expect(change.added).toEqual([{ name: 'Comunicación', date: '2026-02-12' }]);
    expect(change.removed).toEqual([{ name: 'Notificación por aviso', date: '2026-02-12' }]);
    expect(change.hiddenDated).toEqual([]);
    expect(change.appearingDated).toEqual([]);
  });

  it('does not flag a relabelled event without a date', () => {
    const change = diffVisibleClockRows(groups(row(33, 'Notificación por aviso')), groups(row(33, 'Comunicación')));
    expect(change.relabeledDated).toEqual([]);
    expect(change.added).toHaveLength(1);
  });

  it('tells versions of the same state apart and ignores rows without a state', () => {
    const change = diffVisibleClockRows(
      groups(dated(300, 'Suspensión', '2026-02-03', { version: 1 }), row(false, 'Separador'), row(null, 'Otro')),
      groups(dated(300, 'Suspensión', '2026-02-03', { version: 2 }), row(undefined, 'Nuevo separador')),
    );

    expect(change.hiddenDated).toEqual([{ name: 'Suspensión', date: '2026-02-03' }]);
    expect(change.appearingDated).toEqual([{ name: 'Suspensión', date: '2026-02-03' }]);
    expect(change.removed).toHaveLength(1);
    expect(change.added).toHaveLength(1);
  });

  it('names an event without a name by its state', () => {
    expect(diffVisibleClockRows(groups(), groups(row(61, ''))).added).toEqual([{ name: 'Evento 61', date: '' }]);
  });
});

describe('buildClockGroups: rows before the first title', () => {
  beforeEach(() => logEvent.mockClear());

  it('reports, in development, a definition that comes before any title', () => {
    const manager = makeManager([]);
    const groups = buildClockGroups([
      { state: 1, name: 'Sin grupo' },
      { state: 2 },
      { title: 'Radicación' },
      { state: 5, name: 'Legal y debida forma' },
      { title: 'Grupo oculto', show: false },
      { state: 70, name: 'Oculto por definición' },
    ], manager);

    expect(groups.map((group) => group.title)).toEqual(['Radicación']);
    expect(logEvent).toHaveBeenCalledTimes(1);
    expect(logEvent).toHaveBeenCalledWith('warn', 'clock_rows_without_group', expect.objectContaining({
      data: { rows: [{ index: 0, state: 1, name: 'Sin grupo' }, { index: 1, state: 2, name: null }] },
    }));
  });

  it('stays silent for rows left out with a group hidden by definition', () => {
    buildClockGroups([
      { title: 'Radicación' },
      { state: 5 },
      { title: 'Grupo oculto', show: false },
      { state: 70 },
    ], makeManager([]));

    expect(logEvent).not.toHaveBeenCalled();
  });
});

describe('generateClocks never emits a row before its first title', () => {
  const none = { exists: false };
  const desistClocks = [
    { state: -50, version: '-1', date_start: '2026-03-02' },
    { state: -5, version: '-3', date_start: '2026-04-02' },
    { state: -6, version: '-4', date_start: '2026-05-02' },
  ];
  const suspension = { exists: true, start: { date_start: '2026-02-10' }, end: { date_start: '2026-02-20' } };
  const extension = { exists: true, start: { date_start: '2026-02-12' }, end: { date_start: '2026-03-01' } };
  const acta = { state: 30, date_start: '2026-02-15', desc: 'ACTA PARTE 1 OBSERVACIONES: NO CUMPLE' };

  // `generateClocks` only branches on OA/prórroga (`regexChecker_isOA_2`), on the recorded
  // desistimiento, suspension and extension clocks and on the phase options; the cases
  // below cover each branch for the classes of expediente the workspace opens.
  const cases = [
    ['licencia de construcción', { tipo: 'D', tramite: 'A' }, { type: 'iii' }, []],
    ['licencia con acta, suspensiones y prórroga por complejidad', { tipo: 'D', tramite: 'A' }, { type: 'iv' }, [acta], { suspensionPreActa: suspension, suspensionPostActa: suspension, extension }],
    ['licencia comunicada (grupos de notificación ocultos)', { tipo: 'D', tramite: 'A' }, { type: 'ii' }, [], { phaseOptions: { phase_estudio: { notificationType: 'comunicar', byAviso: false }, phase_correcciones: { notificationType: 'comunicar', byAviso: true } } }],
    ['otras actuaciones', { tipo: 'G', tramite: 'A' }, { type: 'oa' }, []],
    ['prórroga (OA, sin sección de estudio)', { tipo: 'D', tramite: 'B' }, { type: 'oa' }, []],
    ['desistimiento', { tipo: 'D', tramite: 'A' }, { type: 'iii' }, desistClocks],
    ['prórroga desistida', { tipo: 'D', tramite: 'B' }, { type: 'oa' }, desistClocks],
    ['propiedad horizontal', { tipo: 'G', tramite: 'A', m_lic: 'ph' }, { type: 'i' }, []],
    ['subdivisión', { tipo: 'C', tramite: 'A', m_sub: 'B' }, { type: 'i' }, []],
    ['sin FUN 1 cargado', null, { type: undefined }, []],
  ];

  it.each(cases)('%s', (_label, child1, currentItem, clocks, extra = {}) => {
    const manager = makeManager(clocks);
    const definitions = generateClocks({
      ...manager,
      currentItem: { id: 1, ...currentItem },
      child1,
      viaTime: () => 0,
      FUN_0_TYPE_TIME,
      suspensionPreActa: none,
      suspensionPostActa: none,
      extension: none,
      namePayment: 'Impuestos municipales',
      conGI: false,
      ...extra,
    });

    expect(definitions.length).toBeGreaterThan(0);
    expect(definitions[0].title).toBeTruthy();
    expect(definitions[0].show).not.toBe(false);

    [false, true].forEach((isDesisted) => {
      const shown = filterClocksAfterDesist(definitions, isDesisted);
      expect(shown[0]).toBe(definitions[0]);

      logEvent.mockClear();
      const groups = buildClockGroups(shown, manager);
      expect(logEvent).not.toHaveBeenCalled();
      expect(groups[0].index).toBe(0);

      // Every row of a visible group is laid out; only groups switched off by their own
      // definition (`show: false`) leave rows out.
      let visible = true;
      const expected = shown.filter((item) => {
        if (item.title) { visible = item.show !== false; return false; }
        return visible;
      }).length;
      expect(flattenClockRows(groups)).toHaveLength(expected);
    });
  });
});
