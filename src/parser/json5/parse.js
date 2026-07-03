import { runParsePipeline, visitArrayChildren } from '../core/parse-pipeline.js';
import Json5Lexer from '../../grammars/json5/Json5Lexer.js';
import Json5Parser from '../../grammars/json5/Json5Parser.js';
import {
  decodeJson5String,
  decodeTripleBody,
  keyToString,
  parseJson5Number,
  tripleStringBodyText,
} from './decode.js';
import { validate } from './validate.js';

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
 * @param {import('../../grammars/json5/Json5Parser.js').default.ValueContext} ctx
 * @param {ResolvedParseOptions} options
 */
function visitValue(ctx, options) {
  if (ctx.object()) return visitObject(ctx.object(), options);
  if (ctx.array()) return visitArray(ctx.array(), options);
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
  if (ctx.literal()) return visitLiteral(ctx.literal());
  throw new Error(`Unexpected value: ${ctx.getText()}`);
}

/** @param {import('../../grammars/json5/Json5Parser.js').default.LiteralContext} ctx */
function visitLiteral(ctx) {
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

/**
 * @param {import('../../grammars/json5/Json5Parser.js').default.ObjectContext} ctx
 * @param {ResolvedParseOptions} options
 */
function visitObject(ctx, options) {
  const members = ctx.member ? ctx.member() : [];
  /** @type {{ key: string, value: unknown, index: number }[]} */
  const pairs = new Array(members.length);
  for (let i = 0; i < members.length; i++) {
    const member = members[i];
    pairs[i] = {
      key: keyToString(member.key()),
      value: visitValue(member.value(), options),
      index: i,
    };
  }
  if (options.sortKeys) {
    pairs.sort((a, b) => a.key.localeCompare(b.key) || a.index - b.index);
  }
  const result = {};
  for (const { key, value } of pairs) {
    result[key] = value;
  }
  return result;
}

/**
 * @param {import('../../grammars/json5/Json5Parser.js').default.ArrayContext} ctx
 * @param {ResolvedParseOptions} options
 */
function visitArray(ctx, options) {
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
    language: 'json5',
    input,
    Lexer: Json5Lexer,
    Parser: Json5Parser,
    entryRule: 'json5',
  });
  return visitValue(tree.value(), resolved);
}

export const JSON5 = { parse, validate };
