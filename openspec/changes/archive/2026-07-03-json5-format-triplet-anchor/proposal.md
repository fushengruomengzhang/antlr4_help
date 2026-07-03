## Why

JSON5 `format` 在 build 阶段将注释预填入 `before` / `suffixSort` 等字符串槽位，逻辑复杂且 `buildDocumentAst` 是性能热点（2000 keys 约 1.52 ms/op）。需要按坐标驱动的三元锚点模型重构：AST 只记结构与 token 邻接坐标，emit 阶段按区间切片回填注释，消除 gap 考古。

## What Changes

- 重写 `JSON5.format` 内部管线：`buildAst`（无注释）→ `transform`（仅排序）→ `emit`（区间切片 + formatter 排版）
- 引入 `AnchorTriplet`（`prev` / `current` / `next`）与流首/流尾哨兵
- 新增 `token-slice.js`：按 token 索引区间提取注释原文；纯空白由 formatter 重写
- 删除 AST 节点上的 `before` / `suffix` / `openRight` 等注释字符串槽位
- **禁止 gap 考古**：sort 只改 entries 顺序，注释归属由源 token 区间机械决定
- 更新 `json5 ast-builder slots` 测试以验证三元锚点区间切片
- 优化后复跑 `scripts/bench-json5.mjs` 对比基线

## Capabilities

### New Capabilities

- `json5-format-triplet-anchor`: 三元锚点 AST、区间注释切片、emit 回填与禁止 gap 考古约束

### Modified Capabilities

- `json5-format-ast`: build 阶段不再预填注释槽位；emit 阶段通过 token 区间切片回填注释

## Impact

- `src/parser/json5/format/**`（`types.js`、`ast-builder.js`、`ast-transform.js`、`emit.js`、新增 `token-slice.js`）
- `src/parser/json5/format.js`（向 emit 传递 `tokenStream`）
- `test/run.mjs`（ast-builder 槽位断言改为区间切片断言）
- 不影响 `JSON5.parse` / `JSON5.validate` 公共 API
