## 1. Baseline

- [x] 1.1 记录优化前性能基线（`npm test` + `scripts/bench-json5.mjs`）

## 2. Types and token slicing

- [x] 2.1 在 `types.js` 定义 `TokenCoord`、`AnchorTriplet` 及新 AST 节点类型（无注释字符串槽位）
- [x] 2.2 新增 `token-slice.js`：`CommentSlicer`、哨兵、区间切片、`isCommentToken`

## 3. AST build (no comments)

- [x] 3.1 重写 `ast-builder.js`：为 object/array/entry/primitive/triple 构建语义 `AnchorTriplet`
- [x] 3.2 删除旧注释槽位赋值逻辑；移除或替换 `token-helpers.js` 考古方法

## 4. Transform

- [x] 4.1 精简 `ast-transform.js`：仅 `sortKeys` 稳定排序 + 递归子树

## 5. Emit

- [x] 5.1 重写 `emit.js`：接收 `tokenStream`，用 `CommentSlicer` 回填 prefix/suffix
- [x] 5.2 实现 compact/pretty 空白策略（保留注释原文，重写纯空白）
- [x] 5.3 更新 `format.js` 向 emit 传递 `tokenStream`

## 6. Tests and performance

- [x] 6.1 更新 `test/run.mjs` 中 `json5 ast-builder slots` 为 Triplet 区间断言
- [x] 6.2 `npm test` 全通过
- [x] 6.3 运行 `node scripts/bench-json5.mjs` 对比基线并记录结果

### Post-refactor benchmark (2026-07-03)

| 场景 | 基线 | 优化后 | 变化 |
|------|------|--------|------|
| format default (fixture) | 0.742 ms/op | **0.664 ms/op** | -10.5% |
| format sort+compact (fixture) | 0.704 ms/op | **0.660 ms/op** | -6.3% |
| buildDocumentAst (fixture) | 0.086 ms/op | **0.024 ms/op** | -72% |
| buildDocumentAst (2000 keys) | 1.522 ms/op | **0.823 ms/op** | -46% |
| format e2e (2000 keys sort+compact) | 4.232 ms/op | **3.362 ms/op** | -20.6% |
