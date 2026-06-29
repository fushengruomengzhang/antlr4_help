## Why

结构化签名 AST（`enhance-java8-structured-signatures`）已能准确描述 Java 类型信息，但消费时仍需 `.find()` 遍历注解数组、`declarators[0].name` 访问字段名，查询路径长、不符合常见用法（按注解名、字段名 O(1) 取值）。需要在保持 TypeSignature 等语义不变的前提下，优化 AST 形态以提升可用性。

## What Changes

- **BREAKING**：`annotations` 从 `AnnotationModel[]`（`{ name, attributes }`）改为 `Record<string, AnnotationAttrs>`，key 为注解简单名，value 为属性对象；无注解时为 `{}`
- **BREAKING**：字段 member 使用顶层 `name` + 可选 `defaultValue`，移除 `declarators[]`；同一 `fieldDeclaration` 含多个 variableDeclarator 时拆成多条 field member（共享 type/annotations/modifiers）
- **BREAKING**：接口常量（interfaceConstant）同样按 declarator 拆分为多条 member
- 参数 `parameters` 保持数组（保序）；`parameter.annotations` 同步改为 Record
- `modifiers` 保持 `string[]`；`TypeSignature`、`typeParameters` 数组等不变
- 假定同一元素上不存在同名注解重复（不处理 `@Repeatable` 多实例）
- 更新 golden `test/resources/out/test.java.signatures.json`

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `java8-api`：注解 Map 形态、字段 name 扁平化、多 declarator 拆分规则；更新相关 requirement 与 scenario

## Impact

- **代码**：`src/parser/java8/models.js`、`annotation-parser.js`、`signature-visitor.js`（组装层为主）
- **API**：`java8.signatures()` 返回形状 **breaking change**
- **测试**：golden JSON 重写
- **grammar / 依赖**：无变更
