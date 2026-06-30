## Why

`src/index.js` 当前约 240 行，其中 ~190 行为 API 用法文档，且直接从 `parser/*/` 深层实现文件 import 并组装命名空间；`parser/core/` 被顶层直接引用（`ParseError`）。文档与实现分离、入口知晓过多内部路径，不利于维护与后续分包 lazy load。需在 **对外 API 形状不变** 前提下，为各产品线建立统一 public barrel，`index.js` 仅做 re-export，文档下沉至各包 export。

## What Changes

- 新增各产品线 public barrel：
  - `src/parser/json5/index.js` — export `JSON5`、`DEFAULT_FORMAT_OPTIONS` + JSON5 用法 JSDoc
  - `src/parser/json/index.js` — export `JSON4` + JSON4 用法 JSDoc
  - `src/parser/java8/index.js` — export `JAVA8` + Java8 用法 JSDoc
  - `src/parser/api/index.js` — export `API` + ApiSchema 用法 JSDoc
- `ParseError` 自 `core/` 提升至 `src/parser/parse-error.js`（公开契约，非 core 实现细节）；`core/parse-error.js` 改为 re-export 或更新内部 import
- `src/index.js` 瘦身为仅 re-export 上述模块 + `ParseError`；移除长篇用法文档
- `parser/core/` **不**新增 `index.js`，**不**被 `src/index.js` 直接 import
- **非 BREAKING**：`import { JSON5, JSON4, JAVA8, API, ParseError, DEFAULT_FORMAT_OPTIONS } from 'antlr4_help'` 对外形状与行为不变

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `project-structure`：各产品线 public barrel（`index.js`）约定；瘦 `src/index.js`；`ParseError` 公开路径；`core/` 不对外 export
- `api`：`API` 命名空间自 `src/parser/api/index.js` 定义并经 `src/index.js` re-export（行为不变）

## Impact

- **代码**：`src/index.js`、新建 4 个 package `index.js`、`parse-error.js` 路径调整、`core/parse-error.js` import 更新
- **文档**：JSDoc 从 `index.js` 迁移至各 package `index.js` 与 `parse-error.js`
- **测试**：`npm test` 全绿；对外 import 路径不变
- **API**：无行为变更；深路径 `parser/core/*` 本就不承诺为 public API
