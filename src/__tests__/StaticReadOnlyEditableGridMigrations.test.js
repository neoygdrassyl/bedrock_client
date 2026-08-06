import fs from 'node:fs';
import path from 'node:path';

import { parse } from '@babel/parser';
import { describe, expect, test } from 'vitest';

const SOURCE_ROOT = path.resolve(import.meta.dirname, '..');

const migrations = [
  {
    key: 'record-arc-32-series',
    file: 'app/pages/user/records/arc/record_arc_32.js',
    functionName: '_COMPONENT_SERIES',
    rowsName: 'rows',
    expectedCellCount: 6,
    removesDirectRows: true,
    invariants: [
      'Serie Documental:',
      'Subserie Documental:',
      "_SUBSERIE.length == 1 ? _SUBSERIE[0] : ''",
      "_SERIE_STR[0] ?? 'No se encuentra Serie'",
      "_SUBSERIE_STR[0] ?? 'No se encuentra Subserie'",
      "<label className='text-danger'>No se encuentra Serie</label>",
      "<label className='text-danger'>No se encuentra Subserie</label>",
    ],
  },
  {
    key: 'record-arc-34-height-limits',
    file: 'app/pages/user/records/arc/record_arc_34.js',
    functionName: '_COMPONENT_INDEX_CALC',
    rowsName: 'rows',
    expectedCellCount: 27,
    removesDirectRows: true,
    invariants: [
      'Altura Máxima / Mínima de Pisos',
      'Vivienda · Mínimo · Norma',
      'Otros · Máximo · Proyecto',
      'Pisos',
      'Semisótano',
      'Sótanos',
      'pvmi = pvmi == Infinity ? 0 : pvmi;',
      'pomi = pomi == Infinity ? 0 : pomi;',
      'sevm = sevm == Infinity ? 0 : sevm;',
      'seom = seom == Infinity ? 0 : seom;',
      'sovm = sovm == Infinity ? 0 : sovm;',
      'soom = soom == Infinity ? 0 : soom;',
      "pvmi < 2.4 ? 'text-danger' : ''",
      "pvma > 3.6 ? 'text-danger' : ''",
      "pomi < 2.4 ? 'text-danger' : ''",
      "poma > 4.5 ? 'text-danger' : ''",
    ],
  },
  {
    key: 'record-arc-34-floor-summary',
    file: 'app/pages/user/records/arc/record_arc_34.js',
    functionName: '_COMPONENT_INDEX_CALC_2',
    rowsName: 'rows',
    expectedCellCount: 10,
    removesDirectRows: true,
    invariants: [
      '_GET_MFHF()',
      'Número de Pisos',
      'Número de Pisos Maximo',
      'En Cuadro de áreas:',
      'Segun altura util:',
      "maxfloor != heighFloor ? 'text-danger' : ''",
      'Math.trunc(height / 2.4)',
      'Math.trunc(height / 3.6)',
      'Math.trunc(height / 4.6)',
    ],
  },
  {
    key: 'record-arc-35-parking-totals',
    file: 'app/pages/user/records/arc/record_arc_35.js',
    functionName: '_COMPONENT_2_TOTALS',
    rowsName: 'rows',
    expectedCellCount: 16,
    removesDirectRows: true,
    invariants: [
      '_GET_LOCATION_PERCENTAGES()',
      '_value / (_TOTALS[0] + _TOTALS[1] + _TOTALS[2]) * 100',
      'D -m- (2.20*4.50)',
      'D -m- (2.50*5.00)',
      'D -m- (3.30*5.00)',
      'D -m- (Totales)',
      'Carga (3.50*7.00)',
      'Motos (2.00*7.00)',
      'Bicicletas (0.50*2.50)',
      '(_TOTALS[0] + _TOTALS[1] + _TOTALS[2])',
      'get_percentage(_TOTALS[0] + _TOTALS[1] + _TOTALS[2]).toFixed(2)',
      'Totales',
      'Porcentajes',
    ],
  },
  {
    key: 'record-arc-36-duty-liquidation',
    file: 'app/pages/user/records/arc/record_arc_36.js',
    functionName: '_COMPONENT_DUTIES',
    rowsName: 'liquidationRows',
    expectedCellCount: 32,
    invariants: [
      "const dutyClock = _GET_CLOCK_STATE(65).resolver_context || 'NO';",
      'let m2comp = strata > 2 && strata < 5 ? 4 : 6;',
      "currentItem.expedition ? (currentItem.expedition.cub2 ?? '') : ''",
      "recipeId ? recipeId.id_payment_3 || '' : ''",
      'Math.round(Number(m2comp * value35[2] * json34.zugm) + Number(0.06 * value35[0] * json34.zugm))',
      'Math.round(m2comp * value35[2] * json34.zugm) > 0',
      '(0.06 * value35[0] * json34.zugm).toFixed(0) > 0',
      '(Number(0.06 * value35[0]) + Number(m2comp * value35[2])).toFixed(2)',
      'Diferente a vivienda',
      'Comercio',
      'TOTAL: ',
      '_CONDTIIONS.map',
      'id="s36_useduty_check"',
    ],
    minimumOccurrences: [['_CHECK[0] == 1', 2]],
  },
  {
    key: 'fun-report-data-spm',
    file: 'app/pages/user/fun_forms/components/fun_report_data.js',
    functionName: '_COMPONENT',
    rowsName: 'rows',
    expectedCellCount: 14,
    removesDirectRows: true,
    invariants: [
      'CUB1 notifico reconocimiento a la –SPM-',
      'Identificación del oficio',
      'Fecha de Radicación ante la SPM',
      'Respuesta SPM radicación',
      'Fecha Limite (Fecha radicacion mas 10 dias hábiles)',
      'Oficio de Planeacion',
      'Reporte de Planeacion',
      "_CHILD[0] == 0 ? 'SIN NOTIFICAR' : _CHILD[0] == 1 ? 'NOTIFICADO' : ''",
      'content: _GET_NOTIFY(_CHILD[0])',
      'dateParser(_CHILD[2])',
      'dateParser_finalDate(_CHILD[2], 10)',
      "value: _CHILD[6] > 0 ? 'Reporte de Planeacion' : 'SIN DOCUMENTO'",
      'content: _CHILD[6] > 0',
      '<VIZUALIZER',
      '_FIND_6(_CHILD[6]).path + "/" + _FIND_6(_CHILD[6]).filename',
      "apipath={'/files/'}",
      '<label className="fw-bold">SIN DOCUMENTO</label>',
    ],
  },
];

function walk(node, visit) {
  if (!node || typeof node !== 'object') return;
  if (node.type) visit(node);
  for (const [key, value] of Object.entries(node)) {
    if (['loc', 'start', 'end'].includes(key)) continue;
    if (Array.isArray(value)) value.forEach(child => walk(child, visit));
    else if (value?.type) walk(value, visit);
  }
}

function parseSource(source) {
  return parse(source, { sourceType: 'module', plugins: ['jsx'] });
}

function readSource(file) {
  return fs.readFileSync(path.join(SOURCE_ROOT, file), 'utf8');
}

function findFunctionDeclarator(ast, functionName) {
  const matches = [];
  walk(ast, (node) => {
    if (node.type === 'VariableDeclarator'
      && node.id?.type === 'Identifier'
      && node.id.name === functionName
      && node.init?.type === 'ArrowFunctionExpression') {
      matches.push(node);
    }
  });
  expect(matches, `${functionName}: expected exactly one function`).toHaveLength(1);
  return matches[0];
}

function getJsxElementName(node) {
  return node.openingElement?.name?.type === 'JSXIdentifier'
    ? node.openingElement.name.name
    : null;
}

function findEditableGrids(node) {
  const grids = [];
  walk(node, (candidate) => {
    if (candidate.type === 'JSXElement' && getJsxElementName(candidate) === 'EditableDataGrid') grids.push(candidate);
  });
  return grids;
}

function findJsxAttribute(grid, name) {
  return grid.openingElement.attributes.find(attribute => (
    attribute.type === 'JSXAttribute' && attribute.name.name === name
  ));
}

function expectDeterministicGetRowId(grid, key) {
  const expression = findJsxAttribute(grid, 'getRowId')?.value?.expression;
  expect(expression?.type, `${key}: getRowId must be an arrow function`).toBe('ArrowFunctionExpression');
  expect(expression.params, `${key}: getRowId must depend only on row`).toHaveLength(1);
  expect(expression.params[0]).toMatchObject({ type: 'Identifier', name: 'row' });
  expect(expression.body).toMatchObject({
    type: 'MemberExpression',
    computed: false,
    object: {
      type: 'MemberExpression',
      computed: true,
      object: { type: 'Identifier', name: 'row' },
      property: { type: 'NumericLiteral', value: 0 },
    },
    property: { type: 'Identifier', name: 'id' },
  });
}

function getReadOnlyValue(cell) {
  const property = cell.properties.find(candidate => (
    candidate.type === 'ObjectProperty'
    && ((candidate.key.type === 'Identifier' && candidate.key.name === 'readOnly')
      || (candidate.key.type === 'StringLiteral' && candidate.key.value === 'readOnly'))
  ));
  return property?.value;
}

function collectConstructedCells(functionNode, rowsName, key) {
  const rowArrays = [];
  const registerRowsCollection = (array) => {
    for (const row of array.elements) {
      expect(row?.type, `${key}: rows must contain row arrays`).toBe('ArrayExpression');
      rowArrays.push(row);
    }
  };
  const registerSingleRow = (row) => {
    expect(row?.type, `${key}: pushed rows must be arrays`).toBe('ArrayExpression');
    rowArrays.push(row);
  };

  walk(functionNode, (node) => {
    if (node.type === 'VariableDeclarator' && node.id?.name === rowsName && node.init?.type === 'ArrayExpression') {
      registerRowsCollection(node.init);
    }
    if (node.type === 'AssignmentExpression'
      && node.left?.type === 'Identifier'
      && node.left.name === rowsName
      && node.right?.type === 'ArrayExpression') {
      registerRowsCollection(node.right);
    }
    if (node.type === 'CallExpression'
      && node.callee?.type === 'MemberExpression'
      && node.callee.object?.type === 'Identifier'
      && node.callee.object.name === rowsName
      && node.callee.property?.name === 'push') {
      node.arguments.forEach(registerSingleRow);
    }
  });

  return rowArrays.flatMap((row) => row.elements.map((cell) => {
    expect(cell?.type, `${key}: every row entry must be a cell object`).toBe('ObjectExpression');
    return cell;
  }));
}

function validateMigration(migration, source = readSource(migration.file)) {
  const ast = parseSource(source);
  const declarator = findFunctionDeclarator(ast, migration.functionName);
  const functionSource = source.slice(declarator.start, declarator.end);
  const grids = findEditableGrids(declarator);

  expect(grids, `${migration.key}: expected one grid in the approved block`).toHaveLength(1);
  expect(findJsxAttribute(grids[0], 'spreadsheetInteractions')?.value?.expression).toMatchObject({
    type: 'BooleanLiteral',
    value: false,
  });
  expectDeterministicGetRowId(grids[0], migration.key);

  const cells = collectConstructedCells(declarator, migration.rowsName, migration.key);
  expect(cells, `${migration.key}: constructed cell count changed`).toHaveLength(migration.expectedCellCount);
  cells.forEach((cell, index) => {
    expect(getReadOnlyValue(cell), `${migration.key}: cell ${index + 1} must be explicitly read-only`).toMatchObject({
      type: 'BooleanLiteral',
      value: true,
    });
  });

  migration.invariants.forEach((invariant) => {
    expect(functionSource, `${migration.key}: missing invariant ${invariant}`).toContain(invariant);
  });
  migration.minimumOccurrences?.forEach(([invariant, minimum]) => {
    expect(functionSource.split(invariant)).toHaveLength(minimum + 1);
  });
  if (migration.removesDirectRows) expect(functionSource).not.toMatch(/<div className=["']row/);
}

function validateExactFileScope(file, source = readSource(file)) {
  const fileMigrations = migrations.filter(migration => migration.file === file);
  const ast = parseSource(source);
  const approvedRanges = fileMigrations.map(({ functionName }) => {
    const declarator = findFunctionDeclarator(ast, functionName);
    return [declarator.start, declarator.end];
  });
  const allGrids = findEditableGrids(ast);

  expect(allGrids, `${file}: unexpected EditableDataGrid migration outside approved blocks`).toHaveLength(fileMigrations.length);
  allGrids.forEach((grid) => {
    expect(approvedRanges.some(([start, end]) => grid.start >= start && grid.end <= end),
      `${file}: grid at ${grid.start} is outside the six approved blocks`).toBe(true);
  });
}

describe('approved read-only EditableDataGrid migrations', () => {
  test('is scoped to exactly the six approved blocks', () => {
    expect(migrations.map(migration => migration.key)).toEqual([
      'record-arc-32-series',
      'record-arc-34-height-limits',
      'record-arc-34-floor-summary',
      'record-arc-35-parking-totals',
      'record-arc-36-duty-liquidation',
      'fun-report-data-spm',
    ]);
    new Set(migrations.map(migration => migration.file)).forEach(file => validateExactFileScope(file));
  });

  test.each(migrations)('$key keeps every constructed cell read-only and its row ID deterministic', (migration) => {
    validateMigration(migration);
  });

  test('rejects a writable cell, an index row ID, and an out-of-scope grid', () => {
    const seriesMigration = migrations[0];
    const seriesSource = readSource(seriesMigration.file);
    const writableCell = seriesSource.replace('readOnly: true', 'readOnly: false');
    const indexRowId = seriesSource.replace(
      'getRowId={(row) => row[0].id}',
      'getRowId={(_row, index) => index}',
    );
    const extraGrid = seriesSource.replace(
      'function RECORD_ARC_32',
      'const AccidentalGrid = () => <EditableDataGrid />;\n\nfunction RECORD_ARC_32',
    );

    expect(() => validateMigration(seriesMigration, writableCell)).toThrow(/explicitly read-only/);
    expect(() => validateMigration(seriesMigration, indexRowId)).toThrow(/depend only on row/);
    expect(() => validateExactFileScope(seriesMigration.file, extraGrid)).toThrow(/unexpected EditableDataGrid migration/);
  });
});
