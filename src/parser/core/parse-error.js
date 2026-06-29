/**
 * @typedef {'json5' | 'json' | 'java8'} ParseLanguage
 */

export class ParseError extends Error {
  /**
   * @param {object} params
   * @param {ParseLanguage} params.language
   * @param {number} params.line 1-based
   * @param {number} params.column 0-based (ANTLR charPositionInLine)
   * @param {string} params.message
   */
  constructor({ language, line, column, message }) {
    super(message);
    this.name = 'ParseError';
    this.language = language;
    this.line = line;
    this.column = column;
    this.message = message;
  }
}
