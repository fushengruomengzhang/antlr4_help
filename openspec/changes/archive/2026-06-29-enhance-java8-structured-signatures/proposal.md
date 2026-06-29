## Why

当前 `java8.signatures()` 返回的 FileModel 以 `getText()` 扁平字符串为主：注解与修饰符混在 `modifiers` 里，类型与泛型是整段文本，方法参数靠正则抠括号。下游无法可靠消费注解 key/value、嵌套泛型（`List<Map<String, T>>`）或参数级注解。需要将签名模型升级为结构化 AST，与 Java8 grammar 节点一一对应，便于代码生成、文档与静态分析。

## What Changes

- **BREAKING**：重写 `FileModel` / `TypeModel` / `MemberModel` 数据结构，移除扁平字段（`type`、`returnType`、`params`、`throws`、`signature`、`names`、字符串版 `extends`/`implements`/`typeParameters`）
- 新增结构化 **AnnotationModel**（marker → 空 `attributes`；单值注解默认 key 为 `value`；normal 注解拆 key/value）
- 新增结构化 **TypeSignature**（递归描述 class/primitive/typeVariable/array/wildcard 及 `typeArguments`）
- 新增结构化 **TypeParameterModel**（含 `extends` bound 与 `&` 交叉 bound）
- 字段改用 **declarators**（`{ name, defaultValue? }`），浅解析字面量 initializer；`@interface` 元素提取 `defaultValue`
- 方法/构造器结构化 **parameters**（含参数注解、类型、varargs），方法头含 `typeParameters`、`throwsTypes`；仍不进入方法体
- 类型级 `extendsType` / `implementsTypes` 改为 `TypeSignature`
- 注解 `elementValue` 浅解析：字面量 + 嵌套注解 + 数组字面量；复杂表达式不深入
- 更新集成测试 golden 文件 `test/resources/out/test.java.signatures.json`

## Capabilities

### New Capabilities

（无 — 本 change 在现有 java8-api 能力上增强模型，不引入新 capability 名称。）

### Modified Capabilities

- `java8-api`：签名提取返回结构化模型；注解、类型、泛型、方法参数、默认值、typeParameters 均有明确 schema；移除旧扁平字段（breaking change）

## Impact

- **代码**：`src/parser/java8/models.js`、`signature-visitor.js`；新增 `type-parser.js`、`annotation-parser.js`（或等价模块）
- **API**：`java8.signatures()` 返回形状 **breaking change**；`java8.firstClassName()` 不变
- **测试**：`test/resources/out/test.java.signatures.json` 整体重写；`test/run.mjs` 无需改入口
- **依赖 / grammar**：无新 npm 依赖；`.g4` 不变，仅 visitor 层重构
