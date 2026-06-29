import Java8Lexer from '../../grammars/java8/Java8Lexer.js';
import Java8Parser from '../../grammars/java8/Java8Parser.js';
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
