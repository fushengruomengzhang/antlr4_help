## Why

`JSON5.format`（`src/parser/json5/format-emitter.js`）在大对象（如 2000 keys sort+compact）上性能差（~18ms/op），主因是 emit 路径 O(n²) 字符串拼接与 HIDDEN token 考古。现有 json5 grammar 面向 value 语义，format 是 document 问题。需要一条 **完全独立** 的 fast format 产品线：独立 g4、独立 parser 目录、新对外导出，且 **不 import `src/parser/json5/` 或 `src/grammars/json5/` 内任何模块**。旧 `JSON5.format` 永久保留作对照。

## What Changes

- 新增 `src/grammars/json5-format/`：`Json5FormatLexer.g4`、`Json5FormatParser.g4`（独立词法/语法，含三引号 mode 规则）
- 新增 `src/parser/json5-format/`：document build → transform → **高效 emit** 管线
- 新导出 `JSON5Format.format(input, options?)`；根 `src/index.js` 增加 `JSON5Format`
- `scripts/generate.sh` 增加 json5-format 生成目标
- **不修改** `JSON5.format`、`src/parser/json5/*` 行为与代码
- **禁止** json5-format 代码 import json5 模块（允许 `src/parser/core/*`）

## Capabilities

### New Capabilities

- `json5-format-standalone`: 独立 json5-format grammar、parser 管线、JSON5Format 导出、性能与三引号 format 语义

### Modified Capabilities

<!-- 无现有 spec 行为变更；JSON5.format 不变 -->

## Impact

- **新增**：grammars/json5-format、parser/json5-format、测试与 bench
- **不变**：JSON5.validate / JSON5.parse / JSON5.format
- **依赖**：仍用 antlr4 npm runtime 与 core parse-pipeline
