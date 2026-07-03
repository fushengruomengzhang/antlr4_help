import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSON4, JSON5, JAVA8, API, ParseError } from '../src/index.js';
import { buildDocumentAst } from '../src/parser/json5/format/ast-builder-transform.js';
import { CommentSlicer } from '../src/parser/json5/format/token-slice.js';
import Json5Lexer from '../src/grammars/json5/Json5Lexer.js';
import Json5Parser from '../src/grammars/json5/Json5Parser.js';
import { runParsePipeline } from '../src/parser/core/parse-pipeline.js';
import {
  assertExpectedMatch,
  readFixture,
} from './format-expected-utils.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const resourcesDir = join(__dirname, 'resources');

let failed = 0;

/** @param {string} name */
function readCase(name) {
  return readFileSync(join(resourcesDir, 'cases', name), 'utf8');
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
 * @param {() => unknown} fn
 * @param {{
 *   assert?: (result: unknown) => void,
 *   expectError?: boolean,
 *   assertError?: (error: ParseError) => void,
 * }} [options]
 */
function runCase(label, fn, options = {}) {
  const { assert, expectError = false, assertError } = options;

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

    if (assert) {
      assert(result);
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

runCase('json5 validate', () => {
  JSON5.validate(json5Input);
  return 'OK';
});

runCase('json5 parse', () => JSON5.parse(json5Input), {
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

runCase('json5 parse preserves source key order', () => JSON5.parse('{ b: 1, a: 2 }'), {
  assert: (result) => {
    const keys = Object.keys(result);
    if (keys.length !== 2 || keys[0] !== 'b' || keys[1] !== 'a') {
      throw new Error(`expected key order [b,a], got ${JSON.stringify(keys)}`);
    }
  },
});

runCase('json5 parse sortKeys top-level', () => JSON5.parse('{ b: 2, a: 1 }', { sortKeys: true }), {
  assert: (result) => {
    const keys = Object.keys(result);
    if (JSON.stringify(keys) !== JSON.stringify(['a', 'b'])) {
      throw new Error(`expected sorted keys [a,b], got ${JSON.stringify(keys)}`);
    }
    if (result.a !== 1 || result.b !== 2) {
      throw new Error(`expected values a=1,b=2, got ${JSON.stringify(result)}`);
    }
  },
});

runCase('json5 parse sortKeys nested', () => JSON5.parse('{ z: { y: 1, x: 2 } }', { sortKeys: true }), {
  assert: (result) => {
    if (JSON.stringify(Object.keys(result)) !== JSON.stringify(['z'])) {
      throw new Error(`expected top-level keys [z], got ${JSON.stringify(Object.keys(result))}`);
    }
    if (JSON.stringify(Object.keys(result.z)) !== JSON.stringify(['x', 'y'])) {
      throw new Error(`expected nested keys [x,y], got ${JSON.stringify(Object.keys(result.z))}`);
    }
  },
});

runCase('json5 parse sortKeys array order unchanged', () => {
  const arr = JSON5.parse('[3, 1, 2]', { sortKeys: true });
  if (JSON.stringify(arr) !== JSON.stringify([3, 1, 2])) {
    throw new Error(`expected array [3,1,2], got ${JSON.stringify(arr)}`);
  }
  const obj = JSON5.parse('{ b: [3, 1], a: 0 }', { sortKeys: true });
  if (JSON.stringify(Object.keys(obj)) !== JSON.stringify(['a', 'b'])) {
    throw new Error(`expected object keys [a,b], got ${JSON.stringify(Object.keys(obj))}`);
  }
  if (JSON.stringify(obj.b) !== JSON.stringify([3, 1])) {
    throw new Error(`expected obj.b [3,1], got ${JSON.stringify(obj.b)}`);
  }
  return 'OK';
});

runCase('json5 parse sortKeys type error', () => {
  try {
    JSON5.parse('{}', { sortKeys: 1 });
    throw new Error('expected TypeError for non-boolean sortKeys');
  } catch (e) {
    if (!(e instanceof TypeError)) throw e;
    return 'OK';
  }
});

runCase('json5 format (default)', () => {
  const result = JSON5.format(json5Input);
  assertExpectedMatch(result, join('json5', 'fixture.default.text'), 'json5 format default');
  return result;
});

runCase(
  'json5 format (sortKeys)',
  () => JSON5.format(json5Input, { sortKeys: true, compact: true }),
  {
    assert: (result) => {
      const text = String(result);
      assertExpectedMatch(
        text,
        join('json5', 'fixture.sort-compact.text'),
        'json5 format sort-compact',
      );
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
  () => JSON5.format(json5Input, { compact: true }),
  {
    assert: (result) => {
      assertExpectedMatch(
        String(result),
        join('json5', 'fixture.compact.text'),
        'json5 format compact',
      );
    },
  },
);

runCase('json parse', () => JSON4.parse(jsonInput), {
  assert: (result) => {
    if (result['1'] !== '数字key') {
      throw new Error(`expected result["1"] === "数字key", got ${JSON.stringify(result['1'])}`);
    }
  },
});

runCase('json parse preserves source key order', () => JSON4.parse('{"b":1,"a":2}'), {
  assert: (result) => {
    const keys = Object.keys(result);
    if (keys.length !== 2 || keys[0] !== 'b' || keys[1] !== 'a') {
      throw new Error(`expected key order [b,a], got ${JSON.stringify(keys)}`);
    }
  },
});

runCase('json parse sortKeys top-level', () => JSON4.parse('{"b":2,"a":1}', { sortKeys: true }), {
  assert: (result) => {
    const keys = Object.keys(result);
    if (JSON.stringify(keys) !== JSON.stringify(['a', 'b'])) {
      throw new Error(`expected sorted keys [a,b], got ${JSON.stringify(keys)}`);
    }
    if (result.a !== 1 || result.b !== 2) {
      throw new Error(`expected values a=1,b=2, got ${JSON.stringify(result)}`);
    }
  },
});

runCase('json parse sortKeys nested', () => JSON4.parse('{"z":{"y":1,"x":2}}', { sortKeys: true }), {
  assert: (result) => {
    if (JSON.stringify(Object.keys(result)) !== JSON.stringify(['z'])) {
      throw new Error(`expected top-level keys [z], got ${JSON.stringify(Object.keys(result))}`);
    }
    if (JSON.stringify(Object.keys(result.z)) !== JSON.stringify(['x', 'y'])) {
      throw new Error(`expected nested keys [x,y], got ${JSON.stringify(Object.keys(result.z))}`);
    }
  },
});

runCase('json parse sortKeys array order unchanged', () => {
  const arr = JSON4.parse('[3,1,2]', { sortKeys: true });
  if (JSON.stringify(arr) !== JSON.stringify([3, 1, 2])) {
    throw new Error(`expected array [3,1,2], got ${JSON.stringify(arr)}`);
  }
  const obj = JSON4.parse('{"b":[3,1],"a":0}', { sortKeys: true });
  if (JSON.stringify(Object.keys(obj)) !== JSON.stringify(['a', 'b'])) {
    throw new Error(`expected object keys [a,b], got ${JSON.stringify(Object.keys(obj))}`);
  }
  if (JSON.stringify(obj.b) !== JSON.stringify([3, 1])) {
    throw new Error(`expected obj.b [3,1], got ${JSON.stringify(obj.b)}`);
  }
});

runCase('json parse sortKeys type error', () => {
  try {
    JSON4.parse('{}', { sortKeys: 1 });
    throw new Error('expected TypeError for non-boolean sortKeys');
  } catch (error) {
    if (!(error instanceof TypeError)) {
      throw error;
    }
  }
});

runCase('java8 firstClassName', () => JAVA8.firstClassName(javaInput));

runCase('java8 peekFirstClassName', () => JAVA8.peekFirstClassName(javaInput));

runCase(
  'java8 peek vs strict invalid body (case)',
  () => {
    const input = readCase('java8.peek-invalid-body.java.text');
    const peek = JAVA8.peekFirstClassName(input);
    if (peek !== 'BrokenUser') {
      throw new Error(`peekFirstClassName expected BrokenUser, got ${JSON.stringify(peek)}`);
    }
    try {
      JAVA8.firstClassName(input);
      throw new Error('firstClassName expected ParseError on invalid body');
    } catch (error) {
      if (!(error instanceof ParseError)) {
        throw error;
      }
    }
    return peek;
  },
);

runCase('java8 signatures', () => JAVA8.signatures(javaInput));

runCase(
  'api java8ToApiSchema',
  () => API.java8ToApiSchema(javaInput, { rootClass: 'User' }),
  {
    assert: (result) => {
      const nodes = /** @type {unknown[]} */ (result);
      const expected = JSON.parse(readFixture('test.java.api.structure.json'));
      const actual = stripApiIds(nodes);
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error('structure mismatch against test.java.api.structure.json');
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
  'json5 format compact empty object indent (case)',
  () =>
    JSON5.format(readCase('json5.compact-empty-object-indent.text'), {
      compact: true,
      indent: { type: 'space', size: 4 },
    }),
  {
    assert: (result) => {
      const lines = String(result).split('\n');
      const userIdx = lines.findIndex((l) => l.includes('"user": { // 用户基础信息'));
      if (userIdx < 0) {
        throw new Error('expected "user" empty object member line');
      }
      const userIndent = lines[userIdx].match(/^ */)?.[0].length ?? -1;
      const closeIndent = lines[userIdx + 1]?.match(/^ */)?.[0].length ?? -1;
      if (userIndent !== closeIndent) {
        throw new Error(
          `empty object close indent mismatch: user line ${userIndent}, close line ${closeIndent}`,
        );
      }
    },
  },
);

runCase(
  'json5 ast-builder slots (sort prefix / openRight)',
  () => {
    const prefixInput = readCase('json5.sort-prefix-comment.text');
    const { tree, tokenStream } = runParsePipeline({
      language: 'json5',
      input: prefixInput,
      Lexer: Json5Lexer,
      Parser: Json5Parser,
      entryRule: 'json5',
      fillTokens: true,
    });
    const doc = buildDocumentAst(tree, tokenStream, prefixInput);
    const slicer = new CommentSlicer(tokenStream, prefixInput.length);
    const obj = /** @type {{ kind: string, open: import('../src/parser/json5/format/token-slice.js').AnchorTriplet, entries: Array<{ sortKey: string, key: import('../src/parser/json5/format/token-slice.js').AnchorTriplet, end: import('../src/parser/json5/format/token-slice.js').AnchorTriplet }> }} */ (
      doc.value
    );
    if (obj.kind !== 'object') {
      throw new Error('expected object root');
    }
    const chinese = obj.entries.find((e) => e.sortKey === '中文字段');
    const chinesePrefix = slicer.prefixComments(chinese.key).join('');
    if (!chinesePrefix.includes('中文 key')) {
      throw new Error('expected // 中文 key in 中文字段 key prefix interval');
    }
    const dollar = obj.entries.find((e) => e.sortKey === '$key');
    const dollarPrefix = slicer.prefixComments(dollar.key).join('');
    if (dollarPrefix.includes('中文 key')) {
      throw new Error('expected // 中文 key not on $key prefix interval');
    }

    const openingInput = readCase('json5.sort-compact-opening.text');
    const opened = runParsePipeline({
      language: 'json5',
      input: openingInput,
      Lexer: Json5Lexer,
      Parser: Json5Parser,
      entryRule: 'json5',
      fillTokens: true,
    });
    const openDoc = buildDocumentAst(opened.tree, opened.tokenStream, openingInput);
    const openSlicer = new CommentSlicer(opened.tokenStream, openingInput.length);
    const openObj = /** @type {{ open: import('../src/parser/json5/format/token-slice.js').AnchorTriplet }} */ (openDoc.value);
    const openInline = openSlicer.suffixComments(openObj.open, true).join('');
    if (!openInline.includes('head')) {
      throw new Error('expected container open suffix to include // head');
    }

    const inlineInput = readCase('json5.sort-inline-comment.text');
    const inlineParsed = runParsePipeline({
      language: 'json5',
      input: inlineInput,
      Lexer: Json5Lexer,
      Parser: Json5Parser,
      entryRule: 'json5',
      fillTokens: true,
    });
    const inlineDoc = buildDocumentAst(inlineParsed.tree, inlineParsed.tokenStream, inlineInput);
    const inlineSlicer = new CommentSlicer(inlineParsed.tokenStream, inlineInput.length);
    const inlineObj = /** @type {{ entries: Array<{ sortKey: string, end: import('../src/parser/json5/format/token-slice.js').AnchorTriplet }> }} */ (
      inlineDoc.value
    );
    const age = inlineObj.entries.find((e) => e.sortKey === 'age');
    const ageInline = inlineSlicer.suffixComments(age.end, true).join('');
    if (!ageInline.includes('年龄')) {
      throw new Error('expected // 年龄 in age end suffix interval');
    }
    return 'OK';
  },
);

runCase(
  'json5 format sort prefix comment (case)',
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
  'json5 format trailing comma stripped',
  () => JSON5.format('{ a: 1, }'),
  {
    assert: (result) => {
      const text = String(result);
      if (text.includes(',}')) {
        throw new Error('expected trailing comma removed before }');
      }
    },
  },
);

runCase(
  'json5 format header comment not duplicated',
  () => JSON5.format('{\n  // json 测试\n  "a": 1\n}', { compact: true }),
  {
    assert: (result) => {
      const matches = String(result).match(/\/\/ json 测试/g) ?? [];
      if (matches.length !== 1) {
        throw new Error(`expected one header comment, got ${matches.length}`);
      }
    },
  },
);

runCase(
  'json5 format inline comment not duplicated',
  () => JSON5.format('{\n  "age": 18, // 年龄\n  "name": "x"\n}', { compact: true }),
  {
    assert: (result) => {
      const matches = String(result).match(/\/\/ 年龄/g) ?? [];
      if (matches.length !== 1) {
        throw new Error(`expected one inline comment, got ${matches.length}`);
      }
    },
  },
);

runCase(
  'json5 format pretty triple-quote round-trip',
  () => JSON5.format("{ a: ''' // opener\nline1\nline2''' }", { compact: false }),
  {
    assert: (result) => {
      const text = String(result);
      if (!/'''/.test(text)) {
        throw new Error('expected triple-single output');
      }
      if (/'''[\s\S]*"""/.test(text)) {
        throw new Error('expected consistent triple-quote delimiter family');
      }
      JSON5.format(text, { compact: false });
    },
  },
);

runCase(
  'json5 validate (invalid)',
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

if (failed > 0) {
  process.exit(1);
}

console.log('run.mjs: all tests passed');
