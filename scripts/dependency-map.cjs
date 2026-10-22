#!/usr/bin/env node
// Domain-level dependency map built from the real imports in src/.
//
//   npm run deps:map            -> Mermaid graph + table of cross-feature imports
//   npm run deps:map -- --json  -> raw edge list
//
// Rules it checks: shared/ never imports features/; app/ only wires features.
// Exit code 1 when an import cannot be resolved or shared/ depends on a feature.
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = path.join(root, 'src');
const IMPORT_RES = [
  /(?:import|export)\s[^'"`;]*?from\s*['"]([^'"]+)['"]/g,
  /import\(\s*['"]([^'"]+)['"]\s*\)/g,
  /^\s*import\s+['"]([^'"]+)['"]/gm,
];
const EXTS = ['', '.js', '.jsx', '.mjs', '.json', '/index.js', '/index.jsx'];
// Known legacy exceptions to the "shared never imports features" rule.
const ALLOWED_SHARED_TO_FEATURE = new Set(['shared -> expediente']);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['__tests__', '__mocks__', 'node_modules'].includes(entry.name)) walk(full, out);
    } else if (/\.(jsx?|mjs)$/.test(entry.name) && !/\.(test|spec)\./.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

function resolveFile(base) {
  for (const ext of EXTS) {
    const candidate = base + ext;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

function domainOf(file) {
  const parts = path.relative(src, file).split(path.sep);
  if (parts[0] === 'features') return parts[1];
  if (parts[0] === 'shared' || parts[0] === 'app') return parts[0];
  return 'entry';
}

const edges = new Map();
const unresolved = [];
for (const file of walk(src)) {
  const from = domainOf(file);
  const text = fs.readFileSync(file, 'utf8');
  for (const re of IMPORT_RES) {
    re.lastIndex = 0;
    let match;
    while ((match = re.exec(text))) {
      const spec = match[1];
      let base = null;
      if (spec.startsWith('@/')) base = path.join(src, spec.slice(2));
      else if (spec.startsWith('.')) base = path.resolve(path.dirname(file), spec);
      if (!base) continue;
      const target = resolveFile(base);
      if (!target) { unresolved.push(`${path.relative(root, file)} → ${spec}`); continue; }
      if (!target.startsWith(src)) continue;
      const to = domainOf(target);
      if (to === from) continue;
      const key = `${from} -> ${to}`;
      edges.set(key, (edges.get(key) || 0) + 1);
    }
  }
}

const list = [...edges].map(([key, count]) => {
  const [from, to] = key.split(' -> ');
  return { from, to, count };
}).sort((a, b) => b.count - a.count);

const violations = list.filter((e) => e.from === 'shared' && e.to !== 'shared' && !ALLOWED_SHARED_TO_FEATURE.has(`${e.from} -> ${e.to}`));

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ edges: list, unresolved, violations }, null, 2));
} else {
  const crossFeature = list.filter((e) => !['shared', 'app', 'entry'].includes(e.from) && !['shared', 'app', 'entry'].includes(e.to));
  console.log('```mermaid\nflowchart LR');
  for (const e of crossFeature) console.log(`  ${e.from.replace(/-/g, '_')}["${e.from}"] -->|${e.count}| ${e.to.replace(/-/g, '_')}["${e.to}"]`);
  for (const e of list.filter((x) => x.from === 'shared' && x.to !== 'app')) console.log(`  shared["shared"] -.->|"${e.count} legado"| ${e.to.replace(/-/g, '_')}["${e.to}"]`);
  console.log('```\n');
  console.log('| Desde | Hacia | Imports |\n|---|---|---|');
  for (const e of crossFeature) console.log(`| ${e.from} | ${e.to} | ${e.count} |`);
  const toShared = list.filter((e) => e.to === 'shared').reduce((sum, e) => sum + e.count, 0);
  console.log(`\nImports hacia shared/: ${toShared}. Imports sin resolver: ${unresolved.length}. Violaciones nuevas: ${violations.length}.`);
}

if (unresolved.length || violations.length) {
  for (const u of unresolved) console.error('Sin resolver: ' + u);
  for (const v of violations) console.error(`Violación: ${v.from} -> ${v.to} (${v.count})`);
  process.exitCode = 1;
}
