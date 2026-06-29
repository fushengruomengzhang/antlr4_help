## Why

`toApiSchema` 与 `snowflakeId` 当前与 Java8 解析代码混在 `src/parser/java8/` 下，对外挂在 `java8` 命名空间，语义上却是「Model → ApiSchema 业务转换」而非语法解析。随着 `java8ToJson5` 等后续转换能力规划，需要将 **解析层**（grammar → FileModel）与 **API 转换层**（FileModel → ApiSchema → JSON5）分离，并统一对外 `api` 命名空间。

## What Changes

- 新增 `src/parser/api/` 目录（与 `java8/` 同级），迁入 toApiSchema 相关实现模块
- 将 `snowflake-id.js` 从 `src/parser/core/` 迁入 `src/parser/api/`
- **BREAKING**：移除 `java8.toApiSchema` 与顶层 `snowflakeId` export
- **BREAKING**：新增 `api` 命名空间，导出 `api.java8ToApiSchema` 与 `api.snowflakeId`
- 函数行为（输入/输出、继承合并、环检测等）保持不变；错误消息前缀改为 `java8ToApiSchema:`
- 更新集成测试、README 与 OpenSpec 主 spec（能力拆分：`java8-api` → `api`）

## Capabilities

### New Capabilities

- `api`: ApiSchema 转换产品线——`snowflakeId`、`java8ToApiSchema` 及全部 toApiSchema 行为要求（自 `java8-api` 迁出）

### Modified Capabilities

- `project-structure`: 新增 `src/parser/api/` 目录布局；`src/index.js` 导出 `api` 命名空间
- `java8-api`: 移除 `snowflakeId` 与全部 `Java8 toApiSchema *` requirements（保留 signatures / firstClassName）
- `integration-tests`: 测试用例改为调用 `api.java8ToApiSchema`；移除对顶层 `snowflakeId` 的引用

## Impact

- **代码**：`src/parser/java8/to-api-schema.js`、`effective-fields.js`、`type-to-parsed.js`、`base-type-map.js` 迁至 `src/parser/api/java8/`；`src/parser/core/snowflake-id.js` → `src/parser/api/snowflake-id.js`；`src/index.js` 重组 export
- **API**：**BREAKING** v2.3.0——消费者须 `import { api }` 并使用 `api.java8ToApiSchema` / `api.snowflakeId`
- **测试**：`test/run.mjs` case 名与调用路径更新；golden 结构不变
- **文档**：`README.md` 示例更新
- **依赖**：`api` 层依赖 `java8`（signatures、firstClassName、models），单向无环
