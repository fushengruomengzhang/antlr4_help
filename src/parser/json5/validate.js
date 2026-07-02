import { runParsePipeline } from '../core/parse-pipeline.js';
import Json5Lexer from '../../grammars/json5/Json5Lexer.js';
import Json5Parser from '../../grammars/json5/Json5Parser.js';

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
