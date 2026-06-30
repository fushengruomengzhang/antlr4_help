/**
 * 标准 JSON 产品线（100% ANTLR 解析）。
 *
 * 命名 `JSON4` 是为避免 `import { JSON }` 遮蔽 JavaScript 内置 `JSON` 对象。
 *
 * ```javascript
 * import { JSON4 } from './parser/json/index.js';
 *
 * JSON4.parse('{"a":1}');
 * ```
 *
 * ---------------------------------------------------------------------------
 * JSON4.parse(input)
 * ---------------------------------------------------------------------------
 *
 * | 参数    | 类型   | 必填 | 说明 |
 * |---------|--------|------|------|
 * | `input` | string | 是   | 标准 JSON 字符串（RFC 8259 形态，非 `JSON.parse` 实现） |
 *
 * - **返回**：`unknown` — plain object、array、string、number、boolean 或 `null`
 * - **抛出**：`ParseError`（`language === 'json'`）
 *
 * @module json4
 */

import { parse } from './parse.js';

/**
 * 标准 JSON 产品线（ANTLR 解析）。命名 JSON4 避免与内置 `JSON` 冲突。
 * @type {{ parse: (input: string) => unknown }}
 */
export const JSON4 = {
  parse,
};
