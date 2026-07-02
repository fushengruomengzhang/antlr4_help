## Why

JSON5Format 当前使用 value-oriented parser + HIDDEN channel 注释「考古」构建 Document AST，导致注释归属启发式复杂、重复/错位 bug 频发。注释在语义上是一等公民（format 必须保留并精确定位），应在 grammar / parse tree 层显式建模。

## What Changes

- **BREAKING（内部）**：`Json5FormatLexer.g4` 将 `LINE_COMMENT` / `BLOCK_COMMENT` 移出 HIDDEN channel
- **BREAKING（内部）**：`Json5FormatParser.g4` 重写为 document grammar（`layout*` 嵌入 object/array/document）
- 重写 `build-document.js`：parse tree visitor，不再 `getHiddenTokens` 考古分配注释
- 简化 `transform.js` / `emit.js`：member 作为 unit 移动，按 AST slot 直出
- 删除或极简化 `token-helpers.js` 考古逻辑
- 保留 `JSON5Format.format` 公共 API、`JSON5.format` 不变

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `json5-format-standalone`: build 必须从 parse tree layout 节点获取注释，禁止 HIDDEN 考古分配 comment ownership

## Impact

- `src/grammars/json5-format/*.g4` + regenerated JS
- `src/parser/json5-format/build-document.js`（重写）
- `src/parser/json5-format/emit.js`, `transform.js`（调整）
- `test/json5-format-*.mjs`（加强对照）
- supersede `json5-format-fix-output` 的 patch 路线
