/**
 * 标准 JSON 产品线（100% ANTLR 解析）。
 *
 * 命名 `JSON4` 是为避免 `import { JSON }` 遮蔽 JavaScript 内置 `JSON` 对象。
 *
 * ```javascript
 * import { JSON4 } from './parser/json/index.js';
 *
 * JSON4.parse('{"a":1}');
 * JSON4.parse('{"b":1,"a":2}', { sortKeys: true });
 * ```
 *
 * ---------------------------------------------------------------------------
 * JSON4.parse(input, options?)
 * ---------------------------------------------------------------------------
 *
 * | 参数      | 类型            | 必填 | 说明 |
 * |-----------|-----------------|------|------|
 * | `input`   | string          | 是   | 标准 JSON 字符串（RFC 8259 形态，非 `JSON.parse` 实现） |
 * | `options` | `ParseOptions`  | 否   | 解析选项，见下表 |
 *
 * **ParseOptions**
 *
 * | 字段       | 类型    | 默认    | 说明 |
 * |------------|---------|---------|------|
 * | `sortKeys` | boolean | `false` | 为 `true` 时对各 object（含嵌套）按 key 做 locale-aware 稳定排序；**不排序 array 元素**。算法与 `JSON5.format` 的 `sortKeys` 一致 |
 *
 * - **返回**：`unknown` — plain object、array、string、number、boolean 或 `null`
 * - **抛出**：`ParseError`（`language === 'json'`）；`sortKeys` 非 boolean 时 `TypeError`
 *
 * @module json4
 */

import { parse } from './value-visitor.js';

/**
 * 标准 JSON 产品线（ANTLR 解析）。命名 JSON4 避免与内置 `JSON` 冲突。
 * @type {{ parse: (input: string, options?: import('./value-visitor.js').ParseOptions) => unknown }}
 */
export const JSON4 = {
  parse,
};
