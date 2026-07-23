import antlr4 from 'antlr4';
import { ParseError } from '../parse-error.js';

const { PredictionMode } = antlr4.atn;

/** 收集词法/语法错误，供 pipeline 与 peek 路径统一抛出 ParseError。 */
export class CollectingErrorListener extends antlr4.error.ErrorListener {
  constructor() {
    super();
    /** @type {{ line: number, column: number, message: string }[]} */
    this.errors = [];
  }

  /** ANTLR 回调：记录一条 syntaxError。 */
  syntaxError(_recognizer, _offendingSymbol, line, column, msg) {
    this.errors.push({ line, column, message: msg });
  }
}

/**
 * 若 listener 有错误则抛出 ParseError（取第一条）。
 * @param {import('../parse-error.js').ParseLanguage} language
 * @param {CollectingErrorListener} listener
 */
export function throwIfErrors(language, listener) {
  if (listener.errors.length === 0) return;
  const { line, column, message } = listener.errors[0];
  throw new ParseError({ language, line, column, message });
}

/**
 * CST visitor 共享辅助：预分配 loop 替代 `.map` 以减少中间数组分配。
 * @template T
 * @param {unknown[]} nodes
 * @param {(node: unknown) => T} visitFn
 * @returns {T[]}
 */
export function visitArrayChildren(nodes, visitFn) {
  const n = nodes.length;
  const arr = new Array(n);
  for (let i = 0; i < n; i++) {
    arr[i] = visitFn(nodes[i]);
  }
  return arr;
}

/**
 * @typedef {object} ParsePipelineOptions
 * @property {import('../parse-error.js').ParseLanguage} language
 * @property {string} input
 * @property {typeof antlr4.Lexer} Lexer
 * @property {typeof antlr4.Parser} Parser
 * @property {string} entryRule Parser method name, e.g. 'json5'
 * @property {boolean} [fillTokens=false] Load HIDDEN channel tokens (for format)
 */

/**
 * 按语言选择预测模式：java8 → LL；json5 / json → SLL。
 * @param {import('../parse-error.js').ParseLanguage} language
 */
function predictionModeForLanguage(language) {
  return language === 'java8' ? PredictionMode.LL : PredictionMode.SLL;
}

/**
 * 统一 ANTLR 解析管线：InputStream → Lexer → TokenStream → Parser → entry rule。
 * 预测模式按 `language` 分流（单次解析，无 Bail→LL 重试）。
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
  if (fillTokens) tokenStream.fill();
  const parser = new Parser(tokenStream);
  const parserListener = new CollectingErrorListener();
  parser.removeErrorListeners();
  parser.addErrorListener(parserListener);

  const entry = parser[entryRule];
  if (typeof entry !== 'function') {
    throw new Error(`Parser has no entry rule "${entryRule}"`);
  }

  parser._interp.predictionMode = predictionModeForLanguage(language);
  const tree = entry.call(parser);

  throwIfErrors(language, lexerListener);
  throwIfErrors(language, parserListener);

  return { tree, tokenStream, parser };
}
