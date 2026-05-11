#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

function parseArgs(argv) {
  const args = {
    mode: 'report-only',
    before: null,
    after: null,
    waivers: null,
    targetRule: null,
    targetRules: [],
    targetSeverity: null,
    requireDecrease: false,
    requireNonincrease: false,
    noNewErrorsUntouched: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--before') {
      args.before = argv[index + 1];
      index += 1;
    } else if (arg === '--after') {
      args.after = argv[index + 1];
      index += 1;
    } else if (arg === '--mode') {
      args.mode = argv[index + 1];
      index += 1;
    } else if (arg === '--waivers') {
      args.waivers = argv[index + 1];
      index += 1;
    } else if (arg === '--target-rule') {
      args.targetRule = argv[index + 1];
      index += 1;
    } else if (arg === '--target-rules') {
      args.targetRules = argv[index + 1].split(',').map((rule) => rule.trim()).filter(Boolean);
      index += 1;
    } else if (arg === '--target-severity') {
      args.targetSeverity = argv[index + 1];
      index += 1;
    } else if (arg === '--require-decrease') {
      args.requireDecrease = true;
    } else if (arg === '--require-nonincrease') {
      args.requireNonincrease = true;
    } else if (arg === '--no-new-errors-untouched') {
      args.noNewErrorsUntouched = true;
    }
  }

  return args;
}

function loadDiagnostics(filePath) {
  if (!filePath || !existsSync(filePath)) {
    throw new Error(`Missing diagnostics file: ${filePath}`);
  }
  const payload = JSON.parse(readFileSync(filePath, 'utf8'));
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.issues)) return payload.issues;
  if (Array.isArray(payload.diagnostics)) return payload.diagnostics;
  return [];
}

function ruleId(issue) {
  if (issue.ruleId) return issue.ruleId;
  if (issue.plugin && issue.rule) return `${issue.plugin}/${issue.rule}`;
  return issue.rule || 'unknown/unknown';
}

function filePath(issue) {
  return issue.filePath || issue.file || 'unknown';
}

function issueKey(issue) {
  return [filePath(issue), ruleId(issue), issue.line || 0, issue.column || 0, issue.message || ''].join('::');
}

function countByRule(issues) {
  return issues.reduce((counts, issue) => {
    const key = ruleId(issue);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function filterIssues(issues, args) {
  const ruleTargets = new Set([args.targetRule, ...args.targetRules].filter(Boolean));
  return issues.filter((issue) => {
    if (args.targetSeverity && issue.severity !== args.targetSeverity) return false;
    if (ruleTargets.size > 0 && !ruleTargets.has(ruleId(issue))) return false;
    return true;
  });
}

function loadWaivers(filePath) {
  if (!filePath || !existsSync(filePath)) return [];
  const text = readFileSync(filePath, 'utf8');
  const sections = text.split(/^## Waiver:/m).slice(1);
  return sections.map((section) => {
    const file = section.match(/\*\*File:\*\*\s*(.+)/)?.[1]?.trim();
    const rule = section.match(/\*\*Rule:\*\*\s*(.+)/)?.[1]?.trim();
    const count = Number(section.match(/\*\*Count:\*\*\s*(\d+)/)?.[1] || 1);
    return { file, rule, count };
  }).filter((waiver) => waiver.file && waiver.rule);
}

function countUnwaivedErrors(issues, waivers) {
  const remaining = new Map();
  for (const issue of issues.filter((item) => item.severity === 'error')) {
    const key = `${filePath(issue)}::${ruleId(issue)}`;
    remaining.set(key, (remaining.get(key) || 0) + 1);
  }

  for (const waiver of waivers) {
    const key = `${waiver.file}::${waiver.rule}`;
    const next = Math.max(0, (remaining.get(key) || 0) - waiver.count);
    if (next === 0) remaining.delete(key);
    else remaining.set(key, next);
  }

  return remaining;
}

function changedFiles() {
  const result = spawnSync('git', ['diff', '--name-only'], { encoding: 'utf8' });
  if (result.status !== 0) return new Set();
  return new Set(result.stdout.split(/\r?\n/).filter(Boolean));
}

const args = parseArgs(process.argv.slice(2));
const before = loadDiagnostics(args.before);
const after = loadDiagnostics(args.after);
const beforeFiltered = filterIssues(before, args);
const afterFiltered = filterIssues(after, args);
const beforeRuleCounts = countByRule(beforeFiltered);
const afterRuleCounts = countByRule(afterFiltered);

const summary = {
  before: beforeFiltered.length,
  after: afterFiltered.length,
  delta: afterFiltered.length - beforeFiltered.length,
  rules: Object.fromEntries(
    [...new Set([...Object.keys(beforeRuleCounts), ...Object.keys(afterRuleCounts)])]
      .sort()
      .map((rule) => [rule, { before: beforeRuleCounts[rule] || 0, after: afterRuleCounts[rule] || 0 }]),
  ),
};

console.log(JSON.stringify(summary, null, 2));

const failures = [];

if (args.requireDecrease && afterFiltered.length >= beforeFiltered.length) {
  failures.push(`Expected target count to decrease, before=${beforeFiltered.length}, after=${afterFiltered.length}`);
}

if (args.requireNonincrease && afterFiltered.length > beforeFiltered.length) {
  failures.push(`Expected target count not to increase, before=${beforeFiltered.length}, after=${afterFiltered.length}`);
}

if (args.mode === 'errors-zero-or-waived') {
  const unwaived = countUnwaivedErrors(after, loadWaivers(args.waivers));
  if (unwaived.size > 0) {
    failures.push(`Unwaived errors remain:\n${[...unwaived.entries()].map(([key, count]) => `${key}: ${count}`).join('\n')}`);
  }
}

if (args.noNewErrorsUntouched) {
  const beforeErrorKeys = new Set(before.filter((issue) => issue.severity === 'error').map(issueKey));
  const touchedFiles = changedFiles();
  const newUntouchedErrors = after
    .filter((issue) => issue.severity === 'error')
    .filter((issue) => !beforeErrorKeys.has(issueKey(issue)))
    .filter((issue) => !touchedFiles.has(filePath(issue)));

  if (newUntouchedErrors.length > 0) {
    failures.push(`New errors appeared in untouched files:\n${newUntouchedErrors.map((issue) => `${filePath(issue)}:${issue.line || 0}:${issue.column || 0} ${ruleId(issue)}`).join('\n')}`);
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n\n'));
  process.exit(1);
}
