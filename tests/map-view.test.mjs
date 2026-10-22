import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import ts from 'typescript';
const source = fs.readFileSync(new URL('../src/game/mapView.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
const { getPanBounds, constrainMap } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

test('bottom map edge can be dragged above an overlapping mobile panel', () => {
  const bounds = getPanBounds(390, 700, 1100, 805, 1, 180);
  const view = constrainMap({ x: 0, y: 0, zoom: 1 }, bounds, 0, -10000);
  assert.equal(350 + 805 / 2 + view.y, 700 - 180);
  assert.equal(constrainMap(view, bounds, 0, -20000), view);
});
test('desktop bounds remain symmetric and zooming out clamps both axes', () => {
  const bounds = getPanBounds(800, 600, 920, 690, 1);
  assert.deepEqual(bounds, { maxX: 60, maxY: 45, minY: -45 });
  assert.deepEqual(constrainMap({ x: 300, y: 200, zoom: 2 }, bounds, 300, 200, 1), { x: 60, y: 45, zoom: 1 });
});
test('stationary view does not trigger a new render and undersized maps stay centered', () => {
  const view = { x: 0, y: 0, zoom: 1 };
  assert.equal(constrainMap(view, getPanBounds(800, 600, 400, 300, 1)), view);
});
