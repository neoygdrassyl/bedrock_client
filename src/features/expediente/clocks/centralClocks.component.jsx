import { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import dayjs from 'dayjs';

import { useClocksManager, useScheduleConfig } from './hooks/useClocksManager';
import { generateClocks } from './config/clocks.definitions';
import { ClockRow, ClockTableHeader, DEFAULT_CLOCK_COLUMN_VISIBILITY, formatClockDate, getClockColumnCount, getClockGridTemplate, getClockTableWidth } from './components/ClockRow';
import { buildClockGroups, diffVisibleClockRows, filterClocksAfterDesist, flattenClockRows } from './utils/clockRows';
import { Collapse, DisclosureCard } from './components/Disclosure';
import { NotificationRouteControl, describeRouteSaved } from './components/NotificationRouteControl';
import { PendingChecklist } from './components/PendingChecklist';
import { getFinishedPendingStatus } from '../workspace/expedientePendingStatus';
import { logError } from '@/shared/observability/logger';
import { SidebarInfo, openDaysBreakdownModal, openPhaseDetailModal } from './components/SidebarInfo';
import { TermStrip } from './components/TermStrip';
import { HolidayCalendar } from './components/HolidayCalendar';
import { ControlBar } from './components/ControlBar';
import { ScheduleModal } from './components/ScheduleModal';
import { AlarmsWidget } from './components/AlarmsWidget';
import { ToolsMenu } from './components/ToolsMenu';
import { useAlarms } from './hooks/useAlarms';
import { calcularDiasHabiles, sumarDiasHabiles } from './hooks/useClocksManager';
import { getIconSvg } from '../../../shared/utils/iconSvgString';
import { buildSchedulePayload, calculateLegalLimit } from './utils/scheduleUtils';
import { GanttLegend, GanttModal } from './components/gantt/GanttModal';
import { GanttChart, useGanttSeries } from './components/gantt/GanttChart';

import FUN_SERVICE from '../api/fun.service';

import './centralClocks.css';
import './gantt.css';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { Icon } from '@/shared/components/icon';
import { cn } from '@/shared/lib/utils';
import { getLicenseCompletionClock } from '../documental/shared/processClosure.helpers';

import { swalLoading, swalSuccess, swalError, swalConfirm, swalClose, swalFormDialog, Swal } from '../../../shared/utils/swalAdapter';
const _GLOBAL_ID = import.meta.env.VITE_GLOBAL_ID;

const getClockEditKey = (value, rowIndex) => `${String(value?.state ?? 'none')}::${String(value?.version ?? 'base')}::${rowIndex}`;

// Groups that carry the notification route of an act (stored in the `phase_options` clock, state 1001).
const ROUTE_GROUPS = {
  'Estudio y Observaciones': { phaseKey: 'phase_estudio', actLabel: 'acta de observaciones' },
  'Revisión y Viabilidad': { phaseKey: 'phase_correcciones', actLabel: 'acto de viabilidad' },
};
const DEFAULT_ROUTE = { notificationType: 'notificar', byAviso: false };

// View state of the module per expediente (collapsed groups, optional columns, open cards,
// table scroll). It outlives the component: switching tabs unmounts the events table.
const viewStateByExpediente = new Map();
const readViewState = (expedienteId) => viewStateByExpediente.get(expedienteId) || {};
const writeViewState = (expedienteId, patch) => {
  if (expedienteId === undefined || expedienteId === null) return;
  viewStateByExpediente.set(expedienteId, { ...readViewState(expedienteId), ...patch });
};

const OPTIONAL_CLOCK_COLUMNS = [
  { key: 'nextStep', label: 'Siguiente paso' },
  { key: 'scheduledAlarm', label: 'Alarma programada' },
  { key: 'scheduledLimit', label: 'Límite programado' },
];

export default function EXP_CLOCKS(props) {
  const { swaMsg, currentItem, currentVersion, outCodes } = props;
  // Seeded from the item so the table is complete on the first render (the effect below keeps it in sync).
  const [clocksData, setClocksData] = useState(() => currentItem?.fun_clocks || []);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [showTimeTravel, setShowTimeTravel] = useState(false);
  const [showAlarms, setShowAlarms] = useState(false); // Cerrado por defecto; se abre desde el botón flotante.
  const [showCalendar, setShowCalendar] = useState(false);

  const [systemDate, setSystemDate] = useState(dayjs().format('YYYY-MM-DD'));

  // Estado para secciones colapsables (Acordeón)
  const expedienteId = currentItem?.id;
  const [collapsedSections, setCollapsedSections] = useState(() => readViewState(expedienteId).collapsed || {});

  // ID fase activa para el resaltado
  const [activePhaseId, setActivePhaseId] = useState(null);
  const [showGanttModal, setShowGanttModal] = useState(false);
  const [ganttOpen, setGanttOpen] = useState(() => readViewState(expedienteId).ganttOpen ?? true);
  const [closureOpen, setClosureOpen] = useState(() => readViewState(expedienteId).closureOpen ?? true);
  const [visibleColumns, setVisibleColumns] = useState(() => ({ ...DEFAULT_CLOCK_COLUMN_VISIBILITY, ...readViewState(expedienteId).visibleColumns }));
  // Notification route: one save at a time (both phases live in the same stored clock).
  const [routeSave, setRouteSave] = useState({ phaseKey: null, busy: false, feedback: null });
  const [routeConfirm, setRouteConfirm] = useState(null);
  const routeSavingRef = useRef(false);
  const dateSavesInFlightRef = useRef(new Map());
  const [flashedRow, setFlashedRow] = useState(null);
  const flashTimeoutRef = useRef(null);

  useEffect(() => {
    writeViewState(expedienteId, { collapsed: collapsedSections, ganttOpen, closureOpen, visibleColumns });
  }, [expedienteId, collapsedSections, ganttOpen, closureOpen, visibleColumns]);
  const [pendingDateEdits, setPendingDateEdits] = useState({});
  const [isSavingPendingDates, setIsSavingPendingDates] = useState(false);
  const [archiveDate, setArchiveDate] = useState('');


  // Events table + side panel fill the screen height left below the term strip, down to
  // the footer status bar: `--tc-fit-h` on the layout (CSS decides where it applies).
  // Measured, not guessed: the shell header, the module tabs and the strip vary in height
  // (summary card, binnacle panel, fullscreen). Recomputed on resize of the scroll box, of
  // its content and of the module; written to the DOM directly, no React render.
  const layoutRef = useRef(null);
  // How many pending records the panel lists before "Ver todos": what fits beside the
  // stepper and the phase detail at this height. Changes only when crossing a step.
  const [pendingRows, setPendingRows] = useState(2);
  useLayoutEffect(() => {
    const layout = layoutRef.current;
    if (!layout) return undefined;
    const isScrollable = (el) => /(auto|scroll)/.test(getComputedStyle(el).overflowY);
    let viewport = layout.parentElement;
    while (viewport && viewport !== document.body && !isScrollable(viewport)) viewport = viewport.parentElement;
    const useWindow = !viewport || viewport === document.body;
    let frame = 0;
    let timer = 0;
    const measure = () => {
      if (frame) cancelAnimationFrame(frame);
      if (timer) clearTimeout(timer);
      frame = 0;
      timer = 0;
      const layoutRect = layout.getBoundingClientRect();
      const viewTop = useWindow ? 0 : viewport.getBoundingClientRect().top;
      const viewHeight = useWindow ? window.innerHeight : viewport.clientHeight;
      const scrollTop = useWindow ? window.scrollY : viewport.scrollTop;
      const offsetInContent = layoutRect.top - viewTop + scrollTop;
      const fit = Math.max(420, Math.floor(viewHeight - offsetInContent - 12));
      const next = `${fit}px`;
      if (layout.style.getPropertyValue('--tc-fit-h') !== next) layout.style.setProperty('--tc-fit-h', next);
      setPendingRows(fit >= 820 ? 3 : fit >= 600 ? 2 : 1);
    };
    // Next frame, with a timer behind it: frames do not run while the tab is occluded.
    const schedule = () => {
      if (frame || timer) return;
      frame = requestAnimationFrame(measure);
      timer = setTimeout(measure, 150);
    };
    measure();
    const ro = new ResizeObserver(schedule);
    if (!useWindow) {
      ro.observe(viewport);
      if (viewport.firstElementChild) ro.observe(viewport.firstElementChild);
    }
    ro.observe(layout.parentElement);
    window.addEventListener('resize', schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      if (timer) clearTimeout(timer);
      ro.disconnect();
      window.removeEventListener('resize', schedule);
    };
  }, []);

  // --- NUEVO: Refs para sincronización de scroll ---
  const tableScrollRef = useRef(null);
  const topScrollRef = useRef(null);
  const contentRef = useRef(null); // Ref para el contenido que define el ancho

  const { scheduleConfig, saveScheduleConfig, clearScheduleConfig, hasSchedule } = useScheduleConfig(currentItem?.id, currentItem?.schedule_config);

  useEffect(() => {
    setPendingDateEdits({});
  }, [currentItem?.id]);

  const clearPendingDateEdit = useCallback((value, rowIndex) => {
    const editKey = getClockEditKey(value, rowIndex);
    setPendingDateEdits(prev => {
      if (!prev[editKey]) return prev;
      const next = { ...prev };
      delete next[editKey];
      return next;
    });
  }, []);

  const updatePendingDateEdit = useCallback((value, rowIndex, nextDate, originalDate) => {
    if (value?.state === false || value?.state == null) return;

    const editKey = getClockEditKey(value, rowIndex);
    const normalizedNext = String(nextDate || '').trim();
    const normalizedOriginal = String(originalDate || '').trim();

    setPendingDateEdits(prev => {
      if (normalizedNext === normalizedOriginal) {
        if (!prev[editKey]) return prev;
        const next = { ...prev };
        delete next[editKey];
        return next;
      }

      return {
        ...prev,
        [editKey]: {
          value,
          rowIndex,
          dateValue: normalizedNext,
        },
      };
    });
  }, []);

  const toggleOptionalColumn = useCallback((columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  }, []);

  // --- NUEVO: useEffect para sincronizar los scrolls ---
  useEffect(() => {
    const tableEl = tableScrollRef.current;
    const topEl = topScrollRef.current;
    if (!tableEl || !topEl) return;

    let isSyncing = false; // Flag para evitar bucles infinitos

    const handleTableScroll = () => {
      if (!isSyncing) {
        isSyncing = true;
        topEl.scrollLeft = tableEl.scrollLeft;
        requestAnimationFrame(() => { isSyncing = false; });
      }
    };

    const handleTopScroll = () => {
      if (!isSyncing) {
        isSyncing = true;
        tableEl.scrollLeft = topEl.scrollLeft;
        requestAnimationFrame(() => { isSyncing = false; });
      }
    };

    tableEl.addEventListener('scroll', handleTableScroll);
    topEl.addEventListener('scroll', handleTopScroll);

    return () => {
      tableEl.removeEventListener('scroll', handleTableScroll);
      topEl.removeEventListener('scroll', handleTopScroll);
    };
  }, []);


  // The table scroll survives a tab switch (the table unmounts) like the collapsed groups do.
  useLayoutEffect(() => {
    const tableEl = tableScrollRef.current;
    if (!tableEl) return undefined;
    const saved = readViewState(expedienteId).scroll;
    if (saved) {
      tableEl.scrollTop = saved.top;
      tableEl.scrollLeft = saved.left;
    }
    // Stored on the way out, not on every scroll event: the browser reports a scroll of
    // its own when the table is laid out again.
    return () => writeViewState(expedienteId, { scroll: { top: tableEl.scrollTop, left: tableEl.scrollLeft } });
  }, [expedienteId]);

  // SOLUCIÓN: useEffect mejorado para sincronizar estado desde las props.
  // Esta es ahora la principal fuente de verdad para clocksData.
  useEffect(() => {
    const propsClocks = currentItem?.fun_clocks || [];
    // Compara si los datos de las props son diferentes a los del estado.
    // Una comparación simple de longitud o JSON stringify es suficiente para detectar cambios.
    if (JSON.stringify(propsClocks) !== JSON.stringify(clocksData)) {
      setClocksData(propsClocks);
      // Eliminamos el refreshTrigger de aquí para no causar ciclos extra.
    }
  }, [currentItem?.fun_clocks]);


  const phaseOptions = useMemo(() => {
    const phaseOptionsClock = clocksData.find(c => String(c.state) === '1001');
    try {
      return phaseOptionsClock?.desc ? JSON.parse(phaseOptionsClock.desc) : {};
    } catch (e) {
      console.error("Error parsing phaseOptions JSON:", e);
      return {};
    }
  }, [clocksData]);

  const liveManager = useClocksManager(currentItem, clocksData, currentVersion, systemDate, phaseOptions);
  // The hook returns a new object (and new helper closures) on every render. Its helpers
  // only read `clocksData` / `currentItem`, so while every data field below is unchanged
  // an earlier object is equivalent: keeping it lets the clock list, the alarms and the
  // memoized rows skip unrelated renders (dialogs, polls, layout). No value is recomputed.
  const manager = useMemo(() => liveManager, [
    liveManager.clocksData,
    liveManager.systemDate,
    liveManager.currentItem,
    liveManager.phaseOptions,
    liveManager.processPhases,
    liveManager.curaduriaDetails,
    liveManager.suspensionPreActa,
    liveManager.suspensionPostActa,
    liveManager.extension,
    liveManager.totalSuspensionDays,
    liveManager.viaTime,
    liveManager.canAddSuspension,
    liveManager.canAddExtension,
    liveManager.availableSuspensionTypes,
  ]);
  const completionClock = useMemo(
    () => getLicenseCompletionClock({ ...currentItem, fun_clocks: clocksData }),
    [currentItem, clocksData]
  );

  const conGI = _GLOBAL_ID === 'cb1';
  const namePayment = conGI ? 'Impuestos Municipales' : 'Impuesto Delineacion';

  const clocksToShowRaw = useMemo(() => generateClocks({
    ...manager,
    currentItem,
    namePayment,
    conGI,
    phaseOptions
  }), [manager, currentItem, namePayment, conGI, phaseOptions]);

  // CAMBIO: Usamos el nuevo formato de retorno del hook
  const { notificationAlarms, processAlarms, allAlarms } = useAlarms(
    manager, 
    scheduleConfig, 
    clocksToShowRaw, 
    systemDate
  );

  // Estado para rastrear eliminaciones recientes y evitar re-sincronización inmediata
  const [recentDeletions, setRecentDeletions] = useState(new Set());
  const deletionTimeoutRef = useRef(null);
  
  // SOLUCIÓN: Ref para rastrear la última sincronización y evitar bucles
  const lastSyncRef = useRef({ formDate: null, clockDate: null, syncing: false });

  // SOLUCIÓN: useEffect mejorado para sincronización de valla
  // Este efecto sincroniza bidireccionalemente la fecha de valla entre el formulario (fun_law.sign) y el clock 503
  useEffect(() => {
    // No ejecutar si está en proceso de sincronización
    if (lastSyncRef.current.syncing) return;
    
    const syncVallaDate = () => {
      if (!currentItem || !currentItem.fun_law) return;

      const signArray = currentItem.fun_law.sign ? currentItem.fun_law.sign.split(',') : [];
      const formDate = (signArray.length > 1 && signArray[1] && signArray[1].trim()) ? signArray[1].trim() : null;

      const clock503 = (clocksData || []).find(c => String(c.state) === '503');
      const clockDate = (clock503 && clock503.date_start) ? clock503.date_start : null;

      // SOLUCIÓN: No sincronizar si el reloj fue eliminado recientemente
      if (recentDeletions.has(503)) {
        console.log('⏸️ Sincronización de valla pausada - eliminación reciente detectada');
        return;
      }
      
      // SOLUCIÓN: Verificar si ya sincronizamos estos valores para evitar ciclos
      if (lastSyncRef.current.formDate === formDate && lastSyncRef.current.clockDate === clockDate) {
        return; // Ya sincronizado, no hacer nada
      }
      
      // Actualizar ref con valores actuales
      lastSyncRef.current.formDate = formDate;
      lastSyncRef.current.clockDate = clockDate;

      // CASO 1: Las fechas son iguales - no hay nada que sincronizar
      if (formDate === clockDate) {
        return;
      }

      // CASO 2: Hay fecha en formulario pero no en reloj (o son diferentes) -> Crear/Actualizar reloj
      // Prioridad al formulario si tiene fecha y el reloj no, o si son diferentes
      if (formDate && formDate !== clockDate) {
        console.log('📝 Sincronizando valla: formulario → reloj', { formDate, clockDate });
        lastSyncRef.current.syncing = true;
        
        const formData = new FormData();
        formData.set('date_start', formDate);
        formData.set('state', 503);
        formData.set('name', 'Instalación y Registro de la Valla Informativa');
        formData.set('desc', 'Instalación de la valla informativa del proyecto');
        
        // Actualizar el ref después de la llamada
        manage_clock(false, 503, undefined, formData, true);
        
        // Resetear flag de sincronización después de un delay
        setTimeout(() => {
          lastSyncRef.current.syncing = false;
        }, 500);
        return;
      } 
      
      // CASO 3: Hay fecha en reloj pero no en formulario -> Actualizar formulario
      if (clockDate && !formDate) {
        console.log('📝 Sincronizando valla: reloj → formulario', { clockDate, formDate });
        lastSyncRef.current.syncing = true;
        
        const funLawId = currentItem.fun_law.id;
        if (!funLawId) {
          lastSyncRef.current.syncing = false;
          return;
        }

        const newSign = [signArray[0] || '-1', clockDate].join(',');

        const formData = new FormData();
        formData.set('sign', newSign);

        FUN_SERVICE.update_sign(funLawId, formData)
          .then(response => {
            if (response.data === 'OK') {
              props.requestUpdate(currentItem.id);
            }
          })
          .catch(e => console.error("Error sincronizando formulario desde reloj:", e))
          .finally(() => {
            setTimeout(() => {
              lastSyncRef.current.syncing = false;
            }, 500);
          });
      }
    };

    // Usar un debounce más largo para evitar múltiples ejecuciones
    const timer = setTimeout(syncVallaDate, 300);
    return () => clearTimeout(timer);
  }, [currentItem?.fun_law?.sign, clocksData, recentDeletions]);

  const { getClock, getClockVersion, availableSuspensionTypes, totalSuspensionDays, suspensionPreActa, suspensionPostActa } = manager;

  useEffect(() => {
    setArchiveDate(getClock(101)?.date_start || '');
  }, [currentItem?.id, clocksData]);

  const clocksToShow = useMemo(() => filterClocksAfterDesist(clocksToShowRaw, manager.isDesisted), [clocksToShowRaw, manager.isDesisted]);
  // The definitions as the table lays them out (groups and their rows), and from them the
  // presentation status "process finished with pending records".
  const clockGroups = useMemo(() => buildClockGroups(clocksToShow, manager), [clocksToShow, manager]);
  const eventRows = useMemo(() => flattenClockRows(clockGroups), [clockGroups]);
  const pendingStatus = useMemo(() => getFinishedPendingStatus({
    expedienteState: currentItem?.state,
    processPhases: manager.processPhases,
    isDesisted: manager.isDesisted,
    eventRows,
  }), [currentItem?.state, manager.processPhases, manager.isDesisted, eventRows]);

  const toggleSection = (title) => {
    setCollapsedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const groupTitles = useMemo(() => clockGroups.map((group) => group.title), [clockGroups]);
  const anyGroupExpanded = groupTitles.some((title) => !collapsedSections[title]);
  const toggleAllSections = () => {
    setCollapsedSections(anyGroupExpanded ? Object.fromEntries(groupTitles.map((title) => [title, true])) : {});
  };

  // "Ir al evento": opens the group of the row, brings the row into view and marks it briefly.
  const goToEvent = useCallback((item) => {
    if (!item) return;
    if (item.groupTitle) setCollapsedSections((prev) => (prev[item.groupTitle] ? { ...prev, [item.groupTitle]: false } : prev));
    setFlashedRow(item.index);
    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    flashTimeoutRef.current = setTimeout(() => setFlashedRow(null), 2400);
    // After the group has been laid out open.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const row = document.getElementById(`tc-row-${item.index}`);
      if (!row) return;
      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      row.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
      (row.querySelector('input[type="date"]') || row.querySelector('button'))?.focus({ preventScroll: true });
    }));
  }, []);

  useEffect(() => () => {
    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
  }, []);
  
  const applyLocalClockChange = (state, changes, version) => {
    setClocksData(prev => {
      const arr = Array.isArray(prev) ? [...prev] : [];
      const idx = arr.findIndex(c => String(c.state) === String(state) && (version !== undefined ? String(c.version) === String(version) : true));

      let newClock;
      if (idx >= 0) {
        newClock = { ...arr[idx], ...changes };
        arr[idx] = newClock;
      } else {
        newClock = { ...changes, state, version };
        arr.push(newClock);
      }

      if (String(state) === '1001') setRefreshTrigger(p => p + 1);
      return arr;
    });
  };

  // SOLUCIÓN: save_clock ahora puede recibir valor explícito desde el botón global o leer el DOM en blur.
  const save_clock = (value, i, dateOverride, { triggerUpdate = true } = {}) => {
    if (value.state === false || value.state == null) return Promise.resolve(false);

    const dateInput = document.getElementById("clock_exp_date_" + i);
    const dateVal = dateOverride !== undefined
      ? String(dateOverride || '').trim()
      : dateInput ? String(dateInput.value || '').trim() : '';

    // Obtener el valor actual del clock para comparar
    const currentClock = value.version !== undefined
      ? getClockVersion(value.state, value.version)
      : getClock(value.state);
    const currentDate = currentClock?.date_start ?? '';

    // One save per event at a time. Until the first answer arrives the row still holds its
    // old date, so the reference for "no change" is the latest saved/queued date of this
    // event, not the stored one (a revert to the stored date while a save is pending must
    // still be sent). A different date is queued behind the pending save (only the latest
    // queued value is kept) so two dates never reach the backend out of order and an event
    // with no stored clock is never created twice.
    const saveKey = `${value.state}::${value.version ?? ''}`;
    const inFlight = dateSavesInFlightRef.current.get(saveKey);
    const referenceDate = inFlight ? inFlight.latestDate : currentDate;

    // SOLUCIÓN: Solo guardar si hay un cambio real en la fecha
    if (dateVal === referenceDate) {
      if (inFlight) return inFlight.promise;
      console.log('⏭️ save_clock: Sin cambios, omitiendo guardado');
      clearPendingDateEdit(value, i);
      return Promise.resolve(false);
    }

    if (inFlight) {
      inFlight.latestDate = dateVal;
      inFlight.queuedDate = dateVal;
      inFlight.triggerUpdate = inFlight.triggerUpdate || triggerUpdate;
      return inFlight.promise;
    }

    const entry = { latestDate: dateVal, queuedDate: undefined, triggerUpdate, promise: null };
    const runSaves = async () => {
      let child = currentClock?.id ? currentClock : null;
      let saved = await manage_clock(false, value.state, value.version, buildClockFormData(value, dateVal), triggerUpdate, child);
      while (saved && entry.queuedDate !== undefined) {
        const nextDate = entry.queuedDate;
        entry.queuedDate = undefined;
        // The first save created the clock: the follow-up must update it, never create again.
        if (!child) child = await findStoredClock(value.state, value.version);
        if (!child) {
          saved = false;
          break;
        }
        saved = await manage_clock(false, value.state, value.version, buildClockFormData(value, nextDate), entry.triggerUpdate, child);
      }
      return saved;
    };

    const promise = runSaves()
      .then((saved) => {
        if (saved) clearPendingDateEdit(value, i);
        return saved;
      })
      .finally(() => {
        if (dateSavesInFlightRef.current.get(saveKey) === entry) dateSavesInFlightRef.current.delete(saveKey);
      });
    entry.promise = promise;
    dateSavesInFlightRef.current.set(saveKey, entry);
    return promise;
  };

  // Stored clock of an event, read back after its creation (the create answer carries no id).
  const findStoredClock = async (state, version) => {
    try {
      const response = await FUN_SERVICE.get(currentItem.id);
      const clocks = response?.data?.fun_clocks || [];
      return clocks
        .filter((clock) => clock?.id && String(clock.state) === String(state)
          && (version === undefined || String(clock.version) === String(version)))
        .reduce((latest, clock) => (!latest || Number(clock.id) > Number(latest.id) ? clock : latest), null);
    } catch (error) {
      console.error('Error leyendo el reloj recién creado:', error);
      return null;
    }
  };

  const buildClockFormData = (value, dateVal) => {
    var formDataClock = new FormData();

    if (dateVal) formDataClock.set('date_start', dateVal);
    else formDataClock.set('date_start', ''); // Permitir borrar fecha
    
    formDataClock.set('state', value.state);

    if (value.version !== undefined) {
      formDataClock.set('version', value.version);
    }

    let descBase = value.desc || '';
    if (value.state === 350 || value.state === 351) {
        if (dateVal) {
            const startSusp = (value.state === 350) ? suspensionPreActa.start?.date_start : suspensionPostActa.start?.date_start;
            if (startSusp) {
                const days = calcularDiasHabiles(startSusp, dateVal, true);
                descBase = `Fin de suspensión (${days} día(s) hábiles)`;
            }
        } else {
            descBase = `Finalización de suspensión de términos (${value.state === 350 ? 'Pre-Acta' : 'Post-Correcciones'})`;
        }
    } else if (value.state === 401) {
        if (dateVal) {
            const startExt = manager.extension.start?.date_start;
            if (startExt) {
                const days = sumarDiasHabiles(startExt, dateVal);
                descBase = `Fin de prórroga (${days} día(s) hábiles)`;
            }
        } else {
            descBase = 'Finalización de prórroga por complejidad técnica';
        }
    }


    formDataClock.set('desc', descBase);
    formDataClock.set('name', value.name);
    return formDataClock;
  };

  // `child` (optional) is the stored clock to update, for callers that already know it.
  const manage_clock = (useMySwal, findOne, version, formDataClock, triggerUpdate = false, child) => {
    var _CHILD = child?.id ? child : (getClockVersion(findOne, version) || getClock(findOne));
    formDataClock.set('fun0Id', currentItem.id);

    if (useMySwal) swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });

    const onOk = () => {
      if (useMySwal) swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });

      const localChanges = {};
      ['date_start', 'desc', 'name'].forEach((field) => {
        if (formDataClock.has(field)) localChanges[field] = formDataClock.get(field);
      });
      applyLocalClockChange(findOne, localChanges, version);

      if (triggerUpdate) {
        props.requestUpdate(currentItem.id);
      }
      return true;
    };
    const onErr = (e) => {
      console.error('Error guardando clock en backend:', e);
      if (useMySwal) swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
      return false;
    };

    if (_CHILD && _CHILD.id) {
      return FUN_SERVICE.update_clock(_CHILD.id, formDataClock).then(r => r.data === 'OK' ? onOk() : onErr(r)).catch(onErr);
    } else {
      return FUN_SERVICE.create_clock(formDataClock).then(r => r.data === 'OK' ? onOk() : onErr(r)).catch(onErr);
    }
  };

  const closeProcess = () => {
    swalConfirm({
      title: 'CERRAR SOLICITUD',
      text: '¿Está seguro de cerrar esta Solicitud?',
      icon: 'question',
      confirmButtonText: 'CERRAR',
    }).then((result) => {
      if (!result.isConfirmed) return;

      const formData = new FormData();
      formData.set('state', 100);
      swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });

      FUN_SERVICE.update(currentItem.id, formData)
        .then((response) => {
          if (response.data === 'OK') {
            swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
            props.requestUpdate(currentItem.id);
          } else {
            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
          }
        })
        .catch((e) => {
          console.error('Error cerrando solicitud desde tiempos:', e);
          swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
        });
    });
  };

  const archiveProcess = () => {
    if (!archiveDate) {
      swalError({ title: 'Fecha requerida', text: 'Seleccione la fecha de archivación antes de continuar.', icon: 'warning' });
      return;
    }

    swalConfirm({
      title: 'ARCHIVAR SOLICITUD',
      text: '¿Está seguro de archivar esta Solicitud? No se podrá modificar de ninguna forma.',
      icon: 'question',
      confirmButtonText: 'ARCHIVAR',
    }).then((result) => {
      if (!result.isConfirmed) return;

      const formData = new FormData();
      formData.set('state', 101);
      swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });

      FUN_SERVICE.update(currentItem.id, formData)
        .then(async (response) => {
          if (response.data !== 'OK') {
            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
            return;
          }

          const formDataClock = new FormData();
          const worker = `${window?.user?.name || ''} ${window?.user?.surname || ''}`.trim();
          formDataClock.set('date_start', archiveDate);
          formDataClock.set('name', 'ARCHIVACIÓN');
          formDataClock.set('desc', `Fue enviado al archivo por: ${worker}`);
          formDataClock.set('state', 101);

          const savedArchiveClock = await manage_clock(false, 101, undefined, formDataClock, true);
          if (savedArchiveClock) {
            swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
          }
        })
        .catch((e) => {
          console.error('Error archivando solicitud desde tiempos:', e);
          swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
        });
    });
  };

  const renderProcessClosurePanel = () => {
    const processState = Number(currentItem?.state || 0);
    const hasCompletion = Boolean(completionClock.dateStart);
    const canCloseProcess = hasCompletion && processState < 100;
    const canArchiveProcess = hasCompletion && processState === 100;
    const isArchivedProcess = processState === 101;
    const dangerOutline = 'border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive';

    let statusText;
    if (isArchivedProcess) statusText = 'La solicitud ya se encuentra archivada.';
    else if (hasCompletion) statusText = null;
    else statusText = 'Sin datos de cierre: aún no se registra la fecha que finaliza el trámite, por eso no es posible cerrarlo ni archivarlo.';

    const closureSummary = isArchivedProcess
      ? 'Solicitud archivada'
      : hasCompletion
        ? (processState >= 100 ? 'Proceso finalizado' : 'Listo para finalizar')
        : 'Sin datos de cierre';

    return (
      <DisclosureCard
        title="Cierre y archivo"
        summary={closureSummary}
        open={closureOpen}
        onOpenChange={setClosureOpen}
        headingId="tc-closure-title"
      >
        <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 space-y-1">
            <p className="m-0 text-xs text-muted-foreground">
              {statusText ?? (
                <>
                  {completionClock.label}: <span className="font-mono text-foreground">{formatClockDate(completionClock.dateStart)}</span>
                </>
              )}
            </p>
            {isArchivedProcess && archiveDate ? (
              <p className="m-0 text-xs text-muted-foreground">
                Fecha de archivo: <span className="font-mono text-foreground">{formatClockDate(archiveDate)}</span>
              </p>
            ) : null}
          </div>

          {canCloseProcess || canArchiveProcess ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {canCloseProcess && (
                <Button type="button" variant="outline" size="sm" className={dangerOutline} onClick={closeProcess}>
                  <Icon name="unlock-alt" size={16} />
                  Finalizar proceso
                </Button>
              )}

              {canArchiveProcess && (
                <>
                  <label htmlFor="tc-archive-date" className="m-0 whitespace-nowrap text-xs font-medium text-muted-foreground">Fecha de archivación</label>
                  <input
                    id="tc-archive-date"
                    type="date"
                    className="form-control h-9 min-w-[170px] font-mono text-sm"
                    max="2100-01-01"
                    value={archiveDate}
                    onChange={(event) => setArchiveDate(event.target.value)}
                  />
                  <Button type="button" variant="outline" size="sm" className={dangerOutline} onClick={archiveProcess}>
                    <Icon name="file-archive" size={16} />
                    Archivar solicitud
                  </Button>
                </>
              )}
            </div>
          ) : null}
        </div>
      </DisclosureCard>
    );
  };

  const savePendingDateChanges = async () => {
    const pendingChanges = Object.values(pendingDateEdits);
    if (pendingChanges.length === 0 || isSavingPendingDates) return;

    setIsSavingPendingDates(true);
    try {
      const results = await Promise.all(
        pendingChanges.map((change) => save_clock(change.value, change.rowIndex, change.dateValue, { triggerUpdate: false }))
      );
      const savedCount = results.filter(Boolean).length;

      if (savedCount > 0) {
        // One reload for the whole batch instead of one per saved date.
        props.requestUpdate(currentItem.id);
        swalSuccess({
          title: 'Cambios guardados',
          text: `${savedCount} fecha${savedCount !== 1 ? 's' : ''} sincronizada${savedCount !== 1 ? 's' : ''}.`,
        });
      }
    } finally {
      setIsSavingPendingDates(false);
    }
  };

  const delete_clock = (value) => {
    swalConfirm({
      title: '¿Estás seguro?',
      text: `Se eliminará la fecha del evento "${value.name}". Esta acción no se puede deshacer.`,
      confirmButtonText: 'Sí, eliminar',
    }).then((result) => {
      if (result.isConfirmed) {
        const formDataClock = new FormData();

        formDataClock.set('state', value.state);
        if (value.version !== undefined) {
          formDataClock.set('version', value.version);
        }

        // Se establece la fecha como vacía para eliminarla en el backend.
        formDataClock.set('date_start', '');
        formDataClock.set('desc', value.desc || '');
        
        // SOLUCIÓN: Marcar como eliminado recientemente para evitar re-sincronización
        setRecentDeletions(prev => new Set(prev).add(value.state));
        
        // Limpiar la marca después de 3 segundos
        if (deletionTimeoutRef.current) {
          clearTimeout(deletionTimeoutRef.current);
        }
        deletionTimeoutRef.current = setTimeout(() => {
          setRecentDeletions(prev => {
            const newSet = new Set(prev);
            newSet.delete(value.state);
            return newSet;
          });
          console.log('🔄 Sincronización de valla reactivada');
        }, 3000);

        // CASO ESPECIAL: Si es la valla (503), también limpiar el formulario
        if (value.state === 503 && currentItem?.fun_law?.id) {
          console.log('🗑️ Eliminando valla: limpiando reloj Y formulario');
          
          const funLawId = currentItem.fun_law.id;
          const signArray = currentItem.fun_law.sign ? currentItem.fun_law.sign.split(',') : [];
          const newSign = [signArray[0] || '-1', ''].join(','); // Vaciar segunda posición

          const formDataSign = new FormData();
          formDataSign.set('sign', newSign);

          // Eliminar del formulario primero
          FUN_SERVICE.update_sign(funLawId, formDataSign)
            .then(response => {
              if (response.data === 'OK') {
                console.log('✅ Formulario de valla limpiado');
                // Luego eliminar el reloj
                manage_clock(false, value.state, value.version, formDataClock, true);
              }
            })
            .catch(e => {
              console.error("❌ Error limpiando formulario de valla:", e);
              // Intentar eliminar el reloj de todas formas
              manage_clock(false, value.state, value.version, formDataClock, true);
            });
        } else {
          // Para otros relojes, eliminar normalmente
          manage_clock(false, value.state, value.version, formDataClock, true);
        }
      }
    });
  };

  // Stable row callbacks (latest handlers through refs) so `memo(ClockRow)` holds.
  const saveClockRef = useRef(save_clock);
  saveClockRef.current = save_clock;
  const deleteClockRef = useRef(delete_clock);
  deleteClockRef.current = delete_clock;
  const handleRowSave = useCallback((...args) => saveClockRef.current(...args), []);
  const handleRowDelete = useCallback((...args) => deleteClockRef.current(...args), []);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (deletionTimeoutRef.current) {
        clearTimeout(deletionTimeoutRef.current);
      }
    };
  }, []);

  const addTimeControl = (type) => {
    if (type === 'suspension') {
      const availableDays = 10 - totalSuspensionDays;
      if (availableSuspensionTypes.length === 0) return swalError({ title: 'No disponible', text: 'No hay espacios para añadir suspensiones', icon: 'warning' });

      const typeSelectHtml = availableSuspensionTypes.length > 1
        ? `<div class="col-12"><label class="form-label">Ubicación</label><select id="susp_type" class="form-select">${availableSuspensionTypes.map(t => `<option value="${t.value}">${t.label}</option>`).join('')}</select></div>`
        : `<input type="hidden" id="susp_type" value="${availableSuspensionTypes[0].value}">`;

      swalFormDialog({
        title: 'Nueva Suspensión de Términos',
        html: `<div class="row g-3">
            <div class="col-12"><div class="alert alert-info">${getIconSvg("fa-info-circle", 14, "me-2")}Días disponibles: <strong>${availableDays}</strong></div></div>
            ${typeSelectHtml}
            <div class="col-12"><label class="form-label">Fecha de Inicio</label><input type="date" id="susp_start" class="form-control" value="${systemDate}"/></div>
            <div class="col-12"><label class="form-label">Información Adicional</label><textarea id="susp_info" class="form-control" rows="3" placeholder="Detalles..."></textarea></div>
          </div>`,
        preConfirm: () => {
          const suspType = document.getElementById('susp_type').value;
          const startDate = document.getElementById('susp_start').value;
          if (!startDate) { Swal.showValidationMessage('La fecha de inicio es obligatoria'); return false; }
          return { suspType, startDate, info: document.getElementById('susp_info').value.trim() };
        }
      }).then(result => {
        if (result.isConfirmed) {
          const { suspType, startDate, info } = result.value;
          const isPreActa = suspType === 'pre';
          const startState = isPreActa ? 300 : 301;
          const formDataStart = new FormData();
          formDataStart.set('state', startState);
          formDataStart.set('date_start', startDate);
          formDataStart.set('desc', info || `Suspensión ${isPreActa ? 'antes' : 'después'} del acta`);
          formDataStart.set('name', `Inicio Suspensión ${isPreActa ? 'Pre-Acta' : 'Post-Acta'}`);
          // SOLUCIÓN: Sin llamada a applyLocalClockChange
          manage_clock(false, startState, false, formDataStart, true);
        }
      });

    } else if (type === 'extension') {
      swalFormDialog({
        title: 'Nueva Prórroga por Complejidad',
        html: `<div class="row g-3">
                <div class="col-12"><div class="alert alert-info">${getIconSvg("fa-clock", 14, "me-2")}Otorga hasta <strong>22 días hábiles</strong> adicionales.</div></div>
                <div class="col-12"><label class="form-label">Fecha de Inicio</label><input type="date" id="ext_start" class="form-control" value="${systemDate}"/></div>
                <div class="col-12"><label class="form-label">Fecha de Fin (Opcional)</label><input type="date" id="ext_end" class="form-control"/></div>
            </div>`,
        preConfirm: () => {
          const startDate = document.getElementById('ext_start').value;
          const endDate = document.getElementById('ext_end').value;
          if (!startDate) { Swal.showValidationMessage('La fecha de inicio es obligatoria'); return false; }
          if (endDate && dayjs(endDate).isBefore(startDate)) {
            Swal.showValidationMessage('La fecha de fin no puede ser anterior a la fecha de inicio');
            return false;
          }
          return { startDate, endDate };
        }
      }).then(result => {
        if (result.isConfirmed) {
          const { startDate, endDate } = result.value;

          const formDataStart = new FormData();
          formDataStart.set('state', 400);
          formDataStart.set('date_start', startDate);
          formDataStart.set('desc', 'Prórroga por complejidad técnica');
          formDataStart.set('name', 'Inicio Prórroga por Complejidad');
          // SOLUCIÓN: Sin llamada a applyLocalClockChange
          manage_clock(false, 400, false, formDataStart, true);

          if (endDate) {
            // CORRECCIÓN: Usar calcularDiasHabiles en lugar de dateParser_dateDiff
            // para consistencia y correcta exclusión de festivos
            const days = calcularDiasHabiles(startDate, endDate, true);
            const formDataEnd = new FormData();
            formDataEnd.set('state', 401);
            formDataEnd.set('date_start', endDate);
            formDataEnd.set('desc', `Fin de prórroga (${days} día(s) hábiles)`);
            formDataEnd.set('name', 'Fin Prórroga por Complejidad');
            // SOLUCIÓN: Sin llamada a applyLocalClockChange. El setTimeout con requestUpdate() en la primera llamada será suficiente.
            setTimeout(() => manage_clock(false, 401, false, formDataEnd, true), 200);
          }
        }
      });
    }
  };
  
    const openScheduleModal = () => {
    let localScheduleData = scheduleConfig?.times || {};

    const modalContainer = document.createElement('div');
    modalContainer.id = 'schedule-modal-root';
    modalContainer.className = 'schedule-modal-wrapper'; // Clase para estilos específicos

    const handleScheduleChange = (newSchedule) => {
      localScheduleData = newSchedule;
    };

    const legalLimits = {};

    clocksToShow.forEach(clockValue => {
      if (!clockValue.title && clockValue.state !== undefined && clockValue.state !== false) {
        const limitDate = calculateLegalLimit(clockValue.state, clockValue, manager);

        if (limitDate) {
          legalLimits[clockValue.state] = {
            limitDate: limitDate
          };
        }
      }
    });

    swalFormDialog({
      title: 'Programar Tiempos del Proceso',
      html: modalContainer,
      width: '90vw',
      showDenyButton: hasSchedule,
      confirmButtonText: 'Guardar Programación',
      denyButtonText: 'Eliminar Programación',
      customClass: {
        popup: 'swal2-themed schedule-modal-popup',
        confirmButton: 'swal2-confirm-themed',
        cancelButton: 'swal2-cancel-themed',
      },
      didOpen: () => {
        const modalRoot = createRoot(modalContainer);
        modalContainer._reactRoot = modalRoot;
        modalRoot.render(
          <ScheduleModal
            clocksToShow={clocksToShow}
            currentItem={currentItem}
            manager={manager}
            scheduleConfig={scheduleConfig}
            onScheduleChange={handleScheduleChange}
            legalLimits={legalLimits}
          />
        );
      },
      preConfirm: () => {
        if (Object.keys(localScheduleData).length === 0) {
          Swal.showValidationMessage('Debes programar al menos un tiempo antes de guardar');
          return false;
        }
        return localScheduleData;
      },
      willClose: () => {
        if (modalContainer._reactRoot) {
          modalContainer._reactRoot.unmount();
        }
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const payload = buildSchedulePayload(result.value, currentItem);
        swalLoading({
          title: 'Guardando...',
          text: 'Por favor espera mientras guardamos la programación',
        });
        const formData = new FormData();
        formData.append('scheduleConfig', JSON.stringify(payload));
        FUN_SERVICE.updateSchedule(currentItem.id, formData)
          .then(response => {
            if (response.data === 'OK' || response.status === 200) {
              saveScheduleConfig(payload);
              setRefreshTrigger(prev => prev + 1);
              const scheduledCount = Object.keys(result.value).length;
              swalSuccess({
                title: 'Programación Guardada',
                text: `${scheduledCount} tiempo${scheduledCount !== 1 ? 's' : ''} programado${scheduledCount !== 1 ? 's' : ''}. La columna "Límite Programado" mostrará las fechas calculadas.`,
              });
            } else {
              throw new Error('Respuesta inesperada del servidor');
            }
          })
          .catch(error => {
            console.error('Error guardando programación:', error);
            swalError({
              title: 'Error al Guardar',
              text: 'No se pudo guardar la programación. Por favor intenta nuevamente.',
            });
          });
      } else if (result.isDenied) {
        swalConfirm({
          title: '¿Estás seguro?',
          text: 'Se eliminará toda la programación de tiempos para este expediente.',
          confirmButtonText: 'Sí, eliminar',
        }).then((confirmResult) => {
          if (confirmResult.isConfirmed) {
            const formData = new FormData();
            formData.append('scheduleConfig', JSON.stringify(null));

            FUN_SERVICE.updateSchedule(currentItem.id, formData)
              .then(() => {
                clearScheduleConfig();
                setRefreshTrigger(prev => prev + 1);

                swalSuccess({
                  title: 'Programación Eliminada',
                  text: 'Se ha eliminado la configuración de programación del proceso.',
                });
              })
              .catch(error => {
                console.error('Error eliminando programación:', error);
                swalError({
                  title: 'Error',
                  text: 'No se pudo eliminar la programación.',
                });
              });
          }
        });
      }
    });
  };

  const buildRouteOptions = (phaseKey, patch) => {
    const current = { ...DEFAULT_ROUTE, ...(phaseOptions?.[phaseKey] || {}) };
    const next = { ...current, ...patch };
    // "Por aviso" only exists for a personal notification.
    if (next.notificationType === 'comunicar') next.byAviso = false;
    return { current, next, all: { ...(phaseOptions || {}), [phaseKey]: next } };
  };

  // Stores the route in the `phase_options` clock (state 1001). Shown at once, then
  // confirmed against the server: the data is reloaded before the control accepts another
  // change, and a failed save puts the previous route back.
  const commitRouteChange = async ({ phaseKey, next, all, change }) => {
    if (routeSavingRef.current) return;
    routeSavingRef.current = true;
    setRouteConfirm(null);
    setRouteSave({ phaseKey, busy: true, feedback: null });

    const previousClock = getClock('1001');
    const newDesc = JSON.stringify(all);
    applyLocalClockChange('1001', { name: 'phase_options', desc: newDesc }, undefined);

    const formData = new FormData();
    formData.set('name', 'phase_options');
    formData.set('desc', newDesc);
    formData.set('state', '1001');

    let saved = false;
    try {
      saved = await manage_clock(false, '1001', undefined, formData, false);
    } catch (error) {
      saved = false;
    }

    if (saved) {
      try {
        await props.requestUpdate(currentItem.id);
      } catch (error) {
        // The save went through; the next refresh brings the stored clock.
      }
      setRouteSave({ phaseKey, busy: false, feedback: { tone: 'success', text: describeRouteSaved(next, change) } });
    } else {
      setClocksData((prev) => (
        previousClock
          ? (prev || []).map((clock) => (String(clock.state) === '1001' ? { ...clock, name: previousClock.name, desc: previousClock.desc } : clock))
          : (prev || []).filter((clock) => String(clock.state) !== '1001')
      ));
      logError('ui_action_failed', new Error('No se pudo guardar la vía de notificación'), { component: 'Tiempos', action: 'phase_options', phaseKey });
      setRouteSave({ phaseKey, busy: false, feedback: { tone: 'error', text: 'No se pudo guardar. Se restauró la vía anterior; inténtalo de nuevo.' } });
    }
    routeSavingRef.current = false;
  };

  const handleRouteChange = (phaseKey, patch) => {
    if (routeSavingRef.current) return;
    const { current, next, all } = buildRouteOptions(phaseKey, patch);
    if (current.notificationType === next.notificationType && Boolean(current.byAviso) === Boolean(next.byAviso)) return;

    // What the table would show with the new route (same definitions, other options).
    const nextGroups = buildClockGroups(
      filterClocksAfterDesist(generateClocks({ ...manager, currentItem, namePayment, conGI, phaseOptions: all }), manager.isDesisted),
      manager,
    );
    const change = diffVisibleClockRows(clockGroups, nextGroups);
    const request = { phaseKey, next, all, change };

    // Only a change that takes registered dates out of sight asks first.
    if (change.hiddenDated.length || change.relabeledDated.length) {
      setRouteSave({ phaseKey, busy: false, feedback: null });
      setRouteConfirm(request);
      return;
    }
    commitRouteChange(request);
  };

  const _FIND_6 = useCallback((id) => (currentItem.fun_6s || []).find(f => f.id == id) || null, [currentItem]);
  const _CHILD_6_SELECT = useCallback(() => (currentItem.fun_6s || []).map(f => <option key={f.id} value={f.id}>{f.description}</option>), [currentItem]);

  // Helpers handed to every row: one object per data change, not per render.
  const rowHelpers = useMemo(
    () => ({ ...manager, currentItem, clocksData, clocksToShow }),
    [manager, currentItem, clocksData, clocksToShow]
  );

  const handleDateChange = (newDate) => {
    setSystemDate(newDate);
  };

  const handleDateShift = (days) => {
    setSystemDate(prevDate => dayjs(prevDate).add(days, 'days').format('YYYY-MM-DD'));
  };

  const resetDate = () => {
    setSystemDate(dayjs().format('YYYY-MM-DD'));
  };

  const columnCount = getClockColumnCount(visibleColumns);
  const pendingIndexes = useMemo(() => new Set(pendingStatus.items.map((item) => item.index)), [pendingStatus]);

  const renderClockList = () => {
    const activePhase = (manager.processPhases || []).find(p => p.id === activePhaseId);
    const activeRelatedStates = activePhase ? (activePhase.relatedStates || []) : [];
    const today = dayjs(systemDate);

    return clockGroups.map((group) => {
      const isCollapsed = Boolean(collapsedSections[group.title]);
      const route = ROUTE_GROUPS[group.title];
      const visibleRows = group.rows.filter((row) => !row.hidden);
      const datedRows = visibleRows.filter((row) => row.hasDate).length;
      // Same conditions the rows use for "Vencido" / "Vencida".
      const overdueRows = visibleRows.filter((row) => {
        if (row.hasDate) return false;
        if (row.state === 504) return Boolean(getClock(70)?.date_start);
        if (row.state === 34 && getClock(35)?.date_start) return false;
        return Boolean(row.limitDate) && today.isAfter(dayjs(row.limitDate), 'day');
      }).length;
      const pendingRows = visibleRows.filter((row) => pendingIndexes.has(row.index)).length;
      const isSectionInActivePhase = group.rows.some((row) => row.state !== false && row.state !== undefined && activeRelatedStates.includes(row.state));
      const headId = `tc-group-${group.index}`;
      const panelId = `tc-group-panel-${group.index}`;
      const groupStatus = visibleRows.length === 0
        ? 'Sin eventos'
        : datedRows === visibleRows.length ? 'Completo' : `${datedRows} de ${visibleRows.length} con fecha`;

      return (
        <div role="rowgroup" key={`group-${group.index}`} className="tc-group">
          <div role="row" className="tc-group-head">
            <div role="cell" aria-colspan={columnCount}>
              <button
                type="button"
                id={headId}
                className="tc-group-toggle"
                aria-expanded={!isCollapsed}
                aria-controls={panelId}
                onClick={() => toggleSection(group.title)}
              >
                <span className="tc-group-main">
                  <span className="tc-row-slot" aria-hidden="true">
                    <Icon name="chevron-down" size={16} className="tc-chevron" />
                  </span>
                  <span className="tc-group-title">{group.title}</span>
                </span>
                <span className="tc-group-summary">
                  <span className={cn('tc-group-status', visibleRows.length > 0 && datedRows === visibleRows.length && 'is-done')}>{groupStatus}</span>
                  {pendingStatus.pending ? (
                    pendingRows > 0 ? (
                      <span className="tc-group-flag is-warning">
                        <Icon name="Hourglass" size={12} aria-hidden="true" />
                        {pendingRows} pendiente{pendingRows === 1 ? '' : 's'}
                      </span>
                    ) : null
                  ) : overdueRows > 0 ? (
                    <span className="tc-group-flag is-danger">
                      <Icon name="AlertCircle" size={12} aria-hidden="true" />
                      {overdueRows} vencido{overdueRows === 1 ? '' : 's'}
                    </span>
                  ) : null}
                  {isSectionInActivePhase ? <span className="tc-group-tag">Fase seleccionada</span> : null}
                </span>
              </button>
            </div>
          </div>

          <Collapse id={panelId} open={!isCollapsed}>
            {route ? (
              <div role="row" className="tc-group-options">
                <div role="cell" aria-colspan={columnCount}>
                  <NotificationRouteControl
                    actLabel={route.actLabel}
                    options={phaseOptions?.[route.phaseKey]}
                    busy={routeSave.busy}
                    feedback={routeSave.phaseKey === route.phaseKey ? routeSave.feedback : null}
                    confirm={routeConfirm?.phaseKey === route.phaseKey ? { next: routeConfirm.next, ...routeConfirm.change } : null}
                    onChange={(patch) => handleRouteChange(route.phaseKey, patch)}
                    onConfirm={() => commitRouteChange(routeConfirm)}
                    onCancel={() => setRouteConfirm(null)}
                  />
                </div>
              </div>
            ) : null}

            {group.rows.map((row) => (
              <ClockRow
                // No `refreshTrigger` / `systemDate` in the key: both reach the row as props
                // (helpers, scheduleConfig, systemDate), so it updates without being remounted.
                key={`row-${row.index}-${row.state ?? 'no-state'}-${row.version ?? 'no-version'}`}
                value={row.value}
                i={row.index}
                clock={row.clock}
                onSave={handleRowSave}
                onDelete={handleRowDelete}
                outCodes={outCodes}
                _CHILD_6_SELECT={_CHILD_6_SELECT}
                _FIND_6={_FIND_6}
                helpers={rowHelpers}
                scheduleConfig={scheduleConfig}
                systemDate={systemDate}
                isHighlighted={activeRelatedStates.includes(row.state)}
                visibleColumns={visibleColumns}
                onDateDraftChange={updatePendingDateEdit}
                processFinished={pendingStatus.finished}
                isPendingRecord={pendingIndexes.has(row.index)}
                isFlashed={flashedRow === row.index}
              />
            ))}
          </Collapse>
        </div>
      );
    });
  };

  const handleToolAction = (action) => {
    switch (action) {
        case 'suspension':
            if (manager.canAddSuspension) addTimeControl('suspension');
            break;
        case 'extension':
            if (manager.canAddExtension) addTimeControl('extension');
            break;
        case 'schedule':
            openScheduleModal();
            break;
        case 'gantt':
            setShowGanttModal(true);
            break;
        case 'time-travel':
            setShowTimeTravel(true);
            break;
        case 'calendar':
            setShowCalendar(prev => !prev);
            break;
        case 'breakdown':
            openDaysBreakdownModal(manager);
            break;
        default:
            break;
    }
};


  const radDate = currentItem?.date;
  // One Gantt series for the inline card, the dialog and the legend.
  const ganttSeries = useGanttSeries({
    phases: manager.processPhases,
    radDate,
    manager,
    scheduleConfig,
    suspensionPreActa: manager.suspensionPreActa,
    suspensionPostActa: manager.suspensionPostActa,
    extension: manager.extension,
    processPending: pendingStatus.pending,
  });
  const totalTableWidth = getClockTableWidth(visibleColumns);
  const pendingDateCount = Object.keys(pendingDateEdits).length;
  const isEmulatedDate = systemDate !== dayjs().format('YYYY-MM-DD');
  const toggleAlarms = useCallback(() => setShowAlarms((open) => !open), []);
  const closeGanttModal = useCallback(() => {
    setShowGanttModal(false);
    // Opened from the tools menu its menu item is gone by now: hand focus back to the menu trigger.
    requestAnimationFrame(() => {
      if (document.activeElement === document.body) document.querySelector('[data-tiempos-tools-trigger]')?.focus();
    });
  }, []);
  const closeCalendar = useCallback(() => setShowCalendar(false), []);
  const openPhaseDetail = useCallback(
    (phase) => openPhaseDetailModal(phase, { finished: pendingStatus.pending }),
    [pendingStatus.pending]
  );

  return (
    <div className="exp-wrapper tc-root">
      <TermStrip
        manager={manager}
        alarmCount={notificationAlarms.length}
        pending={pendingStatus}
        alarmsOpen={showAlarms}
        onToggleAlarms={toggleAlarms}
        emulatedDate={isEmulatedDate ? systemDate : null}
        tools={(
          <ToolsMenu
            onAction={handleToolAction}
            canAddSuspension={manager.canAddSuspension}
            canAddExtension={manager.canAddExtension}
            isDesisted={manager.isDesisted}
          />
        )}
      />

      {showAlarms && (
        <AlarmsWidget
          alarms={notificationAlarms} // Solo alarmas de notificación (legal + programadas)
          pending={pendingStatus}
          onGoToEvent={goToEvent}
          onClose={() => setShowAlarms(false)}
        />
      )}

      {showTimeTravel && (
        <div className="time-travel-floating-widget">
          <ControlBar
            timeTravel={{
              systemDate,
              onDateChange: handleDateChange,
              onDateShift: handleDateShift,
              onDateReset: resetDate,
            }}
            onClose={() => setShowTimeTravel(false)}
          />
        </div>
      )}

      <GanttModal
        isOpen={showGanttModal}
        onClose={closeGanttModal}
        series={ganttSeries}
        currentItem={currentItem}
      />

      <div ref={layoutRef} className="tc-layout">
        <div className="tc-aside">
          <PendingChecklist pending={pendingStatus} onGoToEvent={goToEvent} visibleCount={pendingRows} />
          <SidebarInfo
            manager={manager}
            onActivePhaseChange={setActivePhaseId}
            pending={pendingStatus}
          />
          {/* El calendario se muestra condicionalmente y flotante */}
          {showCalendar && (
            <HolidayCalendar
              isFloating={true}
              onClose={closeCalendar}
            />
          )}
        </div>

        <section className="tc-card tc-main" aria-labelledby="tc-events-title">
          <div className="tc-card-header">
            <h3 id="tc-events-title" className="tc-card-title">Eventos del proceso</h3>
            <div className="clock-column-selector" role="group" aria-label="Columnas opcionales">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="tc-toolbar-btn"
                onClick={toggleAllSections}
                disabled={groupTitles.length === 0}
              >
                <Icon name={anyGroupExpanded ? 'ChevronsDownUp' : 'ChevronsUpDown'} size={14} aria-hidden="true" />
                {anyGroupExpanded ? 'Contraer todo' : 'Expandir todo'}
              </Button>
              <span className="tc-toolbar-divider" aria-hidden="true" />
              <span className="clock-column-selector-label">Mostrar columnas</span>
              {OPTIONAL_CLOCK_COLUMNS.map((column) => {
                const checkboxId = `clock-column-${column.key}`;
                return (
                  <label className="clock-column-toggle" key={column.key} htmlFor={checkboxId}>
                    <Checkbox
                      id={checkboxId}
                      checked={visibleColumns[column.key]}
                      onCheckedChange={() => toggleOptionalColumn(column.key)}
                    />
                    <span>{column.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* --- SCROLL HORIZONTAL SUPERIOR SINCRONIZADO --- */}
          <div ref={topScrollRef} className="top-scroll-wrapper" aria-hidden="true">
            <div className="top-scroll-content" style={{ width: `${totalTableWidth}px` }}></div>
          </div>

          <div ref={tableScrollRef} className="tc-scroll">
            <div
              ref={contentRef}
              role="table"
              aria-labelledby="tc-events-title"
              aria-colcount={columnCount}
              className="tc-table"
              style={{ minWidth: `${totalTableWidth}px`, '--tc-cols': getClockGridTemplate(visibleColumns) }}
            >
              <ClockTableHeader visibleColumns={visibleColumns} />
              {renderClockList()}
            </div>
          </div>

          <div className="clock-table-footer-tools">
            <p className="tc-autosave-note">
              <Icon name="Save" size={14} aria-hidden="true" />
              Los cambios se guardan automáticamente al salir de cada fecha.
            </p>
            <div className="clock-save-group">
              <span className="clock-save-status" aria-live="polite">
                {pendingDateCount > 0
                  ? `${pendingDateCount} fecha${pendingDateCount !== 1 ? 's' : ''} sin guardar`
                  : 'Sin cambios pendientes'}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8"
                disabled={pendingDateCount === 0 || isSavingPendingDates}
                onMouseDown={(event) => event.preventDefault()}
                onClick={savePendingDateChanges}
              >
                <Icon name={isSavingPendingDates ? 'Loader2' : 'Save'} size={14} className={isSavingPendingDates ? 'animate-spin' : ''} />
                Guardar cambios
              </Button>
            </div>
          </div>
        </section>
      </div>

      <DisclosureCard
        title="Diagrama de Gantt"
        summary="Eje en días hábiles desde la radicación, con su fecha."
        open={ganttOpen}
        onOpenChange={setGanttOpen}
        headingId="tc-gantt-title"
        actions={(
          <Button type="button" variant="ghost" size="sm" className="tc-toolbar-btn" onClick={() => setShowGanttModal(true)}>
            <Icon name="expand-alt" size={14} aria-hidden="true" />
            Ampliar
          </Button>
        )}
      >
        <div className="tc-gantt-body">
          <GanttChart
            series={ganttSeries}
            activePhaseId={activePhaseId}
            onPhaseClick={openPhaseDetail}
          />
          <GanttLegend className="tc-gantt-legend" series={ganttSeries} />
        </div>
      </DisclosureCard>

      {renderProcessClosurePanel()}
    </div>
  );
}
