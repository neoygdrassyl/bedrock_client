import { describe, expect, it } from 'vitest';

import { addMonths, dateParts, daysInMonth, realDateParts, todayIso, wholeMonthsUntil } from './calendar';
import { certifiedDuration } from '@/features/professional-registry/experienceDuration';
import { todayIso as specificTodayIso, wholeMonthsBetween } from './specificExperience';
import { dialogTodayIso, experienceDuration, specificExperience, validityTodayIso } from './__fixtures__/calendarReference';

// The calendar helpers gathered in calendar.js must answer exactly like the copies they replaced
// (__fixtures__/calendarReference.js), on every day of the covered years and on invalid input.
// Month arithmetic depends on month lengths and leap years, not on how many years are walked, so the years are chosen
// to hold every case: 1999..2005 (common years, 2000 leap by the 400 rule, 2004 leap, year changes, months of 28, 29,
// 30 and 31 days) and 2099..2101 (2100 is not leap although a multiple of 4).
//
// A mismatch is counted and only the first examples are kept: a broken helper differs on hundreds of thousands of
// inputs, and diffing an array that large exhausts memory instead of failing.

const DAY_MS = 24 * 60 * 60 * 1000;
const iso = (time) => new Date(time).toISOString().slice(0, 10);

const YEARS = [[1999, 2005], [2099, 2101]];
const DAYS = [];
YEARS.forEach(([from, to]) => {
  for (let time = Date.UTC(from, 0, 1); time <= Date.UTC(to, 11, 31); time += DAY_MS) DAYS.push(iso(time));
});
const isMonthEnd = (day) => iso(Date.parse(`${day}T00:00:00Z`) + DAY_MS).endsWith('-01');
// A dense sample: every first, 28th and last day of a month (so every 29 February too).
const SAMPLE = DAYS.filter((day) => /-(01|28)$/.test(day) || isMonthEnd(day));
const INVALID = [
  '', null, undefined, 0, 20210101, 'garbage', '2021-02-30', '2021-02-29', '2021-13-01', '2021-00-10', '2021-01-00',
  '2021-01-32', '2021-1-1', ' 2021-01-01', '2021-01-01 ', '2021-01-01T00:00:00Z', '0000-01-01', '0050-01-31',
  '0099-12-31', '1899-12-31', '9999-12-31', new Date('2021-01-01T00:00:00Z'),
];
const MONTHS = Array.from({ length: 25 }, (_, index) => index);
const key = (value) => (value && typeof value === 'object' ? JSON.stringify(value) : String(value));
// SAMPLE holds at most three days per month (1st, 28th and last).
const SAMPLE_PER_MONTH = 3;
const EXAMPLES = 20;

// Counts mismatches and keeps the first EXAMPLES of them.
function mismatches() {
  const found = { count: 0, examples: [] };
  found.add = (entry) => {
    found.count += 1;
    if (found.examples.length < EXAMPLES) found.examples.push(entry);
  };
  found.expectNone = (label) => expect({ label, count: found.count, examples: found.examples })
    .toEqual({ label, count: 0, examples: [] });
  return found;
}

// The inputs where `same` is false, counted and with the first examples only.
function expectAll(inputs, same, label) {
  const found = mismatches();
  inputs.forEach((input) => { if (!same(input)) found.add(input); });
  found.expectNone(label);
}

describe('calendar', () => {
  it('dateParts answers like the loose parser of specificExperience and realDateParts like the strict one of experienceDuration', () => {
    const inputs = DAYS.concat(INVALID);
    expectAll(inputs, (day) => key(dateParts(day)) === key(specificExperience.dateParts(day)), 'dateParts');
    expectAll(inputs, (day) => key(realDateParts(day)) === key(experienceDuration.dateParts(day)), 'realDateParts');
  });

  it('addMonths and daysInMonth answer like both copies for 0..24 months from every day', () => {
    const problems = mismatches();
    DAYS.forEach((day) => {
      const parts = specificExperience.dateParts(day);
      MONTHS.forEach((count) => {
        const expected = experienceDuration.addMonths(parts, count);
        if (specificExperience.addMonths(parts, count) !== expected) problems.add(['copies', day, count]);
        if (addMonths(parts, count) !== expected) problems.add(['addMonths', day, count]);
      });
    });
    YEARS.forEach(([from, to]) => {
      for (let year = from; year <= to; year += 1) {
        for (let month = -1; month <= 12; month += 1) {
          const expected = experienceDuration.daysInMonth(year, month);
          if (daysInMonth(year, month) !== expected || specificExperience.daysInMonth(year, month) !== expected) {
            problems.add(['daysInMonth', year, month]);
          }
        }
      }
    });
    problems.expectNone('addMonths / daysInMonth');
  });

  it('certifiedDuration and wholeMonthsBetween answer like the reference for every pair of the sample up to 24 months apart', () => {
    const problems = mismatches();
    // A duration as text, compared as a string.
    const text = (duration) => (duration ? `${duration.years}/${duration.months}/${duration.days}` : String(duration));
    const check = (from, to) => {
      if (text(certifiedDuration(from, to)) !== text(experienceDuration.certifiedDuration(from, to))) problems.add(['certified', from, to]);
      if (wholeMonthsBetween(from, to) !== specificExperience.wholeMonthsBetween(from, to)) problems.add(['whole', from, to]);
    };
    // Each sample day against the sample days of the next 24 months (the result depends on the month count, so longer
    // spans add no new case), and the reversed pairs (start after end) of the same windows.
    const window = SAMPLE_PER_MONTH * 25;
    SAMPLE.forEach((from, index) => SAMPLE.slice(index, index + window).forEach((to) => {
      check(from, to);
      check(to, from);
    }));
    DAYS.forEach((day) => ['1999-01-01', '2000-02-29', '2004-12-31', '2100-02-28'].forEach((end) => {
      check(day, end);
      check(end, day);
    }));
    INVALID.forEach((bad) => ['2020-02-29', '2021-03-31'].forEach((day) => { check(bad, day); check(day, bad); }));
    expectAll(DAYS.filter(isMonthEnd), (day) => SAMPLE.includes(day), 'the sample has every month end');
    problems.expectNone('certifiedDuration / wholeMonthsBetween');
  });

  it('wholeMonthsUntil counts the whole months that fit before the end', () => {
    const from = dateParts('2021-01-31');
    expect(wholeMonthsUntil(from, dateParts('2021-02-28'), Date.UTC(2021, 1, 28))).toBe(1);
    expect(wholeMonthsUntil(from, dateParts('2021-02-27'), Date.UTC(2021, 1, 27))).toBe(0);
    expect(wholeMonthsUntil(from, dateParts('2021-01-30'), Date.UTC(2021, 0, 30))).toBe(-1);
  });

  it('todayIso is one function, re-exported by specificExperience, with the value of the three copies', () => {
    expect(specificTodayIso).toBe(todayIso);
    expect(new Set([todayIso(), specificExperience.todayIso(), dialogTodayIso(), validityTodayIso()]).size).toBe(1);
  });

  // The two parsers below look alike but are not the same function, so both are kept: the strict one refuses the
  // impossible days that the loose one passes on.
  it('the loose and the strict parser agree on every real day and differ on impossible ones', () => {
    expectAll(DAYS, (day) => key(dateParts(day)) === key(realDateParts(day)), 'loose vs strict on real days');
    expect(INVALID.filter((day) => key(dateParts(day)) !== key(realDateParts(day)))).toEqual(
      ['2021-02-30', '2021-02-29', '2021-13-01', '2021-00-10', '2021-01-00', '2021-01-32'],
    );
  });
});
