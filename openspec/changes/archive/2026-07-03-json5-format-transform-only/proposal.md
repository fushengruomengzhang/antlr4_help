## Why

`json5-format-build-perf` 的 benchmark 对比（`bench-v2.7.1.json` vs `bench-v2.7.1-snapshot.json`）表明：**token 预索引使 `buildDocumentAst` 在大 flat object 上慢约 8–10%**，而 **transform in-place sort 优化在 sortKeys 场景快约 53%**。应回滚无效的 build 预索引，仅保留已验证的 transform 优化。

## What Changes

- **回滚** `token-slice.js` 中 `buildTokenIndex`、`TokenIndex`、`nextAny`/`nextComma`/`lineMax` 及查找函数的 index 分支
- **回滚** `ast-builder-transform.js` build 链路中的 index 构建与传参，恢复原版线性 token 扫描
- **保留** `transformObject` / `transformArray` in-place 写回 value 与 sortKeys 索引排序
- **保留** `transformDocumentAst` 原地更新 `doc.value`（无 doc spread）
- 跑 `npm test` 与 `bench --snapshot`，验收 build 回到 baseline、transform 保持优化

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `json5-format-perf`：移除 token 预索引要求；保留 transform 性能优化与输出不变约束

## Impact

- `src/parser/json5/format/token-slice.js` — 删除预索引，恢复三查找函数原版
- `src/parser/json5/format/ast-builder-transform.js` — build 回滚，transform 保留
- `test/resources/benchmark/` — 更新 snapshot 与 compare
- 无公共 API 变更
