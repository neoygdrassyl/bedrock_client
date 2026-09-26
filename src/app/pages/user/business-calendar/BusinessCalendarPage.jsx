import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import BusinessCalendarService from '@/app/services/business-calendar.service';
import {
  addBusinessCalendarCustomDay, removeBusinessCalendarCustomDay,
  replaceBusinessCalendarCustomDays, replaceBusinessCalendarHolidays,
} from '@/app/utils/BusinessDaysCol';
import BusinessCalendarCustomDayModal from './BusinessCalendarCustomDayModal';
import {
  buildMonthGrid, colombiaDate, describeCalendarDay, getDayVisualState, monthName, visualStateClasses,
} from './business-calendar.utils';

const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
const MONTHS = Array.from({ length: 12 }, (_, index) => index);
const MIN_YEAR = 2000;
const MAX_YEAR = 2100;
const FIRST_CUSTOM_YEAR = 2021;
const LAST_CUSTOM_YEAR = new Date().getFullYear() + 1;

function canManageBusinessCalendar(user) {
  const role = String(user?.role_short || user?.role || '').trim().toUpperCase().replace(/[.]+$/, '');
  return ['ADM', 'ADMIN', 'ADMINISTRADOR'].includes(role);
}

export default function BusinessCalendarPage() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [calendar, setCalendar] = useState(null);
  const [customDays, setCustomDays] = useState([]);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const actions = useCustomDayActions(year, setCustomDays);
  const canManageCalendar = canManageBusinessCalendar(window.user);

  useEffect(() => loadCalendarYear(year, setCalendar, setCustomDays, setError), [year, reloadKey]);
  const holidays = useMemo(() => holidayMap(calendar?.holidays), [calendar]);
  const custom = useMemo(() => customDayMap(customDays), [customDays]);

  return (
    <div className="space-y-5 p-2 md:p-4">
      <CalendarPageHeader year={year} onYearChange={setYear} />
      <CalendarLegend />
      <SyncStatus calendar={calendar} />
      {error ? <LoadError onRetry={() => setReloadKey(value => value + 1)} /> : null}
      {!error && !calendar ? <CalendarSkeleton /> : null}
      {calendar ? <CalendarYearGrid year={year} holidays={holidays} customDays={custom} today={colombiaDate()} canCustomize={canManageCalendar && year >= FIRST_CUSTOM_YEAR && year <= LAST_CUSTOM_YEAR} onSelect={actions.openDay} /> : null}
      <BusinessCalendarCustomDayModal {...actions.modalProps} />
    </div>
  );
}

function loadCalendarYear(year, setCalendar, setCustomDays, setError) {
  let active = true;
  setCalendar(null);
  setError(false);
  Promise.all([BusinessCalendarService.getYear(year), BusinessCalendarService.getCustomYear(year)])
    .then(([calendar, custom]) => {
      if (!active) return;
      replaceBusinessCalendarHolidays(calendar.data.holidays.map(item => item.date), [year]);
      replaceBusinessCalendarCustomDays(custom.data.customDays, [year]);
      setCalendar(calendar.data);
      setCustomDays(custom.data.customDays);
    })
    .catch(() => { if (active) setError(true); });
  return () => { active = false; };
}

function useCustomDayActions(year, setCustomDays) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [phase, setPhase] = useState('select');
  const [reason, setReason] = useState('');
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState('');

  const close = () => resetModal(setSelectedDate, setPhase, setReason, setActionError);
  const openDay = (date, state) => {
    setSelectedDate(date);
    setPhase(state.kind === 'custom' ? 'revert' : 'select');
    setReason('');
    setActionError('');
  };
  const save = () => createCustomDay({ selectedDate, reason, year, setCustomDays, setPending, setActionError, close });
  const revert = () => revertCustomDay({ selectedDate, year, setCustomDays, setPending, setActionError, close });

  return {
    openDay,
    modalProps: {
      open: Boolean(selectedDate), date: selectedDate, phase, reason, pending, error: actionError,
      onClose: close, onChooseCreate: () => setPhase('create'), onReasonChange: setReason, onSave: save, onRevert: revert,
    },
  };
}

async function createCustomDay(context) {
  context.setPending(true);
  context.setActionError('');
  try {
    const response = await BusinessCalendarService.createCustomDay({ date: context.selectedDate, reason: context.reason.trim() });
    addBusinessCalendarCustomDay(response.data);
    context.setCustomDays(days => [...days.filter(day => day.date !== response.data.date), response.data]);
    context.close();
  } catch (error) {
    if (await customDayMatchesDesiredState(context, true)) {
      context.close();
      return;
    }
    context.setActionError(apiMessage(error));
  } finally {
    context.setPending(false);
  }
}

async function revertCustomDay(context) {
  context.setPending(true);
  context.setActionError('');
  try {
    await BusinessCalendarService.deleteCustomDay(context.selectedDate);
    removeBusinessCalendarCustomDay(context.selectedDate);
    context.setCustomDays(days => days.filter(day => day.date !== context.selectedDate));
    context.close();
  } catch (error) {
    if (await customDayMatchesDesiredState(context, false)) {
      context.close();
      return;
    }
    context.setActionError(apiMessage(error));
  } finally {
    context.setPending(false);
  }
}

async function refreshCustomYear(year, setCustomDays) {
  const response = await BusinessCalendarService.getCustomYear(year);
  replaceBusinessCalendarCustomDays(response.data.customDays, [year]);
  setCustomDays(response.data.customDays);
  return response.data.customDays;
}

async function customDayMatchesDesiredState(context, shouldExist) {
  try {
    const days = await refreshCustomYear(context.year, context.setCustomDays);
    return days.some(day => day.date === context.selectedDate) === shouldExist;
  } catch (_) {
    return false;
  }
}

function resetModal(setSelectedDate, setPhase, setReason, setActionError) {
  setSelectedDate(null);
  setPhase('select');
  setReason('');
  setActionError('');
}

function apiMessage(error) {
  return error?.response?.data?.message || 'No fue posible actualizar el día seleccionado.';
}

function CalendarPageHeader({ year, onYearChange }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <CalendarDays className="h-6 w-6 text-primary" /> Calendario laboral
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Días utilizados por Dovela para calcular términos hábiles.</p>
      </div>
      <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
        <YearButton label="Año anterior" disabled={year <= MIN_YEAR} onClick={() => onYearChange(year - 1)}><ChevronLeft /></YearButton>
        <span className="min-w-20 text-center text-sm font-semibold tabular-nums">{year}</span>
        <YearButton label="Año siguiente" disabled={year >= MAX_YEAR} onClick={() => onYearChange(year + 1)}><ChevronRight /></YearButton>
      </div>
    </div>
  );
}

function YearButton({ label, disabled, onClick, children }) {
  return <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label={label} disabled={disabled} onClick={onClick}>{children}</Button>;
}

function CalendarLegend() {
  return (
    <div className="flex flex-wrap gap-4 rounded-lg border border-border/70 bg-card px-4 py-3 text-sm">
      <LegendItem className="bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700" label="Sábados y domingos" />
      <LegendItem className="bg-sky-100 ring-1 ring-sky-200 dark:bg-sky-950/60 dark:ring-sky-800" label="Festivos" />
      <LegendItem className="bg-emerald-100 ring-1 ring-emerald-300 dark:bg-emerald-950/60 dark:ring-emerald-700" label="Día no hábil personalizado" />
      <LegendItem className="bg-orange-100 ring-1 ring-orange-300 dark:bg-orange-950/55 dark:ring-orange-700" label="Día actual" />
    </div>
  );
}

function LegendItem({ className, label }) {
  return <span className="flex items-center gap-2"><span className={`h-3 w-3 rounded-sm ${className}`} />{label}</span>;
}

function SyncStatus({ calendar }) {
  if (!calendar?.sync && !calendar?.fallback) return null;
  const failed = calendar.sync?.status === 'failed';
  return (
    <div className={`flex flex-wrap items-center gap-2 rounded-md px-3 py-2 text-xs ${failed || calendar.fallback ? 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100' : 'bg-muted/50 text-muted-foreground'}`}>
      <span>{syncStatusText(calendar)}</span>
      {calendar.sync?.sourceUrl ? <a className="inline-flex items-center gap-1 underline" href={calendar.sync.sourceUrl} target="_blank" rel="noreferrer">Fuente <ExternalLink className="h-3 w-3" /></a> : null}
    </div>
  );
}

function syncStatusText(calendar) {
  if (calendar.fallback) return 'Mostrando el calendario de respaldo local.';
  if (calendar.sync.status === 'failed') return 'La última sincronización falló; se conserva el calendario vigente.';
  const date = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(calendar.sync.executedAt));
  return `Última sincronización: ${date}`;
}

function LoadError({ onRetry }) {
  return (
    <Card className="border-destructive/40"><CardContent className="flex items-center justify-between gap-3 p-4">
      <span className="text-sm text-destructive">No fue posible cargar el calendario laboral.</span>
      <Button variant="outline" size="sm" onClick={onRetry}><RefreshCw className="mr-1 h-4 w-4" />Reintentar</Button>
    </CardContent></Card>
  );
}

function CalendarSkeleton() {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{MONTHS.map(month => <div key={month} className="h-64 animate-pulse rounded-xl border border-border bg-muted/40" />)}</div>;
}

function CalendarYearGrid({ year, holidays, customDays, today, canCustomize, onSelect }) {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{MONTHS.map(month => <CalendarMonth key={month} year={year} month={month} holidays={holidays} customDays={customDays} today={today} canCustomize={canCustomize} onSelect={onSelect} />)}</div>;
}

function CalendarMonth({ year, month, holidays, customDays, today, canCustomize, onSelect }) {
  const days = buildMonthGrid(year, month);
  return (
    <section className="rounded-xl border border-border bg-card p-3 shadow-sm" aria-labelledby={`calendar-month-${month}`}>
      <h2 id={`calendar-month-${month}`} className="mb-3 text-sm font-semibold capitalize">{monthName(year, month)}</h2>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground">{WEEKDAYS.map(day => <span key={day}>{day}</span>)}</div>
      <div role="grid" className="mt-1 grid grid-cols-7 gap-1">{days.map(day => <CalendarDay key={day.date} day={day} holidays={holidays} customDays={customDays} today={today} canCustomize={canCustomize} onSelect={onSelect} />)}</div>
    </section>
  );
}

function CalendarDay({ day, holidays, customDays, today, canCustomize, onSelect }) {
  if (day.outsideMonth) return <div role="gridcell" aria-hidden="true" className="flex aspect-square min-h-11 items-center justify-center text-xs text-muted-foreground/30">{day.day}</div>;
  const state = getDayVisualState(day.date, holidays, customDays, today);
  const label = describeCalendarDay(day.date, holidays, customDays, today);
  const className = `flex aspect-square min-h-11 w-full items-center justify-center rounded-md text-xs tabular-nums transition-colors ${visualStateClasses(state.kind, state.isToday)}`;
  if (state.kind === 'custom' || (state.isInteractive && canCustomize)) {
    return <div role="gridcell"><button type="button" aria-label={label} title={state.customReason || undefined} data-day-kind={state.kind} className={`${className} cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`} onClick={() => onSelect(day.date, state)}>{day.day}</button></div>;
  }
  return <div role="gridcell" aria-label={label} title={state.holidayName || undefined} data-day-kind={state.kind} className={className}>{day.day}</div>;
}

function holidayMap(holidays = []) {
  return new Map(holidays.map(holiday => [holiday.date, holiday.name]));
}

function customDayMap(customDays = []) {
  return new Map(customDays.map(day => [day.date, day]));
}
