/**
 * antlr4_help 统一入口 — 聚合各产品线 public export。
 *
 * 基于 ANTLR 4.9.3 的 Node.js (ESM) 解析库，对外暴露：
 * `JSON5`、`JSON4`、`JAVA8`、`API`、`ParseError`、`DEFAULT_FORMAT_OPTIONS`。
 *
 * 各产品线用法文档见对应 package `index.js`：
 * - {@link module:json5} — `src/parser/json5/index.js`
 * - {@link module:json4} — `src/parser/json/index.js`
 * - {@link module:java8} — `src/parser/java8/index.js`
 * - {@link module:api} — `src/parser/api/index.js`
 * - {@link module:parse-error} — `src/parser/parse-error.js`
 *
 * ```javascript
 * import { JSON5, JSON4, JAVA8, API, ParseError, DEFAULT_FORMAT_OPTIONS } from './src/index.js';
 * ```
 *
 * @module antlr4_help
 */

export { ParseError } from './parser/parse-error.js';
export { JSON5, DEFAULT_FORMAT_OPTIONS } from './parser/json5/index.js';
export { JSON4 } from './parser/json/index.js';
export { JAVA8 } from './parser/java8/index.js';
export { API } from './parser/api/index.js';
