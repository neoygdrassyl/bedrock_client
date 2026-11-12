import { logEvent } from '@/shared/observability/logger';
import { calculateLegalLimit } from './scheduleUtils';

/**
 * Read-only helpers over the clock definitions (`generateClocks`). They describe what the
 * events table shows; they never change a limit, a phase or a definition.
 */

/**
 * Rows that are not rendered: hidden by definition, waiting for a required clock, or
 * optional without a record.
 */
export const isClockRowHidden = ({ value, clock, getClock, getClockVersion }) => {
  if (value.show === false) return true;
  if (value.requiredClock) {
    const required = value.version !== undefined
      ? (getClockVersion(value.requiredClock, value.version) || getClock(value.requiredClock))
      : getClock(value.requiredClock);
    if (!required?.date_start) return true;
  }
  if (value.optional && !clock) return true;
  return false;
};

export const getDefinitionClock = (value, { getClock, getClockVersion }) => (
  value.version !== undefined ? getClockVersion(value.state, value.version) : getClock(value.state)
);

/** In a desisted process the sections after the desistimiento block are dropped, except "Ejecutoria". */
export const filterClocksAfterDesist = (items, isDesisted) => {
  if (!isDesisted) return items;

  let skip = false;
  let inDesistBlock = false;
  const res = [];

  items.forEach((item) => {
    const titleUpper = (item.title || '').toUpperCase();

    if (titleUpper.includes('EJECUTORIA')) {
      skip = false;
      inDesistBlock = false;
      res.push(item);
      return;
    }

    if (titleUpper.includes('DESIST')) {
      skip = false;
      inDesistBlock = true;
      res.push(item);
      return;
    }

    if (item.title && !titleUpper.includes('DESIST')) {
      if (inDesistBlock) {
        skip = true;
        inDesistBlock = false;
      }
    }

    if (!skip) res.push(item);
  });

  return res;
};

const safeLegalLimit = (value, manager) => {
  try {
    return calculateLegalLimit(value.state, value, manager) || null;
  } catch {
    return null;
  }
};

/**
 * The definitions as the table lays them out: one entry per group title, each with its
 * event rows. `index` is the position in `clocksToShow` (the row id and the date input id
 * use it). Groups hidden by definition (`show: false`) are left out with their rows.
 *
 * Invariant: the list always opens with a title. `generateClocks` concatenates sections
 * (`extraClocks`, `paymentsClocks`, `finalClocks`, each desistimiento section) that all start
 * with their own `{ title }`, for every class of expediente, and `filterClocksAfterDesist`
 * never drops that first title (see `clockRows.test.js`). An event row placed before the
 * first title would have no group to be drawn under, so in development it is reported as
 * `clock_rows_without_group` instead of going unnoticed.
 */
export const buildClockGroups = (clocksToShow, manager) => {
  const groups = [];
  let current = null;
  let titleSeen = false;
  const leading = [];

  (clocksToShow || []).forEach((value, index) => {
    if (value.title) {
      titleSeen = true;
      current = value.show === false ? null : { index, title: value.title, rows: [] };
      if (current) groups.push(current);
      return;
    }
    if (!current) {
      if (!titleSeen) leading.push({ index, state: value.state ?? null, name: value.name ?? null });
      return;
    }

    const clock = getDefinitionClock(value, manager);
    const date = clock?.date_start ?? value.manualDate ?? '';
    current.rows.push({
      index,
      value,
      clock,
      state: value.state,
      version: value.version,
      name: value.name ?? clock?.name ?? '',
      groupTitle: current.title,
      groupIndex: current.index,
      date,
      hasDate: Boolean(date),
      // `icon: "empty"` is how the definitions mark an event that may not happen.
      optional: value.icon === 'empty',
      hidden: isClockRowHidden({ value, clock, getClock: manager.getClock, getClockVersion: manager.getClockVersion }),
      limitDate: safeLegalLimit(value, manager),
    });
  });

  if (leading.length && import.meta.env.DEV) {
    logEvent('warn', 'clock_rows_without_group', {
      message: `${leading.length} clock definition(s) come before the first group title and are not shown.`,
      data: { rows: leading },
    });
  }

  return groups;
};

export const flattenClockRows = (groups) => (groups || []).flatMap((group) => group.rows);

const rowLabel = (row) => row.name || `Evento ${row.state}`;

/**
 * What a change of definitions (for example another notification route) does to the
 * events on screen, by clock state:
 *   added          events that appear
 *   removed        events that stop being shown
 *   hiddenDated    removed events that have a registered date (the date stays stored)
 *   relabeledDated events that keep their date but are shown under another name, because
 *                  two definitions share one clock state (33 and 57: "por aviso" and
 *                  "comunicación")
 *   appearingDated added events that already have a stored date
 */
export const diffVisibleClockRows = (beforeGroups, afterGroups) => {
  const visible = (groups) => flattenClockRows(groups).filter((row) => !row.hidden && row.state !== false && row.state != null);
  const keyOf = (row) => `${row.state}::${row.version ?? ''}`;
  const before = new Map(visible(beforeGroups).map((row) => [keyOf(row), row]));
  const after = new Map(visible(afterGroups).map((row) => [keyOf(row), row]));

  const added = [];
  const removed = [];
  const hiddenDated = [];
  const relabeledDated = [];

  before.forEach((row, key) => {
    const next = after.get(key);
    if (!next) {
      removed.push({ name: rowLabel(row), date: row.date });
      if (row.hasDate) hiddenDated.push({ name: rowLabel(row), date: row.date });
      return;
    }
    if (rowLabel(next) !== rowLabel(row)) {
      added.push({ name: rowLabel(next), date: next.date });
      removed.push({ name: rowLabel(row), date: row.date });
      if (row.hasDate) relabeledDated.push({ name: rowLabel(row), nextName: rowLabel(next), date: row.date });
    }
  });
  // Events that come into view already dated: the date was stored while the event was
  // shown (possibly under its other name) and takes effect again with this change.
  const appearingDated = [];
  after.forEach((row, key) => {
    if (before.has(key)) return;
    added.push({ name: rowLabel(row), date: row.date });
    if (row.hasDate) appearingDated.push({ name: rowLabel(row), date: row.date });
  });

  return { added, removed, hiddenDated, relabeledDated, appearingDated };
};
