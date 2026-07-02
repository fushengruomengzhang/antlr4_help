#!/usr/bin/env node
/**
 * JSON5 性能基准（手动运行，不进 npm test）。
 * 用法：node scripts/bench-json5.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSON5 } from '../src/index.js';
import Json5Lexer from '../src/grammars/json5/Json5Lexer.js';
import Json5Parser from '../src/grammars/json5/Json5Parser.js';
import { runParsePipeline } from '../src/parser/core/parse-pipeline.js';
import { buildDocumentAst } from '../src/parser/json5/format/ast-builder.js';
import { transformDocumentAst } from '../src/parser/json5/format/ast-transform.js';
import { emitDocument } from '../src/parser/json5/format/emit.js';

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
  console.log(`${label.padEnd(36)} ${ms.toFixed(3)} ms/op`);
  return ms;
}

/**
 * @param {string} label
 * @param {string} input
 * @param {import('../src/parser/json5/format/format-options.js').FormatOptions} [options]
 */
function benchPhases(label, input, options = {}) {
  let cached;
  console.log(`\n${label} (segmented, ${RUNS} runs):`);
  bench(`  parse+fill`, () => {
    cached = runParsePipeline({
      language: 'json5',
      input,
      Lexer: Json5Lexer,
      Parser: Json5Parser,
      entryRule: 'json5',
      fillTokens: true,
    });
  });
  bench(`  buildDocumentAst`, () => {
    buildDocumentAst(cached.tree, cached.tokenStream);
  });
  const ast = buildDocumentAst(cached.tree, cached.tokenStream);
  bench(`  transform`, () => {
    transformDocumentAst(ast, options);
  });
  const transformed = transformDocumentAst(ast, options);
  bench(`  emit`, () => {
    emitDocument(transformed, options);
  });
  bench(`  format e2e`, () => {
    JSON5.format(input, options);
  });
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

benchPhases('fixture default', fixture, {});
benchPhases('fixture sort+compact', fixture, { sortKeys: true, compact: true });

const big2000 = `{${Array.from({ length: 2000 }, (_, i) => `k${i}: ${i}`).join(', ')}}`;
benchPhases('2000 keys compact', big2000, { compact: true });
benchPhases('2000 keys sort+compact', big2000, { sortKeys: true, compact: true });
