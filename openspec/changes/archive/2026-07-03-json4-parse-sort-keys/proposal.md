## Why

`JSON4.parse` 目前仅接受输入字符串，返回的 plain object 保持源码 key 顺序。调用方若需要规范化 object key 顺序（例如与 `JSON5.format({ sortKeys: true })` 的语义对齐、便于快照对比或确定性遍历），必须自行后处理。在 parse 阶段提供可选的 `sortKeys` 开关，可用与 JSON5 format 相同的 `localeCompare` 稳定排序算法，在构建 JS 值时一次性完成，避免重复逻辑。

## What Changes

- `JSON4.parse` 扩展为 `parse(input, options?)`，新增可选 `sortKeys: boolean`（默认 `false`）
- 当 `sortKeys: true` 时，对每个 object（含嵌套）按 key 做 locale-aware 稳定排序后重建 `Object.create(null)`；**不排序 array 元素**
- 排序算法与 `JSON5.format` 的 `sortKeys` 一致：`keyA.localeCompare(keyB) || originalIndex`
- 更新 `src/parser/json/index.js` 模块文档与类型说明
- 在 `test/run.mjs` 增加 JSON4 parse + `sortKeys` 断言用例
- 无 **BREAKING** 变更：省略 `options` 或 `sortKeys: false` 时行为与现有一致

## Capabilities

### New Capabilities

- `json4-parse-sort-keys`：`JSON4.parse` 的可选 `sortKeys` 选项及其 object key 稳定 locale 排序语义

### Modified Capabilities

（无）

## Impact

- `src/parser/json/value-visitor.js` — `visitObj` / `parse` 接收并传递 options；`sortKeys` 时在 visit 阶段排序 pairs
- `src/parser/json/index.js` — 公开 API 文档与 `JSON4.parse` 签名
- `test/run.mjs` — 新增 sortKeys 相关 case
- 不影响 JSON5 / JAVA8 / API 产品线；不修改 ANTLR grammar 或生成代码
