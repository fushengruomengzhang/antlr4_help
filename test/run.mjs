import { mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSON4, JSON5, JAVA8, API, ParseError } from '../src/index.js';

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

/** @param {string} text @param {string} [label] */
function assertNoWhitespaceOnlyLines(text, label = 'output') {
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.length > 0 && line.trim() === '') {
      throw new Error(`${label}: whitespace-only line at ${i + 1}: ${JSON.stringify(line)}`);
    }
  }
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
  JSON5.validate(json5Input);
  return 'OK';
});

runCase('json5 parse', 'test.json5.parse.json', () => JSON5.parse(json5Input), {
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

runCase('json5 format', 'test.json5.format.text', () => JSON5.format(json5Input));

runCase(
  'json5 format (sortKeys)',
  'test.json5.format.sorted.text',
  () => JSON5.format(json5Input, { sortKeys: true, compact: true }),
  {
    assert: (result) => {
      const text = String(result);
      if (!text.includes('"age": 18, // 年龄')) {
        throw new Error('expected sorted+compact output to preserve "age": 18, // 年龄');
      }
      assertNoWhitespaceOnlyLines(text, 'json5 format (sortKeys)');
      const compactText = JSON5.format(json5Input, { compact: true });
      if (text.split('\n').length !== compactText.split('\n').length) {
        throw new Error(
          `expected sorted+compact line count to match compact (${compactText.split('\n').length})`,
        );
      }
    },
  },
);

runCase(
  'json5 format (compact)',
  'test.json5.format.compact.text',
  () => JSON5.format(json5Input, { compact: true }),
  { golden: 'test.json5.format.compact.text' },
);

runCase('json parse', 'test.json.parse.json', () => JSON4.parse(jsonInput), {
  assert: (result) => {
    if (result['1'] !== '数字key') {
      throw new Error(`expected result["1"] === "数字key", got ${JSON.stringify(result['1'])}`);
    }
  },
});

runCase('java8 firstClassName', 'test.java.firstClassName.txt', () => JAVA8.firstClassName(javaInput));

runCase('java8 signatures', 'test.java.signatures.json', () => JAVA8.signatures(javaInput));

runCase(
  'api java8ToApiSchema',
  'test.java.api.json',
  () => API.java8ToApiSchema(javaInput, { rootClass: 'User' }),
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
  () => JSON5.format(readCase('json5.sort-compact.text'), { sortKeys: true, compact: true }),
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
  () => JSON5.format(readCase('json5.sort-inline-comment.text'), { sortKeys: true, compact: true }),
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
  () => JSON5.format(readCase('json5.sort-compact-opening.text'), { sortKeys: true, compact: true }),
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
  'json5 format sort compact gap (case)',
  'cases.json5.sort-compact-gap.text',
  () => JSON5.format(readCase('json5.sort-compact-gap.text'), { sortKeys: true, compact: true }),
  {
    assert: (result) => {
      const text = String(result);
      assertNoWhitespaceOnlyLines(text, 'json5.sort-compact-gap');
      if (!text.includes('"a": 2, // inline a')) {
        throw new Error('expected "a": 2, // inline a on one line with trailing inline comment');
      }
    },
  },
);

runCase(
  'json5 format sort compact no blank (case)',
  'cases.json5.sort-compact-no-blank.text',
  () => JSON5.format(readCase('json5.sort-compact-no-blank.text'), { sortKeys: true, compact: true }),
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
  'json5 format sort prefix comment (case)',
  'cases.json5.sort-prefix-comment.text',
  () => JSON5.format(readCase('json5.sort-prefix-comment.text'), { sortKeys: true, compact: true }),
  {
    assert: (result) => {
      const text = String(result);
      const keyIdx = text.indexOf('中文字段');
      const commentIdx = text.indexOf('// 中文 key');
      const dollarIdx = text.indexOf('"$key"');
      if (commentIdx < 0 || keyIdx < 0) {
        throw new Error('expected prefix comment and 中文字段 key to be preserved');
      }
      if (commentIdx > keyIdx) {
        throw new Error('expected // 中文 key before 中文字段');
      }
      const dollarLine = text.match(/"\$key"[^\n]*/)?.[0] ?? '';
      if (dollarLine.includes('中文 key')) {
        throw new Error('expected // 中文 key not on $key member line');
      }
      const betweenDollarAndChinese = text.slice(dollarIdx, keyIdx);
      if (!betweenDollarAndChinese.includes('// 中文 key')) {
        throw new Error('expected // 中文 key between $key and 中文字段 members');
      }
    },
  },
);

runCase(
  'json5 format sort prefix unicode (case)',
  'cases.json5.sort-prefix-unicode.text',
  () => JSON5.format(readCase('json5.sort-prefix-unicode.text'), { sortKeys: true, compact: true }),
  {
    assert: (result) => {
      const text = String(result);
      const unicodeKeyIdx = text.indexOf('"unicode"');
      const commentIdx = text.indexOf('// unicode');
      const bKeyIdx = text.indexOf('"b"');
      if (commentIdx < 0 || unicodeKeyIdx < 0) {
        throw new Error('expected // unicode prefix and unicode key to be preserved');
      }
      if (commentIdx > unicodeKeyIdx) {
        throw new Error('expected // unicode before "unicode" key');
      }
      const aLine = text.match(/"a"[^\n]*/)?.[0] ?? '';
      const bLine = text.match(/"b"[^\n]*/)?.[0] ?? '';
      if (aLine.includes('// unicode') || bLine.includes('// unicode')) {
        throw new Error('expected // unicode not on "a" or "b" member lines');
      }
      const betweenBAndUnicode = text.slice(bKeyIdx, unicodeKeyIdx);
      if (!betweenBAndUnicode.includes('// unicode')) {
        throw new Error('expected // unicode between "b" and "unicode" members');
      }
    },
  },
);

runCase(
  'json5 format sort prefix newline (case)',
  'cases.json5.sort-prefix-newline.text',
  () => JSON5.format(readCase('json5.sort-prefix-newline.text'), { sortKeys: true, compact: true }),
  {
    assert: (result) => {
      const text = String(result);
      if (text.includes('下划线"_private"')) {
        throw new Error('expected // 下划线 and "_private" on separate lines, not glued');
      }
      const commentIdx = text.indexOf('// 下划线');
      const keyIdx = text.indexOf('"_private"');
      if (commentIdx < 0 || keyIdx < 0) {
        throw new Error('expected // 下划线 prefix and "_private" key to be preserved');
      }
      if (commentIdx > keyIdx) {
        throw new Error('expected // 下划线 before "_private" key');
      }
    },
  },
);

runCase(
  'json5 format sort section inline (case)',
  'cases.json5.sort-section-inline.text',
  () => JSON5.format(readCase('json5.sort-section-inline.text'), { sortKeys: true, compact: true }),
  {
    assert: (result) => {
      const text = String(result);
      if (!text.includes('"age": 18, // 年龄')) {
        throw new Error('expected "age": 18, // 年龄 with trailing inline on same line');
      }
      if (!text.includes('"score": 99.5, // 分数') && !text.includes('"score": 99.5 // 分数')) {
        throw new Error('expected score member to preserve // 分数 comment');
      }
    },
  },
);

runCase(
  'json5 validate (invalid)',
  undefined,
  () => {
    JSON5.validate(readCase('json5.invalid.text'));
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
  () => JSON5.parse(readCase('json5.triple-opener-line.text')),
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
  () => JSON5.parse(readCase('json5.triple-opener-block.text')),
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
  () => JSON5.validate(readCase('json5.triple-unclosed.text')),
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
  () => JSON5.validate(readCase('json5.triple-mismatch.text')),
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
