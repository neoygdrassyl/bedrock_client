#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { parse } from '@babel/parser';

const ROOT = process.cwd();
const SOURCE_DIRS = ['src'];
const ALLOWED_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.cjs']);
const EXCLUDED_DIRS = new Set([
  '.git',
  'node_modules',
  'build',
  'dist',
  'coverage',
  'playwright-report',
  'test-results',
  '__tests__',
  '__mocks__'
]);

const ARRAY_METHODS = new Set(['map', 'filter', 'reduce', 'forEach', 'find', 'some', 'every', 'flatMap']);
const STRICT_MODE = process.argv.includes('--strict');

async function exists(dirPath) {
  try {
    await fs.access(dirPath);
    return true;
  } catch {
    return false;
  }
}

async function collectFiles(startDir, files = []) {
  const entries = await fs.readdir(startDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(startDir, entry.name);

    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRS.has(entry.name)) {
        await collectFiles(fullPath, files);
      }
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (ALLOWED_EXTENSIONS.has(ext)) {
      files.push(fullPath);
    }
  }

  return files;
}

function parseFile(source, filename) {
  return parse(source, {
    sourceType: 'unambiguous',
    sourceFilename: filename,
    plugins: ['jsx'],
    errorRecovery: false
  });
}

function walk(node, visitors, ancestors = []) {
  if (!node || typeof node !== 'object') {
    return;
  }

  if (Array.isArray(node)) {
    for (const child of node) {
      walk(child, visitors, ancestors);
    }
    return;
  }

  const visitor = visitors[node.type];
  if (visitor) {
    visitor(node, ancestors);
  }

  const nextAncestors = ancestors.concat(node);
  for (const key of Object.keys(node)) {
    if (key === 'loc' || key === 'start' || key === 'end') {
      continue;
    }

    const value = node[key];
    if (value && typeof value === 'object') {
      walk(value, visitors, nextAncestors);
    }
  }
}

function isUseStateArrayInitializer(node) {
  if (!node || node.type !== 'CallExpression') {
    return false;
  }

  const callee = node.callee;
  const isUseState =
    (callee?.type === 'Identifier' && callee.name === 'useState') ||
    (callee?.type === 'MemberExpression' && callee.property?.type === 'Identifier' && callee.property.name === 'useState');

  if (!isUseState) {
    return false;
  }

  return node.arguments?.[0]?.type === 'ArrayExpression';
}

function collectLocallySafeArrayVars(ast) {
  const safeVars = new Set();

  walk(ast, {
    VariableDeclarator(node) {
      if (node.id?.type === 'Identifier' && node.init?.type === 'ArrayExpression') {
        safeVars.add(node.id.name);
        return;
      }

      if (
        node.id?.type === 'ArrayPattern' &&
        node.id.elements?.[0]?.type === 'Identifier' &&
        isUseStateArrayInitializer(node.init)
      ) {
        safeVars.add(node.id.elements[0].name);
      }
    }
  });

  return safeVars;
}

function getMemberPropertyName(memberExpr) {
  if (!memberExpr || memberExpr.type !== 'MemberExpression') {
    return null;
  }

  if (memberExpr.computed) {
    return memberExpr.property?.type === 'StringLiteral' ? memberExpr.property.value : null;
  }

  return memberExpr.property?.type === 'Identifier' ? memberExpr.property.name : null;
}

function getRootIdentifierName(expr) {
  if (!expr || typeof expr !== 'object') {
    return null;
  }

  if (expr.type === 'Identifier') {
    return expr.name;
  }

  if (expr.type === 'MemberExpression') {
    return getRootIdentifierName(expr.object);
  }

  if (expr.type === 'OptionalMemberExpression') {
    return getRootIdentifierName(expr.object);
  }

  if (expr.type === 'CallExpression') {
    return getRootIdentifierName(expr.callee);
  }

  if (expr.type === 'OptionalCallExpression') {
    return getRootIdentifierName(expr.callee);
  }

  return null;
}

function isArrayIsArrayGuard(testNode, variableName) {
  if (!testNode || !variableName) {
    return false;
  }

  if (testNode.type === 'CallExpression') {
    const callee = testNode.callee;
    const firstArg = testNode.arguments?.[0];
    const isArrayIsArray =
      callee?.type === 'MemberExpression' &&
      callee.object?.type === 'Identifier' &&
      callee.object.name === 'Array' &&
      callee.property?.type === 'Identifier' &&
      callee.property.name === 'isArray';

    return isArrayIsArray && firstArg?.type === 'Identifier' && firstArg.name === variableName;
  }

  if (testNode.type === 'LogicalExpression') {
    return (
      isArrayIsArrayGuard(testNode.left, variableName) ||
      isArrayIsArrayGuard(testNode.right, variableName)
    );
  }

  if (testNode.type === 'UnaryExpression' || testNode.type === 'TSNonNullExpression') {
    return isArrayIsArrayGuard(testNode.argument, variableName);
  }

  if (testNode.type === 'ParenthesizedExpression') {
    return isArrayIsArrayGuard(testNode.expression, variableName);
  }

  return false;
}

function hasArrayGuardInAncestors(ancestors, variableName) {
  if (!variableName) {
    return false;
  }

  for (let i = ancestors.length - 1; i >= 0; i -= 1) {
    const parent = ancestors[i];

    if (parent.type === 'IfStatement' && isArrayIsArrayGuard(parent.test, variableName)) {
      return true;
    }

    if (parent.type === 'ConditionalExpression' && isArrayIsArrayGuard(parent.test, variableName)) {
      return true;
    }

    if (parent.type === 'LogicalExpression' && parent.operator === '&&') {
      if (isArrayIsArrayGuard(parent.left, variableName)) {
        return true;
      }
    }
  }

  return false;
}

function isMethodCallOptionalSafe(node) {
  if (node.optional) {
    return true;
  }

  const callee = node.callee;
  if (!callee || callee.type !== 'MemberExpression') {
    return false;
  }

  // Covers patterns like list?.map?.(...)
  return Boolean(callee.optional);
}

function isTriviallyArrayExpression(expr) {
  return expr?.type === 'ArrayExpression';
}

function findUnsafeArrayMethodCalls(ast) {
  const safeVars = collectLocallySafeArrayVars(ast);
  const findings = [];

  walk(ast, {
    CallExpression(node, ancestors) {
      const callee = node.callee;
      if (!callee || callee.type !== 'MemberExpression') {
        return;
      }

      const methodName = getMemberPropertyName(callee);
      if (!ARRAY_METHODS.has(methodName)) {
        return;
      }

      const targetExpr = callee.object;
      const rootName = getRootIdentifierName(targetExpr);

      const isSafeByOptional = isMethodCallOptionalSafe(node);
      const isSafeByLiteral = isTriviallyArrayExpression(targetExpr);
      const isSafeByInit = rootName ? safeVars.has(rootName) : false;
      const isSafeByGuard = hasArrayGuardInAncestors(ancestors, rootName);

      if (isSafeByOptional || isSafeByLiteral || isSafeByInit || isSafeByGuard) {
        return;
      }

      findings.push({
        line: node.loc?.start?.line ?? 0,
        column: node.loc?.start?.column ?? 0,
        method: methodName,
        target: rootName || '<complex-expression>'
      });
    }
  });

  return findings;
}

async function audit() {
  const targetDirs = [];

  for (const dir of SOURCE_DIRS) {
    const abs = path.join(ROOT, dir);
    if (await exists(abs)) {
      targetDirs.push(abs);
    }
  }

  if (targetDirs.length === 0) {
    console.error('[audit:arrays] No source directories found.');
    process.exit(1);
  }

  const fileListNested = await Promise.all(targetDirs.map((dir) => collectFiles(dir)));
  const files = fileListNested.flat().sort();

  let checkedFiles = 0;
  let parseErrors = 0;
  const findingsByFile = [];

  for (const file of files) {
    checkedFiles += 1;
    const rel = path.relative(ROOT, file);

    try {
      const source = await fs.readFile(file, 'utf8');
      const ast = parseFile(source, rel);
      const findings = findUnsafeArrayMethodCalls(ast);

      if (findings.length > 0) {
        findingsByFile.push({ file: rel, findings });
      }
    } catch (err) {
      parseErrors += 1;
      const line = err?.loc?.line ?? '?';
      const col = err?.loc?.column ?? '?';
      console.error(`[audit:arrays] Parse error in ${rel} at ${line}:${col} -> ${err?.message ?? 'Unknown parser error'}`);
    }
  }

  const totalFindings = findingsByFile.reduce((acc, item) => acc + item.findings.length, 0);

  if (totalFindings === 0 && parseErrors === 0) {
    console.log(`[audit:arrays] OK. Checked ${checkedFiles} files, no risky array-method calls detected.`);
    process.exit(0);
  }

  console.log(`[audit:arrays] Checked ${checkedFiles} files. Potentially risky calls: ${totalFindings}. Parse errors: ${parseErrors}.`);

  for (const group of findingsByFile) {
    console.log(`\n${group.file}`);
    for (const finding of group.findings) {
      console.log(`  - ${finding.line}:${finding.column} ${finding.target}.${finding.method}(...)`);
    }
  }

  if (parseErrors > 0) {
    process.exit(1);
  }

  if (STRICT_MODE && totalFindings > 0) {
    process.exit(1);
  }

  // Soft mode by default: findings are reported but do not block local flow.
  process.exit(0);
}

audit().catch((err) => {
  console.error('[audit:arrays] Unexpected error:', err?.message ?? err);
  process.exit(1);
});
