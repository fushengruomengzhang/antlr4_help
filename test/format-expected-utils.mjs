import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const resourcesDir = join(__dirname, 'resources');
export const expectedDir = join(resourcesDir, 'expected');

/** @param {string} text */
export function normalizeFormatText(text) {
  return text.replace(/\n{2,}/g, '\n').replace(/\n?$/, '\n');
}

/** @param {string} name */
export function readFixture(name) {
  return readFileSync(join(resourcesDir, name), 'utf8');
}

/** @param {string} relPath */
export function readExpected(relPath) {
  return readFileSync(join(expectedDir, relPath), 'utf8');
}

/**
 * @param {string} actual
 * @param {string} expectedRelPath
 * @param {string} label
 */
export function assertExpectedMatch(actual, expectedRelPath, label) {
  const normActual = normalizeFormatText(actual);
  const normExpected = normalizeFormatText(readExpected(expectedRelPath));
  if (normActual === normExpected) return;

  const actualLines = normActual.split('\n');
  const expectedLines = normExpected.split('\n');
  const max = Math.max(actualLines.length, expectedLines.length);
  for (let i = 0; i < max; i++) {
    if (actualLines[i] !== expectedLines[i]) {
      throw new Error(
        `expected mismatch (${label}) at line ${i + 1}:\n` +
          `  expected: ${JSON.stringify(expectedLines[i] ?? '')}\n` +
          `  actual:   ${JSON.stringify(actualLines[i] ?? '')}`,
      );
    }
  }
  throw new Error(`expected mismatch (${label})`);
}

/** @type {const} */
export const FIXTURE_VARIANTS = [
  { name: 'fixture.default.text', options: {} },
  { name: 'fixture.compact.text', options: { compact: true } },
  { name: 'fixture.sort-compact.text', options: { sortKeys: true, compact: true } },
];
