#!/usr/bin/env node
/**
 * JSON5.parse sortKeys 性能对比（手动运行）。
 * 用法：node scripts/bench-parse-sortkeys.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runParsePipeline, visitArrayChildren } from '../src/parser/core/parse-pipeline.js';
import Json5Lexer from '../src/grammars/json5/Json5Lexer.js';
import Json5Parser from '../src/grammars/json5/Json5Parser.js';
import {
  decodeJson5String,
  decodeTripleBody,
  keyToString,
  parseJson5Number,
  tripleStringBodyText,
} from '../src/parser/json5/decode.js';
import { parse as parseNew } from '../src/parser/json5/parse.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const fixture = readFileSync(join(root, 'test/resources/test.json5.text'), 'utf8');

const WARMUP = 15;
const RUNS = 300;

/** @param {string} label @param {() => unknown} fn @param {number} [runs] */
function bench(label, fn, runs = RUNS) {
  for (let i = 0; i < WARMUP; i++) fn();
  const t0 = performance.now();
  for (let i = 0; i < runs; i++) fn();
  const ms = (performance.now() - t0) / runs;
  console.log(`${label.padEnd(44)} ${ms.toFixed(3)} ms/op`);
  return ms;
}

// --- 修改前（HEAD）parse 逻辑内联复刻 ---
function visitValueOld(ctx) {
  if (ctx.object()) return visitObjectOld(ctx.object());
  if (ctx.array()) return visitArrayOld(ctx.array());
  if (ctx.STRING()) return decodeJson5String(ctx.STRING().getText());
  if (ctx.tripleSingleString()) {
    return decodeTripleBody(tripleStringBodyText(ctx.tripleSingleString()));
  }
  if (ctx.tripleDoubleString()) {
    return decodeTripleBody(tripleStringBodyText(ctx.tripleDoubleString()));
  }
  if (ctx.NUMBER()) return parseJson5Number(ctx.NUMBER().getText());
  if (ctx.TRUE()) return true;
  if (ctx.FALSE()) return false;
  if (ctx.NULL()) return null;
  if (ctx.literal()) return visitLiteralOld(ctx.literal());
  throw new Error(`Unexpected value: ${ctx.getText()}`);
}

function visitLiteralOld(ctx) {
  if (ctx.INFINITY()) return Infinity;
  if (ctx.NAN()) return NaN;
  if (ctx.signedLiteral()) {
    const s = ctx.signedLiteral();
    const sign = s.PLUS() ? 1 : -1;
    if (s.INFINITY()) return sign * Infinity;
    if (s.NAN()) return sign * NaN;
  }
  throw new Error(`Unexpected literal: ${ctx.getText()}`);
}

function visitObjectOld(ctx) {
  const result = {};
  const members = ctx.member ? ctx.member() : [];
  for (const member of members) {
    const key = keyToString(member.key());
    result[key] = visitValueOld(member.value());
  }
  return result;
}

function visitArrayOld(ctx) {
  const values = ctx.value ? ctx.value() : [];
  return visitArrayChildren(values, visitValueOld);
}

/** @param {string} input */
function parseOld(input) {
  const { tree } = runParsePipeline({
    language: 'json5',
    input,
    Lexer: Json5Lexer,
    Parser: Json5Parser,
    entryRule: 'json5',
  });
  return visitValueOld(tree.value());
}

/** @param {number} n @param {boolean} nested */
function makeBigJson5(n, nested = false) {
  if (!nested) {
    return `{${Array.from({ length: n }, (_, i) => `k${String(n - 1 - i).padStart(4, '0')}: ${i}`).join(', ')}}`;
  }
  const inner = Array.from({ length: n }, (_, i) => `z${String(n - 1 - i).padStart(4, '0')}: { a: 1, b: 2 }`).join(', ');
  return `{${inner}}`;
}

console.log(`JSON5.parse sortKeys bench (${RUNS} runs after ${WARMUP} warmup)\n`);

console.log('--- fixture (test.json5.text) ---');
const oldFixture = bench('parse OLD (before change)', () => parseOld(fixture));
const newFalseFixture = bench('parse NEW sortKeys:false', () => parseNew(fixture));
const newTrueFixture = bench('parse NEW sortKeys:true', () => parseNew(fixture, { sortKeys: true }));

console.log('\n--- flat object (key count) ---');
/** @type {{ n: number, old: number, false: number, true: number }[]} */
const flatRows = [];
for (const n of [50, 200, 500, 2000]) {
  const input = makeBigJson5(n);
  console.log(`\n${n} keys:`);
  const oldMs = bench('  OLD', () => parseOld(input));
  const falseMs = bench('  NEW sortKeys:false', () => parseNew(input));
  const trueMs = bench('  NEW sortKeys:true', () => parseNew(input, { sortKeys: true }));
  flatRows.push({ n, old: oldMs, false: falseMs, true: trueMs });
}

console.log('\n--- nested objects (each leaf has 2 keys) ---');
/** @type {{ n: number, old: number, false: number, true: number }[]} */
const nestedRows = [];
for (const n of [50, 200, 500]) {
  const input = makeBigJson5(n, true);
  console.log(`\n${n} nested objects:`);
  const oldMs = bench('  OLD', () => parseOld(input));
  const falseMs = bench('  NEW sortKeys:false', () => parseNew(input));
  const trueMs = bench('  NEW sortKeys:true', () => parseNew(input, { sortKeys: true }));
  nestedRows.push({ n, old: oldMs, false: falseMs, true: trueMs });
}

function pct(base, val) {
  return `${(((val - base) / base) * 100).toFixed(1)}%`;
}

console.log('\n=== 汇总（相对 OLD） ===\n');
console.log('fixture:');
console.log(`  NEW false vs OLD: ${pct(oldFixture, newFalseFixture)}`);
console.log(`  NEW true  vs OLD: ${pct(oldFixture, newTrueFixture)}`);
console.log(`  NEW true  vs NEW false: ${pct(newFalseFixture, newTrueFixture)}`);

console.log('\nflat object:');
console.log('  n     | false vs OLD | true vs OLD | true vs false');
for (const r of flatRows) {
  console.log(
    `  ${String(r.n).padStart(5)} | ${pct(r.old, r.false).padStart(12)} | ${pct(r.old, r.true).padStart(11)} | ${pct(r.false, r.true).padStart(13)}`,
  );
}

console.log('\nnested object:');
console.log('  n     | false vs OLD | true vs OLD | true vs false');
for (const r of nestedRows) {
  console.log(
    `  ${String(r.n).padStart(5)} | ${pct(r.old, r.false).padStart(12)} | ${pct(r.old, r.true).padStart(11)} | ${pct(r.false, r.true).padStart(13)}`,
  );
}
