## Why

JSON5 的 `validate`、`parse`、`format` 当前通过 `value-visitor.js` 与 `format-emitter.js` 混用实现：`parse`/`validate` 与 `format` 的 AST 管线共享解码工具并交叉 import，改一侧容易牵动另一侧。上一版 AST format 重构已完成 Document AST 管线，但模块边界仍未按 API 职责拆分。现在需要将三个对外 API 拆成独立入口文件，并将 format 相关实现收敛到 `format/` 目录，使各 API 互不影响、对外签名不变。

## What Changes

- 新增顶层入口：`validate.js`、`parse.js`、`format.js`；`index.js` 仅聚合 re-export
- 将现有 AST 实现（`ast-builder`、`ast-transform`、`ast-emitter`、`ast-types`、`token-helpers`、`format-options`）移入 `src/parser/json5/format/` 目录
- `format.js` 编排两阶段管线：**解析 → Document AST**（`runParsePipeline` + `buildDocumentAst`），再 **format**（`transformAst` + `emitDocument`）
- `parse.js` 独立实现：CST visitor 路径，不 import `format/` 内任何模块
- `validate.js` 独立实现：仅 `runParsePipeline`，不构建值或 AST
- 删除 `value-visitor.js`、`format-emitter.js`
- `format/` 内自带 decode/key 工具（从 `value-visitor` 迁出副本），解除与 `parse.js` 的耦合
- 对外 API（`JSON5.validate` / `JSON5.parse` / `JSON5.format`、`DEFAULT_FORMAT_OPTIONS`）签名与文档化行为不变

## Capabilities

### New Capabilities

- `json5-module-layout`: JSON5 产品线模块布局与 API 隔离约束（三入口独立、format 目录归属、import 边界）

### Modified Capabilities

<!-- 无对外行为变更；format AST 语义沿用现有 json5-format-ast spec -->

## Impact

- **代码**：`src/parser/json5/` 目录重组；删除 2 个旧文件，新增 3 个 API 入口，移动 ~6 个文件至 `format/`
- **测试**：更新 import 路径；补充 parse/format 行为一致性 smoke 测试
- **对外 API**：无 breaking change
- **依赖**：仍使用 `../core/parse-pipeline.js` 与 grammars；三 API 之间无 import
