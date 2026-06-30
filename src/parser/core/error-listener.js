import antlr4 from 'antlr4';
import { ParseError } from './parse-error.js';

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
 * @param {ParseLanguage} language
 * @param {CollectingErrorListener} listener
 */
export function throwIfErrors(language, listener) {
  if (listener.errors.length === 0) return;
  const { line, column, message } = listener.errors[0];
  throw new ParseError({ language, line, column, message });
}
