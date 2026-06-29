## Why

项目已有 `java8.signatures()` 将 Java 源文件解析为结构化 `FileModel` AST，但缺少将 AST 转为 API 参数/字段树（`api.json` 形态）的能力。该转换是接口文档与参数编辑场景的核心步骤；需要在不改动 ANTLR grammar 的前提下，基于现有 AST 提供稳定、可测试的公开 API。

## What Changes

- 新增 `snowflakeId()`：每次调用返回随机唯一字符串（方法名保留，非 Twitter Snowflake 位运算算法）
- 新增 `java8.toApiSchema(inputs, options?)`：接受单个或多个 Java 源字符串，合并顶层类型索引，将指定根类的字段递归展开为 API Schema 节点数组
- 新增 TypeSignature → 内部 parsed 类型的适配层，以及 `baseTypeMap` 基础类型映射（与既有伪代码保持一致）
- 使用 path 栈进行循环引用检测（A↔B 互引时停止展开，返回叶子 Object）
- 在 `src/index.js` 导出 `java8.toApiSchema` 与 `snowflakeId`
- 集成测试新增 `toApiSchema` case；结构 golden 不含 id 字段（id 随机）

## Capabilities

### New Capabilities

（无 — 本 change 仅扩展现有能力）

### Modified Capabilities

- `java8-api`: 新增 `toApiSchema`、`snowflakeId` 及相关类型映射、环检测、多文件合并要求
- `integration-tests`: 新增 `java8.toApiSchema` fixture 覆盖与结构断言策略

## Impact

- **代码**: `src/parser/core/snowflake-id.js`、`src/parser/java8/` 下新增 to-api-schema 相关模块、`src/index.js`
- **API**: `java8` 命名空间新增 `toApiSchema`；顶层 export `snowflakeId`
- **测试**: `test/run.mjs`、`test/resources/golden/`（结构 golden）
- **依赖**: 无新 npm 依赖
- **兼容性**: 非 BREAKING；现有 `signatures` / `firstClassName` 不变
