## 1. 回滚 build 预索引

- [x] 1.1 删除 `token-slice.js` 中 `TokenIndex` / `buildTokenIndex` 及查找函数的 index 分支，恢复线性扫描
- [x] 1.2 删除 `ast-builder-transform.js` build 链路的 index 构建与传参，恢复原版 build 函数签名

## 2. 确认 transform 保留

- [x] 2.1 确认 `transformDocumentAst` / `transformObject` / `transformArray` in-place 逻辑完整未回滚

## 3. 验证

- [x] 3.1 `npm test` 全绿，不修改 expected
- [x] 3.2 `node scripts/bench-json5.mjs --snapshot` 并与 `bench-v2.7.1.json` 对比（build ≤ baseline，transform 保持优化）
