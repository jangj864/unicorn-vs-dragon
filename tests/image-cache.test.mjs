import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../src/game/imageCache.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
const { loadImage, watchImages } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
class TestImage extends EventTarget { complete = false; src = ''; decoding = ''; }
globalThis.Image = TestImage;

test('two canvases share an image without replacing each other’s load listener', () => {
  const first = loadImage('shared.webp');
  assert.equal(first, loadImage('shared.webp'));
  let a = 0, b = 0;
  const stopA = watchImages([first], () => a++);
  const stopB = watchImages([first], () => b++);
  first.dispatchEvent(new Event('load'));
  assert.equal(a, 1); assert.equal(b, 1);
  stopA(); first.dispatchEvent(new Event('load'));
  assert.equal(a, 1); assert.equal(b, 2);
  stopB();
});
test('failed images can be retried and cache size is bounded', () => {
  const failed = loadImage('retry.webp'); failed.dispatchEvent(new Event('error'));
  assert.notEqual(loadImage('retry.webp'), failed);
  const old = loadImage('old.webp');
  for (let i = 0; i < 25; i++) loadImage(`asset-${i}.webp`);
  assert.notEqual(loadImage('old.webp'), old);
});
