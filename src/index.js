import { ParseError } from './parser/core/parse-error.js';
import { parse as jsonParse } from './parser/json/parse.js';
import { validate as json5Validate } from './parser/json5/validate.js';
import { parse as json5Parse } from './parser/json5/parse.js';
import { format as json5Format, DEFAULT_FORMAT_OPTIONS } from './parser/json5/format.js';
import { firstClassName } from './parser/java8/first-class-name.js';
import { signatures } from './parser/java8/signatures.js';

export { ParseError, DEFAULT_FORMAT_OPTIONS };

export const json5 = {
  validate: json5Validate,
  parse: json5Parse,
  format: json5Format,
};

export const json = {
  parse: jsonParse,
};

export const java8 = {
  firstClassName,
  signatures,
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runDemo() {
  console.log('=== json5 ===');
  const json5Input = `{ name: 'test', // comment\n value: 1, }`;
  json5.validate(json5Input);
  console.log('validate: OK');
  console.log('parse:', json5.parse(json5Input));
  const formatted = json5.format(json5Input, { sortKeys: true });
  console.log('format:\n' + formatted);

  console.log('\n=== json ===');
  const jsonInput = '{"a":1,"b":[true,null]}';
  console.log('parse:', json.parse(jsonInput));

  console.log('\n=== java8 ===');
  const javaInput = `
public class Parent {
  void foo() { }
  int x;
}
public class Child extends Parent implements Runnable {
  void foo() { }
  class Inner { }
  public void run() { }
}
`;
  console.log('firstClassName:', java8.firstClassName(javaInput));
  const sig = java8.signatures(javaInput);
  console.log('types:', sig.types.map((t) => t.name));
  console.log(
    'Child ownMethods:',
    sig.types[1].ownMembers.filter((m) => m.kind === 'method').map((m) => m.name),
  );

  console.log('\n=== error shape ===');
  try {
    json.parse('{bad}');
  } catch (e) {
    assert(e instanceof ParseError, 'expected ParseError');
    assert(typeof e.line === 'number' && typeof e.column === 'number', 'line/column');
    console.log('ParseError:', { language: e.language, line: e.line, column: e.column, message: e.message });
  }

  console.log('\n解析成功 ✅');
}

if (process.argv[1] && process.argv[1].endsWith('index.js')) {
  runDemo();
}
