## Why

`JSON5.parse` 目前仅接受输入字符串，返回的 object 保持源码 member 顺序。调用方若需要与 `JSON5.format({ sortKeys: true })` 对齐的确定性 key 顺序（快照对比、稳定遍历），必须自行后处理。在 parse 阶段提供可选 `sortKeys`，可用与 format 相同的 `localeCompare` 稳定排序，在 CST visitor 构建 JS 值时一次性完成。

## What Changes

- `JSON5.parse` 扩展为 `parse(input, options?)`，新增可选 `sortKeys: boolean`（默认 `false`）
- `sortKeys: true` 时递归对每个 object 的 key 做 locale-aware 稳定排序；**不排序 array 元素**
- 排序算法与 `JSON5.format` transform 一致：`keyA.localeCompare(keyB) || originalIndex`；key 字符串来自现有 `keyToString`
- 更新 `src/parser/json5/index.js` 与 `parse.js` 文档
- 更新 `json5-module-layout` delta：允许 `JSON5.parse` 可选第二参数
- 在 `test/run.mjs` 增加 JSON5 parse + `sortKeys` 用例
- 无 **BREAKING** 变更：省略 `options` 或 `sortKeys: false` 时行为与现有一致

## Capabilities

### New Capabilities

- `json5-parse-sort-keys`：`JSON5.parse` 的可选 `sortKeys` 选项及 object key 稳定 locale 排序语义

### Modified Capabilities

- `json5-module-layout`：允许 `JSON5.parse(input, options?)`；`options` 仅含 `sortKeys`

## Impact

- `src/parser/json5/parse.js` — `visitObject` / `visitValue` / `parse` 传递 options；sortKeys 时在 visit 阶段排序 pairs
- `src/parser/json5/index.js` — 公开 API 文档
- `openspec/specs/json5-module-layout/spec.md` — parse 签名 delta（archive 时同步）
- `test/run.mjs` — 新增 sortKeys 相关 case
- 不影响 format/validate 模块边界；不修改 ANTLR grammar
