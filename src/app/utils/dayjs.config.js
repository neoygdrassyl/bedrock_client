/**
 * dayjs global configuration for Dovela frontend.
 * Import this file ONCE in the app entry point (src/index.js).
 * After that, any `import dayjs from 'dayjs'` gets the fully configured instance.
 *
 * Plugins loaded:
 *   - isSameOrAfter / isSameOrBefore: used in fun_macrotable, GanttChart, HolidayCalendar, etc.
 *   - isoWeek: used in fun_macrotable, HolidayCalendar (startOf('isoWeek'), isoWeekday())
 *   - localizedFormat: for 'LL', 'LLL' tokens in typeParse dateParser
 *
 * Locale: 'es' (Spanish) set globally.
 */
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isoWeek from 'dayjs/plugin/isoWeek';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(isoWeek);
dayjs.extend(localizedFormat);
dayjs.locale('es');
