import dayjs from 'dayjs';
import { nomens } from '../components/jsons/vars';

/**
 * Next-consecutive rules shared by "Radicar" (fun.js), "Nueva entrada" (submit_manage.js) and
 * the online radication inbox. The server always revalidates; these only prefill the forms.
 */

// Historical padding of fun.js / submit_manage.js, kept verbatim: zero-pads to 4 digits and
// leaves larger numbers untouched (after the first concatenation the comparisons coerce back
// to numbers, exactly like the original inline loops).
export function padConsecutive(value) {
    let consecutive = value;
    if (consecutive < 1000) consecutive = "0" + consecutive;
    if (consecutive < 100) consecutive = "0" + consecutive;
    if (consecutive < 10) consecutive = "0" + consecutive;
    return `${consecutive}`;
}

/**
 * Licence number after `lastId` (`GET /api/fun/getlast/id` → `[{ id }]`), e.g.
 * 68001-1-26-0041 → 68001-1-26-0042. Without a previous number it starts the current year
 * with the curaduría prefix (`nomens`).
 */
export function nextLicenseIdPublic(lastId, { prefix = nomens, now = dayjs() } = {}) {
    if (!lastId) return prefix + now.format('YY') + "-0001";
    const parts = lastId.split('-');
    return `${parts[0]}-${parts[1]}-${parts[2]}-${padConsecutive(Number(parts[3]) + 1)}`;
}

/**
 * VR after `lastVr` (`GET /api/submit/getid/lastid` → `[{ vr }]`), e.g. VR26-0122 → VR26-0123.
 * Without a previous VR it starts the current year.
 */
export function nextVrId(lastVr, { now = dayjs() } = {}) {
    if (!lastVr) return "VR" + now.format('YY') + "-0001";
    return lastVr.split('-')[0] + "-" + padConsecutive(Number(lastVr.split('-')[1]) + 1);
}
