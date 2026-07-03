## Why

`JSON5.format` 在大 flat object 场景下，`buildDocumentAst` 占端到端耗时约 30%：每个 object/array member 重复线性扫描 token stream（`findCommaToken`、`streamNextToken`、`openLineEndToken`），且多处冗余 `tokenStream.fill()`。在**输出语义与现有 test expected 完全不变**的前提下，format 管线内部仍有 Tier 1 性能优化空间。

## What Changes

- 在 `buildDocumentAst` 入口对 filled token stream **一次 O(n) 预索引**（下一 DEFAULT channel token、区间内 comma 等），替代 member 级重复线性扫描
- **移除 format 路径内冗余 `fill()`**（入口已 `fillTokens: true`；`CommentSlicer.ensureFilled` 保留兜底）
- **`transformDocumentAst` sortKeys 路径减少不必要的 spread 拷贝**（递归 transform value，排序 in-place 或等价少分配）
- bench 分段记录优化前后 `buildDocumentAst` / e2e 耗时（`scripts/bench-json5.mjs`）

**不变：**

- 所有 format 输出与现有 expected 字节级一致
- `JSON5.format` 公共签名与选项
- `parse.js`、`validate.js`、`runParsePipeline` 等非 format 模块

## Capabilities

### New Capabilities

- `json5-format-perf`：format 管线内部性能约束（输出不变、预索引、作用域仅限 format）

### Modified Capabilities

（无 — 无 spec 级行为变更）

## Impact

- `src/parser/json5/format/token-slice.js` — 预索引结构 + 查找函数改写
- `src/parser/json5/format/ast-builder-transform.js` — 传入/使用索引；transform 少拷贝
- `src/parser/json5/format.js` — 无行为变更（可能传递索引上下文，若设计需要）
- `scripts/bench-json5.mjs` — 记录对比（可选注释 baseline）
- **不修改** `src/parser/core/`、`parse.js`、`validate.js`、grammar、public API
