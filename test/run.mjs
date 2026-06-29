import { mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { json, json5, java8, api, ParseError } from '../src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const resourcesDir = join(__dirname, 'resources');
const goldenDir = join(resourcesDir, 'golden');
const outDir = join(resourcesDir, 'out');

let failed = 0;

mkdirSync(outDir, { recursive: true });
for (const entry of readdirSync(outDir)) {
  unlinkSync(join(outDir, entry));
}

function readFixture(name) {
  return readFileSync(join(resourcesDir, name), 'utf8');
}

function readCase(name) {
  return readFileSync(join(resourcesDir, 'cases', name), 'utf8');
}

function readGolden(name) {
  return readFileSync(join(goldenDir, name), 'utf8');
}

function writeJson(name, value) {
  writeFileSync(join(outDir, name), JSON.stringify(value, null, 2) + '\n');
}

function writeText(name, text) {
  writeFileSync(join(outDir, name), text.endsWith('\n') ? text : text + '\n');
}

/** @param {string} text */
function normalizeFormatText(text) {
  return text.replace(/\n{2,}/g, '\n').replace(/\n?$/, '\n');
}

/**
 * @param {string} actual
 * @param {string} expected
 * @param {string} goldenName
 */
function assertGoldenMatch(actual, expected, goldenName) {
  const normActual = normalizeFormatText(actual);
  const normExpected = normalizeFormatText(expected);
  if (normActual === normExpected) return;

  const actualLines = normActual.split('\n');
  const expectedLines = normExpected.split('\n');
  const max = Math.max(actualLines.length, expectedLines.length);
  for (let i = 0; i < max; i++) {
    if (actualLines[i] !== expectedLines[i]) {
      throw new Error(
        `golden mismatch (${goldenName}) at line ${i + 1}:\n` +
          `  expected: ${JSON.stringify(expectedLines[i] ?? '')}\n` +
          `  actual:   ${JSON.stringify(actualLines[i] ?? '')}`,
      );
    }
  }
  throw new Error(`golden mismatch (${goldenName})`);
}

/** @param {unknown[]} nodes */
function stripApiIds(nodes) {
  return nodes.map((node) => {
    const { id, parentId, children, ...rest } = /** @type {Record<string, unknown> & { children?: unknown[] }} */ (node);
    return {
      ...rest,
      ...(children ? { children: stripApiIds(children) } : {}),
    };
  });
}

/** @param {unknown[]} nodes @param {string[]} [ids] */
function collectApiIds(nodes, ids = []) {
  for (const node of nodes) {
    const n = /** @type {{ id?: string, children?: unknown[] }} */ (node);
    if (n.id) ids.push(n.id);
    if (n.children) collectApiIds(n.children, ids);
  }
  return ids;
}

/** @param {unknown[]} nodes @param {string} key */
function findRootField(nodes, key) {
  const hit = nodes.find((n) => /** @type {{ key?: string }} */ (n).key === key);
  if (!hit) throw new Error(`field not found: ${key}`);
  return /** @type {{ check?: boolean, children?: unknown[] }} */ (hit);
}

/** @param {unknown[]} nodes @param {Array<string | number>} path */
function findApiPath(nodes, path) {
  /** @type {unknown[]} */
  let cur = nodes;
  for (const step of path) {
    if (typeof step === 'number') {
      const node = cur[step];
      if (!node) throw new Error(`path index not found: ${step}`);
      cur = /** @type {{ children?: unknown[] }} */ (node).children ?? [];
      continue;
    }
    const node = cur.find((n) => /** @type {{ key?: string }} */ (n).key === step);
    if (!node) throw new Error(`path key not found: ${step}`);
    cur = /** @type {{ children?: unknown[] }} */ (node).children ?? [];
  }
  return cur;
}

/**
 * @param {string} label
 * @param {string | undefined} outputName
 * @param {() => unknown} fn
 * @param {{
 *   assert?: (result: unknown) => void,
 *   golden?: string,
 *   expectError?: boolean,
 *   assertError?: (error: ParseError) => void,
 * }} [options]
 */
function runCase(label, outputName, fn, options = {}) {
  const { assert, golden, expectError = false, assertError } = options;

  try {
    if (expectError) {
      let threw = false;
      try {
        fn();
      } catch (error) {
        threw = true;
        if (!(error instanceof ParseError)) {
          throw error;
        }
        if (assertError) {
          assertError(error);
        }
      }
      if (!threw) {
        throw new Error('expected ParseError, but call succeeded');
      }
      console.log(`✓ ${label}`);
      return;
    }

    const result = fn();

    if (golden) {
      const goldenText = readGolden(golden);
      const actualText = String(result);
      assertGoldenMatch(actualText, goldenText, golden);
    }

    if (assert) {
      assert(result);
    }

    if (outputName) {
      if (outputName.endsWith('.json')) {
        writeJson(outputName, result);
      } else {
        writeText(outputName, result === null ? '(null)' : String(result));
      }
    }

    console.log(`✓ ${label}`);
  } catch (error) {
    failed += 1;
    console.error(`✗ ${label}: ${error.message}`);
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
  assert: (result) => {
    const names = String(result.names);
    if (names.includes('三引号注释')) {
      throw new Error('names must not contain opener-line comment text');
    }
    if (!names.includes('ddsd')) {
      throw new Error('names must contain body text "ddsd"');
    }
  },
});

runCase('json5 format', 'test.json5.format.text', () => json5.format(json5Input));

runCase(
  'json5 format (sortKeys)',
  'test.json5.format.sorted.text',
  () => json5.format(json5Input, { sortKeys: true, compact: true }),
);

runCase(
  'json5 format (compact)',
  'test.json5.format.compact.text',
  () => json5.format(json5Input, { compact: true }),
  { golden: 'test.json5.format.compact.text' },
);

runCase('json parse', 'test.json.parse.json', () => json.parse(jsonInput), {
  assert: (result) => {
    if (result['1'] !== '数字key') {
      throw new Error(`expected result["1"] === "数字key", got ${JSON.stringify(result['1'])}`);
    }
  },
});

runCase('java8 firstClassName', 'test.java.firstClassName.txt', () => java8.firstClassName(javaInput));

runCase('java8 signatures', 'test.java.signatures.json', () => java8.signatures(javaInput));

runCase(
  'api java8ToApiSchema',
  'test.java.api.json',
  () => api.java8ToApiSchema(javaInput, { rootClass: 'User' }),
  {
    assert: (result) => {
      const nodes = /** @type {unknown[]} */ (result);
      const expected = JSON.parse(readGolden('test.java.api.structure.json'));
      const actual = stripApiIds(nodes);
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error('structure mismatch against test.java.api.structure.json golden');
      }
      const ids = collectApiIds(nodes);
      if (ids.some((id) => typeof id !== 'string' || id.length === 0)) {
        throw new Error('every node must have non-empty string id');
      }
      if (new Set(ids).size !== ids.length) {
        throw new Error('all ids must be unique');
      }
      if (findRootField(nodes, 'name').check !== true) {
        throw new Error('name field check must be true');
      }
      if (findRootField(nodes, 'age').check !== false) {
        throw new Error('age field check must be false');
      }
      const userPChildren = findApiPath(nodes, ['userDetail', 'userP']);
      if (!userPChildren.some((n) => /** @type {{ key?: string }} */ (n).key === 'name')) {
        throw new Error('userP must inherit User field name');
      }
      if (!userPChildren.some((n) => /** @type {{ key?: string }} */ (n).key === 'id')) {
        throw new Error('userP must include own field id');
      }
      const nestedChildUser = findApiPath(nodes, ['child', 0, 'child', 0]);
      if (nestedChildUser.some((n) => /** @type {{ key?: string }} */ (n).key === 'child')) {
        throw new Error('nested User in child must not include child field');
      }
    },
  },
);

runCase(
  'json5 format sort+compact (case)',
  'cases.json5.sort-compact.text',
  () => json5.format(readCase('json5.sort-compact.text'), { sortKeys: true, compact: true }),
  {
    assert: (result) => {
      const text = String(result);
      if ((text.match(/a:\s*2/g) ?? []).length !== 1) {
        throw new Error('expected exactly one "a: 2" member');
      }
      if ((text.match(/b:\s*1/g) ?? []).length !== 1) {
        throw new Error('expected exactly one "b: 1" member');
      }
      if (!text.includes('about b')) {
        throw new Error('expected comment "// about b" to be preserved');
      }
    },
  },
);

runCase(
  'json5 format sort inline comment (case)',
  'cases.json5.sort-inline-comment.text',
  () => json5.format(readCase('json5.sort-inline-comment.text'), { sortKeys: true, compact: true }),
  {
    assert: (result) => {
      const text = String(result);
      if (!text.includes('"age": 18, // 年龄')) {
        throw new Error('expected inline comment on age member as \'"age": 18, // 年龄\'');
      }
    },
  },
);

runCase(
  'json5 format sort compact opening (case)',
  'cases.json5.sort-compact-opening.text',
  () => json5.format(readCase('json5.sort-compact-opening.text'), { sortKeys: true, compact: true }),
  {
    assert: (result) => {
      const text = String(result);
      if (!text.includes('{ // head')) {
        throw new Error('expected container opening comment on same line as "{"');
      }
    },
  },
);

runCase(
  'json5 format sort compact no blank (case)',
  'cases.json5.sort-compact-no-blank.text',
  () => json5.format(readCase('json5.sort-compact-no-blank.text'), { sortKeys: true, compact: true }),
  {
    assert: (result) => {
      const text = String(result);
      if (text.includes('\n\n')) {
        throw new Error('expected no blank lines between members');
      }
    },
  },
);

runCase(
  'json5 validate (invalid)',
  undefined,
  () => {
    json5.validate(readCase('json5.invalid.text'));
  },
  {
    expectError: true,
    assertError: (error) => {
      if (error.language !== 'json5') {
        throw new Error(`expected language "json5", got ${JSON.stringify(error.language)}`);
      }
    },
  },
);

runCase(
  'json5 triple opener line (parse)',
  undefined,
  () => json5.parse(readCase('json5.triple-opener-line.text')),
  {
    assert: (result) => {
      const text = String(result.x);
      if (text.includes('opener line comment')) {
        throw new Error('opener-line comment must not appear in parsed value');
      }
      if (!text.includes('body')) {
        throw new Error('expected body text in parsed value');
      }
    },
  },
);

runCase(
  'json5 triple opener block (parse)',
  undefined,
  () => json5.parse(readCase('json5.triple-opener-block.text')),
  {
    assert: (result) => {
      const text = String(result.x);
      if (text.includes('opener block')) {
        throw new Error('opener-line block comment must not appear in parsed value');
      }
      if (!text.includes('body')) {
        throw new Error('expected body text in parsed value');
      }
    },
  },
);

runCase(
  'json5 triple unclosed (validate)',
  undefined,
  () => json5.validate(readCase('json5.triple-unclosed.text')),
  {
    expectError: true,
    assertError: (error) => {
      if (error.language !== 'json5') {
        throw new Error(`expected language "json5", got ${JSON.stringify(error.language)}`);
      }
    },
  },
);

runCase(
  'json5 triple mismatch (validate)',
  undefined,
  () => json5.validate(readCase('json5.triple-mismatch.text')),
  {
    expectError: true,
    assertError: (error) => {
      if (error.language !== 'json5') {
        throw new Error(`expected language "json5", got ${JSON.stringify(error.language)}`);
      }
    },
  },
);

console.log('\n输出目录:', outDir);

if (failed > 0) {
  process.exit(1);
}
