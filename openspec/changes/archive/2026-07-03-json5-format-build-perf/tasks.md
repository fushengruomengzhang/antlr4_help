## 1. Token 预索引

- [x] 1.1 在 `token-slice.js` 实现 `buildTokenIndex(tokenStream)`（`nextDefault`、`lineLast`）
- [x] 1.2 改写 `streamNextToken` / `findCommaToken` / `openLineEndToken` 支持可选 `TokenIndex`，无 index 时保持现行为
- [x] 1.3 `buildDocumentAst` 入口构建 index 并传入 `buildObject` / `buildArray` / `buildValue` 链路

## 2. 冗余 fill 与 transform

- [x] 2.1 移除 AST build 路径上对 `tokenStream.fill()` 的冗余调用（保留 `CommentSlicer.ensureFilled`）
- [x] 2.2 `transformObject` / `transformArray` 减少 spread 拷贝（in-place sort + 写回 value）

## 3. 验证

- [x] 3.1 `npm test` 全绿，不修改任何 expected 文件
- [x] 3.2 运行 `node scripts/bench-json5.mjs`，确认 2000 keys 场景 `buildDocumentAst` 耗时下降并记录结果
