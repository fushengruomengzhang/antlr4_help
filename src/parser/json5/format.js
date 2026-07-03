import Json5Lexer from '../../grammars/json5/Json5Lexer.js';
import Json5Parser from '../../grammars/json5/Json5Parser.js';
import { runParsePipeline } from '../core/parse-pipeline.js';
import { buildAndTransformDocumentAst } from './format/ast-builder-transform.js';
import { emitDocument } from './format/emit.js';
import { validate } from './validate.js';

/**
 * @typedef {object} IndentConfig
 * @property {'space' | 'tab'} type
 * @property {number} [size] required when type is 'space'
 */

/**
 * @typedef {object} FormatOptions
 * @property {IndentConfig} [indent]
 * @property {boolean} [sortKeys]
 * @property {boolean} [compact]
 */

/**
 * @typedef {object} ResolvedFormatOptions
 * @property {IndentConfig} indent
 * @property {boolean} sortKeys
 * @property {boolean} compact
 */

export const DEFAULT_FORMAT_OPTIONS = {
  indent: { type: 'space', size: 2 },
  sortKeys: false,
  compact: false,
};

/**
 * @param {FormatOptions} [options]
 * @returns {ResolvedFormatOptions}
 */
function resolveFormatOptions(options) {
  const indent = options?.indent ?? DEFAULT_FORMAT_OPTIONS.indent;
  return {
    indent:
      indent.type === 'tab' ? { type: 'tab' } : { type: 'space', size: indent.size ?? 2 },
    sortKeys: options?.sortKeys ?? false,
    compact: options?.compact ?? false,
  };
}

/**
 * @param {string} input
 * @param {FormatOptions} [options]
 * @returns {string}
 */
export function format(input, options) {
  const resolved = resolveFormatOptions(options);
  const { tree, tokenStream } = runParsePipeline({
    language: 'json5',
    input,
    Lexer: Json5Lexer,
    Parser: Json5Parser,
    entryRule: 'json5',
    fillTokens: true,
  });
  const doc = buildAndTransformDocumentAst(tree, tokenStream, input, resolved);
  return emitDocument(doc, tokenStream, resolved, input);
}

export const JSON5 = {
  format,
  validate,
};
