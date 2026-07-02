import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { JSON5 } from '../src/index.js';
import {
  expectedDir,
  FIXTURE_VARIANTS,
  normalizeFormatText,
  readFixture,
} from './format-expected-utils.mjs';

/** @param {string} relPath @param {string} text */
function writeExpected(relPath, text) {
  const fullPath = join(expectedDir, relPath);
  mkdirSync(join(fullPath, '..'), { recursive: true });
  writeFileSync(fullPath, normalizeFormatText(text));
}

const json5Input = readFixture('test.json5.text');

for (const variant of FIXTURE_VARIANTS) {
  writeExpected(
    join('json5', variant.name),
    JSON5.format(json5Input, variant.options),
  );
}

console.log('Updated expected baselines under test/resources/expected/json5/');
