#!/usr/bin/env node
/**
 * JSON5 性能基准（手动运行，不进 npm test）。
 * 用法：node scripts/bench-json5.mjs [--write | --snapshot]
 *   --write     将结果写入 test/resources/benchmark/bench-v{version}.json
 *   --snapshot  将结果写入 test/resources/benchmark/bench-v{version}-snapshot.json
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSON5 } from '../src/index.js';
import { DEFAULT_FORMAT_OPTIONS } from '../src/parser/json5/format.js';
import Json5Lexer from '../src/grammars/json5/Json5Lexer.js';
import Json5Parser from '../src/grammars/json5/Json5Parser.js';
import { runParsePipeline } from '../src/parser/core/parse-pipeline.js';
import { buildDocumentAst, transformDocumentAst } from '../src/parser/json5/format/ast-builder-transform.js';
import { emitDocument } from '../src/parser/json5/format/emit.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const fixturePath = join(root, 'test/resources/test.json5.text');
const fixture = readFileSync(fixturePath, 'utf8');

const WARMUP = 10;
const RUNS = 200;
const writeResults = process.argv.includes('--write');
const writeSnapshot = process.argv.includes('--snapshot');

/** @type {{ label: string, msPerOp: number, group?: string }[]} */
const records = [];

/** @param {string} label @param {() => unknown} fn @param {string} [group] */
function bench(label, fn, group) {
  for (let i = 0; i < WARMUP; i++) fn();
  const t0 = performance.now();
  for (let i = 0; i < RUNS; i++) fn();
  const ms = (performance.now() - t0) / RUNS;
  console.log(`${label.padEnd(36)} ${ms.toFixed(3)} ms/op`);
  records.push({ label, msPerOp: Number(ms.toFixed(3)), group });
  return ms;
}

/**
 * @param {import('../src/parser/json5/format.js').FormatOptions} [options]
 * @returns {import('../src/parser/json5/format.js').ResolvedFormatOptions}
 */
function resolveFormatOptions(options = {}) {
  const indent = options.indent ?? DEFAULT_FORMAT_OPTIONS.indent;
  return {
    indent:
      indent.type === 'tab' ? { type: 'tab' } : { type: 'space', size: indent.size ?? 2 },
    sortKeys: options.sortKeys ?? false,
    compact: options.compact ?? false,
  };
}

/**
 * @param {string} label
 * @param {string} input
 * @param {import('../src/parser/json5/format.js').FormatOptions} [options]
 */
function benchPhases(label, input, options = {}) {
  const resolved = resolveFormatOptions(options);
  let cached;
  const group = `phases:${label}`;
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
  }, group);
  bench(`  buildDocumentAst`, () => {
    buildDocumentAst(cached.tree, cached.tokenStream, input);
  }, group);
  const ast = buildDocumentAst(cached.tree, cached.tokenStream, input);
  bench(`  transform`, () => {
    transformDocumentAst(ast, resolved);
  }, group);
  const transformed = transformDocumentAst(ast, resolved);
  bench(`  emit`, () => {
    emitDocument(transformed, cached.tokenStream, resolved, input);
  }, group);
  bench(`  format e2e`, () => {
    JSON5.format(input, options);
  }, group);
}

console.log(`JSON5 bench v${version} (${RUNS} runs after ${WARMUP} warmup)\n`);

bench('validate (fixture)', () => JSON5.validate(fixture), 'fixture');
bench('parse (fixture)', () => JSON5.parse(fixture), 'fixture');
bench('format default (fixture)', () => JSON5.format(fixture), 'fixture');
bench('format compact (fixture)', () => JSON5.format(fixture, { compact: true }), 'fixture');
bench('format sort+compact (fixture)', () =>
  JSON5.format(fixture, { sortKeys: true, compact: true }), 'fixture');

console.log('');
for (const n of [50, 200, 500, 2000]) {
  const big = `{${Array.from({ length: n }, (_, i) => `k${i}: ${i}`).join(', ')}}`;
  const group = `scale:${n}`;
  bench(`format compact (${n} keys)`, () => JSON5.format(big, { compact: true }), group);
  bench(`format sort+compact (${n} keys)`, () =>
    JSON5.format(big, { sortKeys: true, compact: true }), group);
}

benchPhases('fixture default', fixture, {});
benchPhases('fixture sort+compact', fixture, { sortKeys: true, compact: true });

const big2000 = `{${Array.from({ length: 2000 }, (_, i) => `k${i}: ${i}`).join(', ')}}`;
benchPhases('2000 keys compact', big2000, { compact: true });
benchPhases('2000 keys sort+compact', big2000, { sortKeys: true, compact: true });

if (writeResults || writeSnapshot) {
  const outDir = join(root, 'test/resources/benchmark');
  mkdirSync(outDir, { recursive: true });
  const suffix = writeSnapshot ? '-snapshot' : '';
  const outPath = join(outDir, `bench-v${version}${suffix}.json`);
  const payload = {
    version,
    recordedAt: new Date().toISOString(),
    nodeVersion: process.version,
    warmup: WARMUP,
    runs: RUNS,
    fixture: 'test/resources/test.json5.text',
    results: records,
  };
  writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`\nWrote ${outPath}`);
}
