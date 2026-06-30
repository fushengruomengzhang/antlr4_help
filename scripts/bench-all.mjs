#!/usr/bin/env node
/**
 * 跨语言性能基准（手动运行，不进 npm test）。
 * 用法：node scripts/bench-all.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSON5, JSON4, JAVA8, API } from '../src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const json5Fixture = readFileSync(join(root, 'test/resources/test.json5.text'), 'utf8');
const jsonFixture = readFileSync(join(root, 'test/resources/test.json.text'), 'utf8');
const javaFixture = readFileSync(join(root, 'test/resources/test.java.text'), 'utf8');

const WARMUP = 10;
const RUNS = 200;

/** @param {string} label @param {() => unknown} fn @param {number} [runs] */
function bench(label, fn, runs = RUNS) {
  for (let i = 0; i < WARMUP; i++) fn();
  const t0 = performance.now();
  for (let i = 0; i < runs; i++) fn();
  const ms = (performance.now() - t0) / runs;
  console.log(`${label.padEnd(40)} ${ms.toFixed(3)} ms/op`);
  return ms;
}

console.log(`Cross-language bench (${RUNS} runs after ${WARMUP} warmup)\n`);

console.log('--- JSON4 ---');
bench('JSON4.parse (fixture)', () => JSON4.parse(jsonFixture));

console.log('\n--- JSON5 ---');
bench('JSON5.validate (fixture)', () => JSON5.validate(json5Fixture));
bench('JSON5.parse (fixture)', () => JSON5.parse(json5Fixture));
bench('JSON5.format default (fixture)', () => JSON5.format(json5Fixture));
bench('JSON5.format compact (fixture)', () => JSON5.format(json5Fixture, { compact: true }));
bench('JSON5.format sort+compact (fixture)', () =>
  JSON5.format(json5Fixture, { sortKeys: true, compact: true }),
);

console.log('\n--- Java8 / API ---');
bench('JAVA8.peekFirstClassName', () => JAVA8.peekFirstClassName(javaFixture));
bench('JAVA8.signatures', () => JAVA8.signatures(javaFixture));
bench('API.java8ToApiSchema', () => API.java8ToApiSchema(javaFixture));

console.log('\n--- Synthetic scale ---');
for (const n of [50, 200, 500, 2000]) {
  const bigJson = JSON.stringify(Object.fromEntries(Array.from({ length: n }, (_, i) => [`k${i}`, i])));
  const bigJson5 = `{${Array.from({ length: n }, (_, i) => `k${i}: ${i}`).join(', ')}}`;
  bench(`JSON4.parse (${n} keys)`, () => JSON4.parse(bigJson));
  bench(`JSON5.parse (${n} keys)`, () => JSON5.parse(bigJson5));
  bench(`JSON5.validate (${n} keys)`, () => JSON5.validate(bigJson5));
  bench(`JSON5.sort+compact (${n} keys)`, () =>
    JSON5.format(bigJson5, { sortKeys: true, compact: true }),
  );
}
