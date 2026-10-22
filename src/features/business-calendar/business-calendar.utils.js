const MONTH_FORMATTER = new Intl.DateTimeFormat('es-CO', { month: 'long', timeZone: 'UTC' });
const DAY_FORMATTER = new Intl.DateTimeFormat('es-CO', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
});
const COLOMBIA_DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Bogota',
});

export function colombiaDate(date = new Date()) {
  const parts = Object.fromEntries(COLOMBIA_DATE_FORMATTER.formatToParts(date).map(part => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function buildMonthGrid(year, month) {
  const firstDay = new Date(Date.UTC(year, month, 1));
  const mondayOffset = (firstDay.getUTCDay() + 6) % 7;
  const gridStart = new Date(firstDay);
  gridStart.setUTCDate(gridStart.getUTCDate() - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => buildGridDay(gridStart, index, month));
}

function buildGridDay(gridStart, index, month) {
  const current = new Date(gridStart);
  current.setUTCDate(current.getUTCDate() + index);
  return {
    date: current.toISOString().slice(0, 10),
    day: current.getUTCDate(),
    outsideMonth: current.getUTCMonth() !== month,
  };
}

export function getDayVisualState(date, holidays, customDays, today) {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  const holidayName = holidays.get(date) || null;
  const customDay = customDays.get(date) || null;
  const isWeekend = day === 0 || day === 6;
  const isToday = date === today;
  const isBusinessDay = !holidayName && !customDay && !isWeekend;

  if (holidayName) return { kind: 'holiday', holidayName, customReason: null, isBusinessDay: false, isInteractive: false, isToday };
  if (customDay) return { kind: 'custom', holidayName: null, customReason: customDay.reason, isBusinessDay: false, isInteractive: true, isToday };
  if (isWeekend) return { kind: 'weekend', holidayName: null, customReason: null, isBusinessDay: false, isInteractive: false, isToday };
  return { kind: isToday ? 'today' : 'business', holidayName: null, customReason: null, isBusinessDay, isInteractive: true, isToday };
}

export function describeCalendarDay(date, holidays, customDays, today) {
  const state = getDayVisualState(date, holidays, customDays, today);
  const labels = [DAY_FORMATTER.format(new Date(`${date}T00:00:00Z`))];
  if (state.isToday) labels.push('día actual');
  if (state.holidayName) labels.push(state.holidayName);
  else if (state.customReason) labels.push(`día no hábil personalizado: ${state.customReason}`);
  else if (!state.isBusinessDay) labels.push('sábado o domingo');
  else labels.push('día hábil');
  return labels.join(', ');
}

export function monthName(year, month) {
  return MONTH_FORMATTER.format(new Date(Date.UTC(year, month, 1)));
}

export function visualStateClasses(kind, isToday = false) {
  const classes = {
    today: 'bg-orange-100 text-orange-950 ring-1 ring-inset ring-orange-300 dark:bg-orange-950/55 dark:text-orange-100 dark:ring-orange-700',
    holiday: 'bg-sky-100 text-sky-950 dark:bg-sky-950/60 dark:text-sky-100',
    custom: 'bg-emerald-100 text-emerald-950 ring-1 ring-inset ring-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-100 dark:ring-emerald-700',
    weekend: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    business: 'text-foreground hover:bg-muted/60',
  };
  const todayRing = isToday && kind !== 'today' ? ' ring-2 ring-orange-400 dark:ring-orange-500' : '';
  return `${classes[kind]}${todayRing}`;
}
