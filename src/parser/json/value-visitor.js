import { decodeJsonString } from '../core/string-decode.js';
import { visitArrayChildren, runParsePipeline } from '../core/parse-pipeline.js';
import JSONLexer from '../../grammars/json/JSONLexer.js';
import JSONParser from '../../grammars/json/JSONParser.js';

/**
 * @typedef {object} ParseOptions
 * @property {boolean} [sortKeys]
 */

/**
 * @typedef {object} ResolvedParseOptions
 * @property {boolean} sortKeys
 */

/**
 * @param {ParseOptions} [options]
 * @returns {ResolvedParseOptions}
 */
function resolveParseOptions(options) {
  if (options == null) {
    return { sortKeys: false };
  }
  const { sortKeys = false } = options;
  if (typeof sortKeys !== 'boolean') {
    throw new TypeError('sortKeys must be a boolean');
  }
  return { sortKeys };
}

/**
 * @param {import('../../grammars/json/JSONParser.js').default.ValueContext} ctx
 * @param {ResolvedParseOptions} options
 */
export function visitValue(ctx, options) {
  if (ctx.STRING()) {
    return decodeJsonString(ctx.STRING().getText());
  }
  if (ctx.NUMBER()) {
    return Number(ctx.NUMBER().getText());
  }
  if (ctx.obj()) {
    return visitObj(ctx.obj(), options);
  }
  if (ctx.arr()) {
    return visitArr(ctx.arr(), options);
  }
  const text = ctx.getText();
  if (text === 'true') return true;
  if (text === 'false') return false;
  if (text === 'null') return null;
  throw new Error(`Unexpected value: ${text}`);
}

/**
 * @param {import('../../grammars/json/JSONParser.js').default.ObjContext} ctx
 * @param {ResolvedParseOptions} options
 */
function visitObj(ctx, options) {
  const rawPairs = ctx.pair ? ctx.pair() : [];
  /** @type {{ key: string, value: unknown, index: number }[]} */
  const pairs = new Array(rawPairs.length);
  for (let i = 0; i < rawPairs.length; i++) {
    const pair = rawPairs[i];
    pairs[i] = {
      key: decodeJsonString(pair.STRING().getText()),
      value: visitValue(pair.value(), options),
      index: i,
    };
  }
  if (options.sortKeys) {
    pairs.sort((a, b) => a.key.localeCompare(b.key) || a.index - b.index);
  }
  const result = Object.create(null);
  for (const { key, value } of pairs) {
    result[key] = value;
  }
  return result;
}

/**
 * @param {import('../../grammars/json/JSONParser.js').default.ArrContext} ctx
 * @param {ResolvedParseOptions} options
 */
function visitArr(ctx, options) {
  const values = ctx.value ? ctx.value() : [];
  return visitArrayChildren(values, (node) => visitValue(node, options));
}

/**
 * @param {string} input
 * @param {ParseOptions} [options]
 * @returns {unknown}
 */
export function parse(input, options) {
  const resolved = resolveParseOptions(options);
  const { tree } = runParsePipeline({
    language: 'json',
    input,
    Lexer: JSONLexer,
    Parser: JSONParser,
    entryRule: 'json',
  });
  return visitValue(tree.value(), resolved);
}
