/**
 * ApiSchema 转换产品线：随机 id 与 Java8 → 字段树。
 *
 * ```javascript
 * import { API } from './parser/api/index.js';
 *
 * API.java8ToApiSchema(javaSource, { rootClass: 'User' });
 * API.snowflakeId();
 * ```
 *
 * ---------------------------------------------------------------------------
 * API.snowflakeId()
 * ---------------------------------------------------------------------------
 *
 * - **参数**：无
 * - **返回**：`string` — 进程内唯一的随机 id（基于 `crypto.randomUUID()`）
 * - **说明**：用于 ApiSchema 节点 `id`；非 Twitter Snowflake 位布局
 *
 * ---------------------------------------------------------------------------
 * API.java8ToApiSchema(inputs, options?)
 * ---------------------------------------------------------------------------
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
 * | `rootClass`  | string | 首个输入文件首个顶层类型名 | 作为展开根的顶层类简单名；找不到时抛出 `Error` |
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
 * @module api
 */

import { snowflakeId, java8ToApiSchema } from './java8/java8-to-api-schema.js';

/**
 * ApiSchema 转换产品线：随机 id 与 Java8 → 字段树。
 * @type {{ snowflakeId: () => string, java8ToApiSchema: (inputs: string | string[], options?: { rootClass?: string }) => import('./java8/java8-to-api-schema.js').ApiSchemaNode[] }}
 */
export const API = {
  snowflakeId,
  java8ToApiSchema,
};
