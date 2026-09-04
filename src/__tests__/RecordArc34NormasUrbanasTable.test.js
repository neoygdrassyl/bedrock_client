import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from 'vitest';

const source = fs.readFileSync(
  path.resolve(import.meta.dirname, '../app/pages/user/records/arc/record_arc_34.js'),
  'utf8',
);
const typography = fs.readFileSync(
  path.resolve(import.meta.dirname, '../app/pages/user/records/arc/record_arc_typography.css'),
  'utf8',
);

test('wraps the Normas Urbanas table in the shared expandable section', () => {
  expect(source).toContain("import ExpandableTableSection from './components/ExpandableTableSection';");
  expect(source).toContain('id="record-arc-34-urban-rules-table"');
  expect(source).toContain('title="Normas Urbanas"');
  expect(source).toContain('itemCount={_GET_CHILD_34_GEN().length}');
  expect(source).toContain('{_COMPONENT_1_LIST()}');
});

test('separa los grids de altura para que la barra horizontal no cubra el resumen', () => {
  expect(source).toContain('className="record-arc-height-grid-stack"');
  expect(typography).toContain('.record-arc-height-grid-stack');
  expect(typography).toContain('gap: 1rem;');
  expect(typography).toContain('scrollbar-gutter: stable;');
});
