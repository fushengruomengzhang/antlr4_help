#!/usr/bin/env node
/**
 * JSON5 性能基准（手动运行，不进 npm test）。
 * 用法：node scripts/bench-json5.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSON5 } from '../src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const fixturePath = join(root, 'test/resources/test.json5.text');
const fixture = readFileSync(fixturePath, 'utf8');

const WARMUP = 10;
const RUNS = 200;

/** @param {string} label @param {() => unknown} fn */
function bench(label, fn) {
  for (let i = 0; i < WARMUP; i++) fn();
  const t0 = performance.now();
  for (let i = 0; i < RUNS; i++) fn();
  const ms = (performance.now() - t0) / RUNS;
  console.log(`${label.padEnd(32)} ${ms.toFixed(3)} ms/op`);
  return ms;
}

console.log(`JSON5 bench (${RUNS} runs after ${WARMUP} warmup)\n`);

bench('validate (fixture)', () => JSON5.validate(fixture));
bench('parse (fixture)', () => JSON5.parse(fixture));
bench('format default (fixture)', () => JSON5.format(fixture));
bench('format compact (fixture)', () => JSON5.format(fixture, { compact: true }));
bench('format sort+compact (fixture)', () =>
  JSON5.format(fixture, { sortKeys: true, compact: true }),
);

console.log('');
for (const n of [50, 200, 500, 2000]) {
  const big = `{${Array.from({ length: n }, (_, i) => `k${i}: ${i}`).join(', ')}}`;
  bench(`format compact (${n} keys)`, () => JSON5.format(big, { compact: true }));
  bench(`format sort+compact (${n} keys)`, () =>
    JSON5.format(big, { sortKeys: true, compact: true }),
  );
}
