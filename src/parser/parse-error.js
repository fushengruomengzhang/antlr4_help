/**
 * 语法/词法解析失败时抛出的统一异常（继承 `Error`）。
 *
 * 所有解析失败统一抛出 `ParseError`，字段：
 *
 * | 字段       | 类型     | 说明 |
 * |------------|----------|------|
 * | `language` | string   | 诊断用语言 id：`'json5'` \| `'json'` \| `'java8'`（小写，与命名空间名无关） |
 * | `line`     | number   | 出错行号，**从 1 开始** |
 * | `column`   | number   | 出错列号，**从 0 开始**（与 ANTLR `charPositionInLine` 一致） |
 * | `message`  | string   | 人类可读错误描述 |
 *
 * @module parse-error
 */

export { ParseError } from './core/parse-error.js';
