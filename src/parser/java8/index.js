/**
 * Java8 源文件解析产品线：首个类名与结构化签名树。
 *
 * 输入 MUST 为完整 `.java` 文件字符串，Parser 入口为 `compilationUnit`。
 *
 * ```javascript
 * import { JAVA8 } from './parser/java8/index.js';
 *
 * JAVA8.firstClassName('public class Foo {}');
 * JAVA8.signatures(javaSource);
 * ```
 *
 * ---------------------------------------------------------------------------
 * JAVA8.firstClassName(input)
 * ---------------------------------------------------------------------------
 *
 * | 参数    | 类型   | 必填 | 说明 |
 * |---------|--------|------|------|
 * | `input` | string | 是   | 完整 Java 源文件 |
 *
 * - **返回**：`string | null` — 源码中第一个顶层具名类型（class/interface/enum/@interface）的简单名；无类型声明时 `null`
 * - **说明**：完整 `compilationUnit` parse；body 语法非法时抛出 `ParseError`
 *
 * ---------------------------------------------------------------------------
 * JAVA8.peekFirstClassName(input)
 * ---------------------------------------------------------------------------
 *
 * | 参数    | 类型   | 必填 | 说明 |
 * |---------|--------|------|------|
 * | `input` | string | 是   | 完整 Java 源文件 |
 *
 * - **返回**：`string | null` — 与 `firstClassName` 相同的取名规则
 * - **说明**：parse 至首个顶层类型 body 入口即终止，不验证 body；body 语法非法时仍可能返回类名；需 strict 校验时用 `firstClassName`
 *
 * ---------------------------------------------------------------------------
 * JAVA8.signatures(input)
 * ---------------------------------------------------------------------------
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
 * @module java8
 */

import { firstClassName } from './first-class-name.js';
import { peekFirstClassName } from './peek-first-class-name.js';
import { signatures } from './signatures.js';

/**
 * Java8 源文件解析产品线：首个类名与结构化签名树。
 * @type {{ firstClassName: (input: string) => (string | null), peekFirstClassName: (input: string) => (string | null), signatures: (input: string) => import('./models.js').FileModel }}
 */
export const JAVA8 = {
  firstClassName,
  peekFirstClassName,
  signatures,
};
