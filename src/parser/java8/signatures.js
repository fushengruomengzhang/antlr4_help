import Java8Lexer from './Java8Lexer.js';
import Java8Parser from './Java8Parser.js';
import { runParsePipeline } from '../core/parse-pipeline.js';
import { extractFileModel } from './signature-visitor.js';

/**
 * @param {string} input
 * @returns {import('./models.js').FileModel}
 */
export function signatures(input) {
  const { tree } = runParsePipeline({
    language: 'java8',
    input,
    Lexer: Java8Lexer,
    Parser: Java8Parser,
    entryRule: 'compilationUnit',
  });
  return extractFileModel(tree);
}
