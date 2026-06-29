import antlr4 from 'antlr4';
import { ParseError } from './parse-error.js';

class CollectingErrorListener extends antlr4.error.ErrorListener {
  constructor() {
    super();
    /** @type {{ line: number, column: number, message: string }[]} */
    this.errors = [];
  }

  syntaxError(_recognizer, _offendingSymbol, line, column, msg) {
    this.errors.push({ line, column, message: msg });
  }
}

/**
 * @param {ParseLanguage} language
 * @param {CollectingErrorListener} listener
 */
function throwIfErrors(language, listener) {
  if (listener.errors.length === 0) return;
  const { line, column, message } = listener.errors[0];
  throw new ParseError({ language, line, column, message });
}

/**
 * @typedef {object} ParsePipelineOptions
 * @property {ParseLanguage} language
 * @property {string} input
 * @property {typeof antlr4.Lexer} Lexer
 * @property {typeof antlr4.Parser} Parser
 * @property {string} entryRule Parser method name, e.g. 'json5'
 * @property {boolean} [fillTokens=false] Load HIDDEN channel tokens (for format)
 */

/**
 * @param {ParsePipelineOptions} options
 * @returns {{ tree: import('antlr4').ParserRuleContext, tokenStream: import('antlr4').CommonTokenStream, parser: import('antlr4').Parser }}
 */
export function runParsePipeline({ language, input, Lexer, Parser, entryRule, fillTokens = false }) {
  const chars = new antlr4.InputStream(input);
  const lexer = new Lexer(chars);
  const lexerListener = new CollectingErrorListener();
  lexer.removeErrorListeners();
  lexer.addErrorListener(lexerListener);

  const tokenStream = new antlr4.CommonTokenStream(lexer);
  if (fillTokens) {
    tokenStream.fill();
  }

  const parser = new Parser(tokenStream);
  const parserListener = new CollectingErrorListener();
  parser.removeErrorListeners();
  parser.addErrorListener(parserListener);

  const entry = parser[entryRule];
  if (typeof entry !== 'function') {
    throw new Error(`Parser has no entry rule "${entryRule}"`);
  }
  const tree = entry.call(parser);

  throwIfErrors(language, lexerListener);
  throwIfErrors(language, parserListener);

  return { tree, tokenStream, parser };
}
