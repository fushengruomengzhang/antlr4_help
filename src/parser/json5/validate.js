import Json5Lexer from './Json5Lexer.js';
import Json5Parser from './Json5Parser.js';
import { runParsePipeline } from '../core/parse-pipeline.js';

/**
 * @param {string} input
 */
export function validate(input) {
  runParsePipeline({
    language: 'json5',
    input,
    Lexer: Json5Lexer,
    Parser: Json5Parser,
    entryRule: 'json5',
  });
}
