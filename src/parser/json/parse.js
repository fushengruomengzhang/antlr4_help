import JSONLexer from './JSONLexer.js';
import JSONParser from './JSONParser.js';
import { runParsePipeline } from '../core/parse-pipeline.js';
import { visitValue } from './value-visitor.js';

/**
 * @param {string} input
 * @returns {unknown}
 */
export function parse(input) {
  const { tree } = runParsePipeline({
    language: 'json',
    input,
    Lexer: JSONLexer,
    Parser: JSONParser,
    entryRule: 'json',
  });
  return visitValue(tree.value());
}
