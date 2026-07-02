## Why

`JSON5.format` 仍由 850 行的 `format-emitter.js` 在 emit 阶段通过 HIDDEN token 考古分配注释（含 `isNextMemberPurePrefix` 等 sort 启发式），与主 spec `json5-format-ast` 描述的三阶段 AST pipeline 不一致，且维护成本高。删除 JSON5Format 双栈后，应在对现有 `Json5Parser.g4` **零改动** 前提下，实现 spec 已有的 build → transform → emit，并顺带落地 `json5-module-layout` 中 deferred 的 format 目录拆分。

## What Changes

- 新增 `src/parser/json5/format/`：`ast-builder.js`、`ast-transform.js`、`emit.js`、`format-options.js`、`types.js` 等
- 新增 `format.js` 编排 pipeline；拆分 `validate.js`、`parse.js`（自 `value-visitor.js` 迁移）
- **删除** `format-emitter.js` 及 emit 阶段 comment 考古逻辑
- build 阶段在**源码顺序**下用 g4 `COMMA(i)` + HIDDEN 通道一次填满 `ObjectEntry` 槽位；`sortKeys` 在 transform 阶段排序整 entry
- 不改 `Json5Lexer.g4` / `Json5Parser.g4`；不改 `JSON5.validate` / `JSON5.parse` / `JSON5.format` 公共 API
- 全量回归 `npm test` 与 `expected/json5/` baseline（允许 cosmetic WS 差异时需 update-expected）

## Capabilities

### New Capabilities

（无 — 行为要求已在主 spec 中定义）

### Modified Capabilities

- `json5-format-ast`: 补充「单 grammar build 阶段分配 comment、emit 禁止 re-derive」的显式要求（实现与 spec 对齐）
- `json5-module-layout`: 落地 format 目录与三 API 模块拆分（requirements 已存在，本次为 implementation）

## Impact

- **重构**：`src/parser/json5/`（format-emitter → format/ pipeline）
- **不变**：`grammars/json5/`、对外 export、`JSON5.parse` 不构建 Document AST
- **测试**：现有 case + expected baseline 为契约；可选新增 ast-builder 单测
- **删除**：`format-emitter.js`；`value-visitor.js` 职责迁入 validate/parse + shared decode
