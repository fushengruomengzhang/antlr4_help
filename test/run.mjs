import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { json, json5, java8, ParseError } from '../src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const resourcesDir = join(__dirname, 'resources');
const outDir = join(resourcesDir, 'out');

mkdirSync(outDir, { recursive: true });

function readFixture(name) {
  return readFileSync(join(resourcesDir, name), 'utf8');
}

function writeJson(name, value) {
  writeFileSync(join(outDir, name), JSON.stringify(value, null, 2) + '\n');
}

function writeText(name, text) {
  writeFileSync(join(outDir, name), text.endsWith('\n') ? text : text + '\n');
}

function writeError(name, error) {
  const payload =
    error instanceof ParseError
      ? { language: error.language, line: error.line, column: error.column, message: error.message }
      : { message: error.message };
  writeJson(name, payload);
}

function runCase(label, outputName, fn, { errorName } = {}) {
  try {
    const result = fn();
    if (outputName.endsWith('.json')) {
      writeJson(outputName, result);
    } else {
      writeText(outputName, result === null ? '(null)' : String(result));
    }
    console.log(`✓ ${label}`);
  } catch (error) {
    console.error(`✗ ${label}: ${error.message}`);
    if (errorName) writeError(errorName, error);
  }
}

const json5Input = readFixture('test.json5.text');
const jsonInput = readFixture('test.json.text');
const javaInput = readFixture('test.java.text');

runCase('json5 validate', 'test.json5.validate.txt', () => {
  json5.validate(json5Input);
  return 'OK';
});

runCase('json5 parse', 'test.json5.parse.json', () => json5.parse(json5Input), {
  errorName: 'test.json5.parse.error.json',
});

runCase('json5 format', 'test.json5.format.text', () => json5.format(json5Input), {
  errorName: 'test.json5.format.error.json',
});

runCase('json5 format (sortKeys)', 'test.json5.format.sorted.text', () => json5.format(json5Input, { sortKeys: true }), {
  errorName: 'test.json5.format.sorted.error.json',
});

runCase('json parse', 'test.json.parse.json', () => json.parse(jsonInput), {
  errorName: 'test.json.parse.error.json',
});

runCase('java8 firstClassName', 'test.java.firstClassName.txt', () => java8.firstClassName(javaInput), {
  errorName: 'test.java.firstClassName.error.json',
});

runCase('java8 signatures', 'test.java.signatures.json', () => java8.signatures(javaInput), {
  errorName: 'test.java.signatures.error.json',
});

console.log('\n输出目录:', outDir);
