/**
 * antlr4_help 统一入口
 *
 * 基于 ANTLR 4.9.3 的 Node.js (ESM) 解析库，对外暴露四条产品线命名空间：
 * `JSON5`、`JSON4`、`JAVA8`、`API`，以及公共类型 `ParseError` 与常量 `DEFAULT_FORMAT_OPTIONS`。
 *
 * ---------------------------------------------------------------------------
 * 快速开始
 * ---------------------------------------------------------------------------
 *
 * ```javascript
 * import { JSON5, JSON4, JAVA8, API, ParseError, DEFAULT_FORMAT_OPTIONS } from './src/index.js';
 *
 * JSON5.validate('{ a: 1, }');
 * const obj = JSON5.parse('{ a: 1, }');
 * const text = JSON5.format('{ a: 1, }', { sortKeys: true });
 *
 * JSON4.parse('{"a":1}');
 *
 * JAVA8.firstClassName('public class Foo {}');
 * JAVA8.signatures(javaSource);
 *
 * API.java8ToApiSchema(javaSource, { rootClass: 'User' });
 * API.snowflakeId();
 * ```
 *
 * ---------------------------------------------------------------------------
 * ParseError（语法/词法错误）
 * ---------------------------------------------------------------------------
 *
 * 所有解析失败统一抛出 `ParseError`（继承 `Error`），字段：
 *
 * | 字段       | 类型     | 说明 |
 * |------------|----------|------|
 * | `language` | string   | 诊断用语言 id：`'json5'` \| `'json'` \| `'java8'`（小写，与命名空间名无关） |
 * | `line`     | number   | 出错行号，**从 1 开始** |
 * | `column`   | number   | 出错列号，**从 0 开始**（与 ANTLR `charPositionInLine` 一致） |
 * | `message`  | string   | 人类可读错误描述 |
 *
 * `JSON5.validate` 合法时不返回值；非法时抛出 `ParseError`。
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
 * JSON5
 * ---------------------------------------------------------------------------
 *
 * ### JSON5.validate(input)
 *
 * | 参数    | 类型   | 必填 | 说明 |
 * |---------|--------|------|------|
 * | `input` | string | 是   | 待校验的 JSON5 源字符串 |
 *
 * - **返回**：`void`（合法时无返回值）
 * - **抛出**：`ParseError`（词法/语法非法）
 * - **说明**：仅做词法+语法分析，不构建 JavaScript 值；适合快速校验或 LSP 场景。
 *
 * ### JSON5.parse(input)
 *
 * | 参数    | 类型   | 必填 | 说明 |
 * |---------|--------|------|------|
 * | `input` | string | 是   | 待解析的 JSON5 源字符串 |
 *
 * - **返回**：`unknown` — plain object、array、string、number、boolean 或 `null`
 * - **说明**：支持 JSON5 扩展（无引号 key、尾逗号、注释、Infinity/NaN、十六进制数字等）。
 *   **注释不会出现在返回结果中**；需保留注释请用 `JSON5.format`。
 *
 * ### JSON5.format(input, options?)
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
 * ---------------------------------------------------------------------------
 * JSON4（标准 JSON，100% ANTLR 解析）
 * ---------------------------------------------------------------------------
 *
 * 命名 `JSON4` 是为避免 `import { JSON }` 遮蔽 JavaScript 内置 `JSON` 对象。
 *
 * ### JSON4.parse(input)
 *
 * | 参数    | 类型   | 必填 | 说明 |
 * |---------|--------|------|------|
 * | `input` | string | 是   | 标准 JSON 字符串（RFC 8259 形态，非 `JSON.parse` 实现） |
 *
 * - **返回**：`unknown` — plain object、array、string、number、boolean 或 `null`
 * - **抛出**：`ParseError`（`language === 'json'`）
 *
 * ---------------------------------------------------------------------------
 * JAVA8（完整 Java 源文件解析）
 * ---------------------------------------------------------------------------
 *
 * 输入 MUST 为完整 `.java` 文件字符串，Parser 入口为 `compilationUnit`。
 *
 * ### JAVA8.firstClassName(input)
 *
 * | 参数    | 类型   | 必填 | 说明 |
 * |---------|--------|------|------|
 * | `input` | string | 是   | 完整 Java 源文件 |
 *
 * - **返回**：`string | null` — 源码中第一个顶层具名类型（class/interface/enum/@interface）的简单名；无类型声明时 `null`
 * - **说明**：完整 `compilationUnit` parse；body 语法非法时抛出 `ParseError`
 *
 * ### JAVA8.peekFirstClassName(input)
 *
 * | 参数    | 类型   | 必填 | 说明 |
 * |---------|--------|------|------|
 * | `input` | string | 是   | 完整 Java 源文件 |
 *
 * - **返回**：`string | null` — 与 `firstClassName` 相同的取名规则
 * - **说明**：parse 至首个顶层类型 body 入口即终止，不验证 body；body 语法非法时仍可能返回类名；需 strict 校验时用 `firstClassName`
 *
 * ### JAVA8.signatures(input)
 *
 * | 参数    | 类型   | 必填 | 说明 |
 * |---------|--------|------|------|
 * | `input` | string | 是   | 完整 Java 源文件 |
 *
 * - **返回**：`FileModel` — `{ types: TypeModel[] }`
 * - **TypeModel 主要字段**：`kind`、`name`、`annotations`（`Record<string, AnnotationAttrs>`）、
 *   `modifiers`、`typeParameters`、`extendsType`、`implementsTypes`、`ownMembers`（仅自身成员，不含继承）、
 *   `nestedTypes`
 * - **说明**：结构化 AST，注解为 Record 便于 O(1) 查询；method/field 等含结构化 `TypeSignature`
 *
 * ---------------------------------------------------------------------------
 * API（Model → ApiSchema 转换）
 * ---------------------------------------------------------------------------
 *
 * ### API.snowflakeId()
 *
 * - **参数**：无
 * - **返回**：`string` — 进程内唯一的随机 id（基于 `crypto.randomUUID()`）
 * - **说明**：用于 ApiSchema 节点 `id`；非 Twitter Snowflake 位布局
 *
 * ### API.java8ToApiSchema(inputs, options?)
 *
 * 将含 Swagger `@ApiModel` / `@ApiModelProperty` 的 Java Model 类展开为 ApiSchema 字段树。
 *
 * | 参数      | 类型                      | 必填 | 说明 |
 * |-----------|---------------------------|------|------|
 * | `inputs`  | `string` \| `string[]`    | 是   | 单个或多个 Java 源文件字符串；多文件时按类型简单名合并 class 索引，同名后者覆盖 |
 * | `options` | `{ rootClass?: string }`  | 否   | 见下表 |
 *
 * **options**
 *
 * | 字段         | 类型   | 默认 | 说明 |
 * |--------------|--------|------|------|
 * | `rootClass`  | string | 首个输入文件的 `JAVA8.firstClassName()` | 作为展开根的顶层类简单名；找不到时抛出 `Error` |
 *
 * - **返回**：`ApiSchemaNode[]` — 根类字段展开后的节点数组（仅 `field` 成员，不含 method）
 * - **ApiSchemaNode 字段**：
 *   - `id`：`string`，`API.snowflakeId()` 生成
 *   - `parentId`：根层为 `0`，子层为父节点 `id`
 *   - `type`：API 类型字符串（如 `String`、`Number`、`List`、`Object`）
 *   - `check`：`@ApiModelProperty.required === true` 时为 `true`，否则 `false`
 *   - `key`：字段名（List/Map 模板节点省略）
 *   - `desc`：可选，优先取 `@ApiModelProperty` 的 value
 *   - `index`：List/Map 内层模板为 `0`
 *   - `children`：可选嵌套子节点
 * - **说明**：继承 field 合并、List/Map 展开、循环引用回边检测；`nestedTypes` 不参与 class 索引
 *
 * @module antlr4_help
 */

import { ParseError } from './parser/core/parse-error.js';
import { parse as jsonParse } from './parser/json/parse.js';
import { validate as json5Validate } from './parser/json5/validate.js';
import { parse as json5Parse } from './parser/json5/parse.js';
import { format as json5Format, DEFAULT_FORMAT_OPTIONS } from './parser/json5/format.js';
import { snowflakeId } from './parser/api/snowflake-id.js';
import { java8ToApiSchema } from './parser/api/java8/java8-to-api-schema.js';
import { firstClassName } from './parser/java8/first-class-name.js';
import { peekFirstClassName } from './parser/java8/peek-first-class-name.js';
import { signatures } from './parser/java8/signatures.js';

/** @see 模块顶部文档 — ParseError */
export { ParseError, DEFAULT_FORMAT_OPTIONS };

/**
 * JSON5 产品线：validate / parse / format。
 * @type {{ validate: (input: string) => void, parse: (input: string) => unknown, format: (input: string, options?: import('./parser/json5/format-emitter.js').FormatOptions) => string }}
 */
export const JSON5 = {
  validate: json5Validate,
  parse: json5Parse,
  format: json5Format,
};

/**
 * 标准 JSON 产品线（ANTLR 解析）。命名 JSON4 避免与内置 `JSON` 冲突。
 * @type {{ parse: (input: string) => unknown }}
 */
export const JSON4 = {
  parse: jsonParse,
};

/**
 * Java8 源文件解析产品线：首个类名与结构化签名树。
 * @type {{ firstClassName: (input: string) => (string | null), peekFirstClassName: (input: string) => (string | null), signatures: (input: string) => import('./parser/java8/models.js').FileModel }}
 */
export const JAVA8 = {
  firstClassName,
  peekFirstClassName,
  signatures,
};

/**
 * ApiSchema 转换产品线：随机 id 与 Java8 → 字段树。
 * @type {{ snowflakeId: () => string, java8ToApiSchema: (inputs: string | string[], options?: { rootClass?: string }) => import('./parser/api/java8/java8-to-api-schema.js').ApiSchemaNode[] }}
 */
export const API = {
  snowflakeId,
  java8ToApiSchema,
};
