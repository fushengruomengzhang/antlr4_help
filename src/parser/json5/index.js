/**
 * JSON5 产品线：validate / parse / format。
 *
 * ```javascript
 * import { JSON5, DEFAULT_FORMAT_OPTIONS } from './parser/json5/index.js';
 *
 * JSON5.validate('{ a: 1, }');
 * const obj = JSON5.parse('{ a: 1, }');
 * const text = JSON5.format('{ a: 1, }', { sortKeys: true });
 * ```
 *
 * ---------------------------------------------------------------------------
 * DEFAULT_FORMAT_OPTIONS（JSON5.format 默认选项）
 * ---------------------------------------------------------------------------
 *
 * ```javascript
 * {
 *   indent: { type: 'space', size: 2 },
 *   sortKeys: false,
 *   compact: false,
 * }
 * ```
 *
 * 传给 `JSON5.format(input, options)` 的字段均可选；未传则与上表合并。
 *
 * ---------------------------------------------------------------------------
 * JSON5.validate(input)
 * ---------------------------------------------------------------------------
 *
 * | 参数    | 类型   | 必填 | 说明 |
 * |---------|--------|------|------|
 * | `input` | string | 是   | 待校验的 JSON5 源字符串 |
 *
 * - **返回**：`void`（合法时无返回值）
 * - **抛出**：`ParseError`（词法/语法非法）
 * - **说明**：仅做词法+语法分析，不构建 JavaScript 值；适合快速校验或 LSP 场景。
 *
 * ---------------------------------------------------------------------------
 * JSON5.parse(input, options?)
 * ---------------------------------------------------------------------------
 *
 * | 参数      | 类型            | 必填 | 说明 |
 * |-----------|-----------------|------|------|
 * | `input`   | string          | 是   | 待解析的 JSON5 源字符串 |
 * | `options` | `ParseOptions`  | 否   | 解析选项，见下表 |
 *
 * **ParseOptions**
 *
 * | 字段       | 类型    | 默认    | 说明 |
 * |------------|---------|---------|------|
 * | `sortKeys` | boolean | `false` | 为 `true` 时对各 object（含嵌套）按 key 做 locale-aware 稳定排序；**不排序 array 元素**。算法与 `JSON5.format` 的 `sortKeys` 一致 |
 *
 * - **返回**：`unknown` — plain object、array、string、number、boolean 或 `null`
 * - **抛出**：`ParseError`（词法/语法非法）；`sortKeys` 非 boolean 时 `TypeError`
 * - **说明**：支持 JSON5 扩展（无引号 key、尾逗号、注释、Infinity/NaN、十六进制数字等）。
 *   **注释不会出现在返回结果中**；需保留注释请用 `JSON5.format`。
 *
 * ---------------------------------------------------------------------------
 * JSON5.format(input, options?)
 * ---------------------------------------------------------------------------
 *
 * | 参数      | 类型            | 必填 | 说明 |
 * |-----------|-----------------|------|------|
 * | `input`   | string          | 是   | 合法 JSON5 源字符串 |
 * | `options` | `FormatOptions` | 否   | 格式化选项，见下表 |
 *
 * **FormatOptions**
 *
 * | 字段       | 类型      | 默认 | 说明 |
 * |------------|-----------|------|------|
 * | `indent`   | object    | `{ type: 'space', size: 2 }` | 缩进配置 |
 * | `indent.type`  | `'space'` \| `'tab'` | `'space'` | 缩进字符类型 |
 * | `indent.size`  | number    | `2`  | 仅当 `type: 'space'` 时有效，空格个数 |
 * | `sortKeys` | boolean   | `false` | 为 `true` 时按 key 字典序稳定排序各 object 的 member；**不排序 array 元素** |
 * | `compact`  | boolean   | `false` | 为 `true` 时紧凑布局：容器头/行尾注释同行、member 间少空行；**保留源字符串 token 形态**（单引号、`'''` 等） |
 *
 * - **返回**：`string` — 格式化后的 JSON5 文本
 * - **行为要点**：
 *   - 默认（`compact: false`）：结构换行清晰；单行字符串 value 统一为双引号 `"..."`；三引号多行保留形态
 *   - `compact: true`：不强制双引号转换，保留输入中的字符串引号形态
 *   - 去掉 object/array 尾逗号；注释语义锚定于 member，随 `sortKeys` 移动
 *
 * @module json5
 */

import { validate } from './validate.js';
import { parse } from './parse.js';
import { format, DEFAULT_FORMAT_OPTIONS } from './format.js';

export { DEFAULT_FORMAT_OPTIONS };

/**
 * JSON5 产品线：validate / parse / format。
 * @type {{ validate: (input: string) => void, parse: (input: string, options?: import('./parse.js').ParseOptions) => unknown, format: (input: string, options?: import('./format.js').FormatOptions) => string }}
 */
export const JSON5 = {
  validate,
  parse,
  format,
};
