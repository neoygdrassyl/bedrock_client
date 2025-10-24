/**
 * Business rules for clocks calculations
 * Pure domain logic for computing curaduría remaining, limits, and states
 */

import moment from 'moment';
import { dateParser_dateDiff, dateParser_finalDate } from '../../../../../components/customClasses/typeParse';
import {
  getClockState,
  getSuspensionPreActa,
  getSuspensionPostActa,
  getExtension,
  getTotalSuspensionDays
} from '../selectors/clocksSelectors';
import { STATE_CODES, FUN_TYPE_TIME } from '../constants/clocksConstants';

/**
 * Compute curaduría remaining days with complete business rules
 * @param {Array} clocksData - Array of clock objects
 * @param {string} itemType - Type of item (i, ii, iii, iv, oa)
 * @param {string} today - Today's date in YYYY-MM-DD format
 * @returns {Object|null} Curaduría details or null if finalized
 */
export const computeCuraduriaRemaining = (clocksData, itemType, today = moment().format('YYYY-MM-DD')) => {
  // Check if already finalized
  const acta2Clock = getClockState(clocksData, STATE_CODES.ACTA_2);
  const actViav = getClockState(clocksData, STATE_CODES.ACTO_VIABILIDAD);
  if (acta2Clock?.date_start || actViav?.date_start) return null;

  const evaDefaultTime = FUN_TYPE_TIME[itemType] ?? 45;

  // Base dates
  const acta1Time = (getClockState(clocksData, STATE_CODES.ACTA_1) || {}).date_start;
  const ldfTime = (getClockState(clocksData, STATE_CODES.LDF) || {}).date_start;
  const corrTime = (getClockState(clocksData, STATE_CODES.CORR_RADICACION) || {}).date_start;

  // Suspensions and extension
  const preSusp = getSuspensionPreActa(clocksData);
  const postSusp = getSuspensionPostActa(clocksData);
  const extension = getExtension(clocksData);

  const totalSuspensionDays = getTotalSuspensionDays(clocksData);
  const extensionDays = extension.exists ? extension.days : 0;

  // Total available = base + suspensions + extension
  const baseTotal = evaDefaultTime + totalSuspensionDays + extensionDays;

  // If NO LDF, clock hasn't started
  if (!ldfTime) {
    return {
      total: baseTotal,
      used: 0,
      remaining: baseTotal,
      reference: null,
      from: 'NOT_STARTED',
      today: today,
      suspensions: totalSuspensionDays,
      extension: extensionDays,
      preActaUsed: 0,
      preFirstEventUsed: 0,
      preFirstEventExtra: 0,
      paused: false,
      notStarted: true,
      firstEventDate: null,
      firstEventType: null,
    };
  }

  // PRE-ACTA DAYS: always subtract business days between LDF (5) and Acta 1 (30) when both exist
  const preActaUsed = (ldfTime && acta1Time) ? dateParser_dateDiff(ldfTime, acta1Time) : 0;

  // NEW: identify the "first suspension/correction" FROM LDF
  const firstEventCandidates = [];
  if (preSusp?.start?.date_start) firstEventCandidates.push({ date: preSusp.start.date_start, type: 'SUSP_PRE_START(300)' });
  if (postSusp?.start?.date_start) firstEventCandidates.push({ date: postSusp.start.date_start, type: 'SUSP_POST_START(301)' });
  if (corrTime) firstEventCandidates.push({ date: corrTime, type: 'CORR_35' });

  const validFirsts = firstEventCandidates.filter(c =>
    c.date && (moment(c.date).isAfter(ldfTime) || moment(c.date).isSame(ldfTime))
  );

  let firstEvent = null;
  if (validFirsts.length) {
    validFirsts.sort((a, b) => (moment(a.date).isBefore(b.date) ? -1 : 1));
    firstEvent = validFirsts[0];
  }

  const preFirstEventUsed = firstEvent ? dateParser_dateDiff(ldfTime, firstEvent.date) : 0;
  const preFirstEventExtra = Math.max(0, preFirstEventUsed - preActaUsed);

  // Reference candidates
  const candidates = [];
  if (acta1Time) {
    // After Acta 1: check post-suspension and corrections
    if (postSusp?.end?.date_start) candidates.push({ date: postSusp.end.date_start, from: 'SUSP_POST_END(351)' });
    if (postSusp?.start?.date_start) candidates.push({ date: postSusp.start.date_start, from: 'SUSP_POST_START(301)' });
    if (corrTime) candidates.push({ date: corrTime, from: 'CORR_35' });
  } else {
    // Before Acta 1: check pre-suspension and LDF
    if (preSusp?.end?.date_start) candidates.push({ date: preSusp.end.date_start, from: 'SUSP_PRE_END(350)' });
    if (preSusp?.start?.date_start) candidates.push({ date: preSusp.start.date_start, from: 'SUSP_PRE_START(300)' });
    if (ldfTime) candidates.push({ date: ldfTime, from: 'LDF_5' });
  }

  if (!candidates.length) {
    // PAUSED state: Acta 1 exists but no valid reference candidates
    if (acta1Time) {
      const remainingPaused = baseTotal - (preActaUsed + preFirstEventExtra);
      return {
        total: baseTotal,
        used: preActaUsed + preFirstEventExtra,
        remaining: remainingPaused,
        reference: null,
        from: 'PAUSED',
        today: today,
        suspensions: totalSuspensionDays,
        extension: extensionDays,
        preActaUsed,
        preFirstEventUsed,
        preFirstEventExtra,
        paused: true,
        notStarted: false,
        firstEventDate: firstEvent?.date || null,
        firstEventType: firstEvent?.type || null,
      };
    }
    // NOT_STARTED state
    return {
      total: baseTotal,
      used: 0,
      remaining: baseTotal,
      reference: null,
      from: 'NOT_STARTED',
      today: today,
      suspensions: totalSuspensionDays,
      extension: extensionDays,
      preActaUsed: 0,
      preFirstEventUsed: 0,
      preFirstEventExtra: 0,
      paused: false,
      notStarted: true,
      firstEventDate: firstEvent?.date || null,
      firstEventType: firstEvent?.type || null,
    };
  }

  // Sort candidates by date descending to get most recent
  candidates.sort((a, b) => (moment(a.date).isAfter(b.date) ? -1 : 1));
  const lastRef = candidates[0];

  // Active suspension after reference => freeze "today" at its start
  let effectiveToday = today;
  if (acta1Time) {
    if (postSusp.exists && !postSusp.end?.date_start && postSusp.start?.date_start) {
      if (moment(postSusp.start.date_start).isAfter(lastRef.date)) {
        effectiveToday = postSusp.start.date_start;
      }
    }
  } else {
    if (preSusp.exists && !preSusp.end?.date_start && preSusp.start?.date_start) {
      if (moment(preSusp.start.date_start).isAfter(lastRef.date)) {
        effectiveToday = preSusp.start.date_start;
      }
    }
  }

  const usedAfterRef = dateParser_dateDiff(lastRef.date, effectiveToday);
  const used = preActaUsed + preFirstEventExtra + usedAfterRef;

  const remaining = baseTotal - used;

  return {
    total: baseTotal,
    used,
    remaining,
    reference: lastRef.date,
    from: lastRef.from,
    today: effectiveToday,
    suspensions: totalSuspensionDays,
    extension: extensionDays,
    preActaUsed,
    preFirstEventUsed,
    preFirstEventExtra,
    usedAfterRef,
    paused: false,
    notStarted: false,
    firstEventDate: firstEvent?.date || null,
    firstEventType: firstEvent?.type || null,
  };
};

/**
 * Compute Acta 1 limit with smart priority
 * Priority order:
 * 1) Most recent finish: extension end (401) or pre-suspension end (350)
 * 2) Most recent start: extension start (400) or pre-suspension start (300)
 * 3) LDF (5)
 * @param {Array} clocksData - Array of clock objects
 * @param {string} itemType - Type of item
 * @returns {Object|null} Limit details or null
 */
export const computeActa1LimitSmart = (clocksData, itemType) => {
  const ldf = (getClockState(clocksData, STATE_CODES.LDF) || {}).date_start;
  if (!ldf) return null;

  const baseDays = FUN_TYPE_TIME[itemType] ?? 45;
  const ext = getExtension(clocksData);
  const pre = getSuspensionPreActa(clocksData);

  // Priority 1: Finish candidates (most recent)
  const finishCandidates = [];
  if (ext?.end?.date_start) finishCandidates.push({ date: ext.end.date_start, kind: 'EXT_END(401)' });
  if (pre?.end?.date_start) finishCandidates.push({ date: pre.end.date_start, kind: 'SUSP_PRE_END(350)' });

  // Priority 2: Start candidates (most recent)
  const startCandidates = [];
  if (ext?.start?.date_start) startCandidates.push({ date: ext.start.date_start, kind: 'EXT_START(400)' });
  if (pre?.start?.date_start) startCandidates.push({ date: pre.start.date_start, kind: 'SUSP_PRE_START(300)' });

  const pickMostRecent = (arr) => {
    if (!arr.length) return null;
    const sorted = [...arr].sort((a, b) => (moment(a.date).isAfter(b.date) ? -1 : 1));
    return sorted[0];
  };

  let baseChoice = null;
  if (finishCandidates.length) {
    baseChoice = pickMostRecent(finishCandidates);
  } else if (startCandidates.length) {
    baseChoice = pickMostRecent(startCandidates);
  } else {
    baseChoice = { date: ldf, kind: 'LDF(5)' };
  }

  // Days used until base (excluding suspension time if base is suspension end)
  let usedBeforeBase = 0;
  if (baseChoice.kind === 'SUSP_PRE_END(350)' && pre?.start?.date_start) {
    // If base is suspension end, count only LDF to suspension start
    usedBeforeBase = dateParser_dateDiff(ldf, pre.start.date_start);
  } else {
    // Otherwise count LDF to base
    usedBeforeBase = dateParser_dateDiff(ldf, baseChoice.date);
  }

  // Extension days applicable if it started on or after LDF and before/on Acta 1
  const extDays = (ext?.exists && ext.start?.date_start && moment(ext.start.date_start).isSameOrAfter(ldf)) 
    ? ext.days 
    : 0;

  let remainingDays = baseDays - usedBeforeBase + extDays;
  if (remainingDays < 0) remainingDays = 0;

  const limitDate = dateParser_finalDate(baseChoice.date, remainingDays);
  const tooltip = `Base: ${baseChoice.kind} | Usados hasta base: ${usedBeforeBase} | Prórroga: ${extDays} | Restantes: ${remainingDays}`;

  return {
    limitDate,
    baseChoice: baseChoice.kind,
    baseDate: baseChoice.date,
    usedBeforeBase,
    extDays,
    remainingDays,
    tooltip
  };
};
