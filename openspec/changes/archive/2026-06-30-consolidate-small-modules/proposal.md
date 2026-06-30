## Why

`refactor-package-public-exports` 已建立各产品线 `index.js` barrel，但 `src/parser/` 仍有多处「一行 re-export」或「单函数薄 wrapper」文件（如 `json/string-utils.js` 仅 1 行、`json/parse.js` / `json5/validate.js` / `java8/signatures.js` 等 ~15–22 行 pipeline 模板）。文件过多增加导航成本，且相关逻辑分散。需在 **对外 API 与行为不变** 前提下，将小文件合并进相邻职责模块，保留各包 `index.js` barrel 与大模块边界。

## What Changes

- **删除** `src/parser/json/string-utils.js`（1 行 re-export）；JSON4/JSON5 visitor 直引 `core/string-decode.js`
- **合并 core 小文件** 入 `parse-pipeline.js`：`error-listener.js`、`visit-helpers.js`；`ParseError` 实现迁至 `src/parser/parse-error.js`，删除 `core/parse-error.js`
- **合并 JSON4 薄 wrapper**：`json/parse.js` → `json/value-visitor.js`
- **合并 JSON5 薄 wrapper**：`validate.js`、`parse.js` → `json5/value-visitor.js`；`format.js` → `json5/format-emitter.js`
- **合并 Java8 薄 wrapper**：`first-class-name.js`、`signatures.js` → `java8/signature-visitor.js`（共用 `runCompilationUnit` helper）
- **合并 API 小文件**：`api/snowflake-id.js` → `api/index.js`
- 更新各 `index.js` import 路径；**非 BREAKING**：`src/index.js` 对外 export 形状不变

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `project-structure`：运行时模块文件布局（删除/合并上述小文件；core 文件列表更新）
- `core-utilities`：`visit-helpers` / `error-listener` 并入 `parse-pipeline.js`；移除 `string-utils` re-export 要求；`ParseError` 公开路径保留于 `parser/parse-error.js`

## Impact

- **代码**：删除 ~10 个小文件；`parse-pipeline.js`、`value-visitor.js`、`format-emitter.js`、`signature-visitor.js`、`api/index.js` 略增行数
- **测试**：`npm test` 全绿作为回归门禁
- **API**：无行为变更；深路径 import 本不承诺
