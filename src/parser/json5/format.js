import Json5Lexer from '../../grammars/json5/Json5Lexer.js';
import Json5Parser from '../../grammars/json5/Json5Parser.js';
import { runParsePipeline } from '../core/parse-pipeline.js';
import { buildDocumentAst } from './format/ast-builder.js';
import { transformDocumentAst } from './format/ast-transform.js';
import { emitDocument } from './format/emit.js';

export { DEFAULT_FORMAT_OPTIONS, normalizeFormatOptions } from './format/format-options.js';

/**
 * @param {string} input
 * @param {import('./format/format-options.js').FormatOptions} [options]
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
  const ast = buildDocumentAst(tree, tokenStream);
  const transformed = transformDocumentAst(ast, options);
  return emitDocument(transformed, options);
}
