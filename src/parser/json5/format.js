import Json5Lexer from '../../grammars/json5/Json5Lexer.js';
import Json5Parser from '../../grammars/json5/Json5Parser.js';
import { runParsePipeline } from '../core/parse-pipeline.js';
import { FormatEmitter } from './format-emitter.js';

/**
 * @param {string} input
 * @param {import('./format-emitter.js').FormatOptions} [options]
 * @returns {string}
 */
export function format(input, options) {
  const { tree, tokenStream } = runParsePipeline({
    language: 'json5',
    input,
    Lexer: Json5Lexer,
    Parser: Json5Parser,
    entryRule: 'json5',
    fillTokens: true,
  });
  const emitter = new FormatEmitter(tokenStream, options);
  return emitter.formatDocument(tree);
}

export { DEFAULT_FORMAT_OPTIONS, normalizeFormatOptions } from './format-emitter.js';
