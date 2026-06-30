import antlr4 from 'antlr4';
import { ParseError } from './parse-error.js';
import { CollectingErrorListener, throwIfErrors } from './error-listener.js';

const { PredictionMode } = antlr4.atn;

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
 * SLL 预测失败时 reset 后以 LL 重试一次。
 * @param {import('antlr4').Parser} parser
 * @param {import('antlr4').CommonTokenStream} tokenStream
 * @param {() => import('antlr4').ParserRuleContext} entryFn
 */
function parseWithPrediction(parser, tokenStream, entryFn) {
  parser._interp.predictionMode = PredictionMode.SLL;
  try {
    return entryFn();
  } catch {
    tokenStream.seek(0);
    parser.reset();
    parser._interp.predictionMode = PredictionMode.LL;
    return entryFn();
  }
}

/**
 * 统一 ANTLR 解析管线：InputStream → Lexer → TokenStream → Parser → entry rule。
 * 先尝试 SLL 预测，失败则 reset 后以 LL 重试。
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

  const tree = parseWithPrediction(parser, tokenStream, () => entry.call(parser));

  throwIfErrors(language, lexerListener);
  throwIfErrors(language, parserListener);

  return { tree, tokenStream, parser };
}
