import Json5Lexer from './Json5Lexer.js';
import Json5Parser from './Json5Parser.js';
import { runParsePipeline } from '../core/parse-pipeline.js';
import { visitValue } from './value-visitor.js';

/**
 * @param {string} input
 * @returns {unknown}
 */
export function parse(input) {
  const { tree } = runParsePipeline({
    language: 'json5',
    input,
    Lexer: Json5Lexer,
    Parser: Json5Parser,
    entryRule: 'json5',
  });
  return visitValue(tree.value());
}
