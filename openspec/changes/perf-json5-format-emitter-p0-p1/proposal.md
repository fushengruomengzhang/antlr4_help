## Why

v2.5.0 已稳定 JSON5 `sortKeys + compact` 输出语义，但 `format-emitter.js`（~705 行）在 sort 路径存在可测量的重复开销：`tokens.fill()` 多次调用、`sourceMembers.indexOf` O(n²)、sort 比较器重复 `keySortString`、深层 `out +=` 拼接。benchmark 显示 500 key flat object 的 sort+compact 比 compact 慢 ~30%，大 object 场景有优化空间。本 change 在 **输出 byte-equal** 前提下做 P0/P1 性能优化，并为热路径方法补充中文注释。

## What Changes

- **P0**：`ensureTokensFilled`（构造期一次 fill）；`memberIdx` Map 消除重复 `indexOf`；sort key 预计算
- **P1**：`indentUnit` 按 depth 缓存；object 级 `spanBetween` 缓存；四 container formatter 改用 chunk 拼接（`TextBuf` / `parts[]`）
- 新增 `scripts/bench-json5.mjs` 记录优化前后耗时（主 fixture + synthetic 大 object）
- `format-emitter.js` 全方法及 `parse-pipeline.js` 入口补中文 JSDoc 说明
- **非 BREAKING**：`JSON5.format` 输出 MUST 与 v2.5.0 一致；`npm test` 全绿

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `project-structure`：新增可选 JSON5 format 性能基准脚本约定（`scripts/bench-json5.mjs`，不进 `npm test`）

## Impact

- **代码**：`src/parser/json5/format-emitter.js`（主）、`src/parser/core/parse-pipeline.js`（注释）
- **脚本**：`scripts/bench-json5.mjs`（新建）
- **测试**：现有集成测试作为回归门禁；无新 golden
- **API**：无行为变更；patch 版本 bump（实现完成后 `2.5.1`）
