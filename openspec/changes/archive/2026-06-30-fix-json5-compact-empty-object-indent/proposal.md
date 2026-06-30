## Why

`JSON5.format` 在 `compact: true` 且自定义 `indent.size`（如 4）时，**空 object/array** 的闭合括号缩进仍来自源码 HIDDEN 通道中的 `\n  `，未按 `indentUnit(depth)` 重算，导致与 sibling member 行缩进不一致（如 `test/resources/source.json5` 中 `"user": { // ...` 与 `},` 不对齐）。这是 compact 布局 bug，影响大嵌套 schema 的可读性。

## What Changes

- 修复 `format-emitter.js` 中 `formatObjectCompact` / `formatArrayCompact` 的 **空容器** 分支：过滤 `{`/`[` 后 hidden 中含换行的 layout whitespace，闭合括号改用 `beginCloseLine` + `indentUnit(depth)`
- 保留空容器开括号后的 **inline 头注释**（`{ // comment`）锚定行为
- 新增集成测试用例（最小复现 + 可选 `source.json5` 片段断言）
- 更新 `json5-api` spec：明确 compact 空容器缩进须遵循 `indent` 配置

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `json5-api`：`JSON5 format compact 模式` — 补充空 object/array 闭合缩进须按 `indent` 重算，不得沿用源码 layout whitespace
- `integration-tests`：新增 compact 空容器缩进回归用例

## Impact

- **代码**：`src/parser/json5/format-emitter.js`（`formatObjectCompact`、`formatArrayCompact` 空分支；可能抽取 shared helper）
- **测试**：`test/resources/cases/` 新 fixture、`test/run.mjs` 注册
- **API**：非 BREAKING；`JSON5.format` 输出在 compact + 空容器场景下缩进修正
