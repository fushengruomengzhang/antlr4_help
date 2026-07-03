## Context

`json5-format-build-perf` 实施后 benchmark 结论：

| 阶段 | baseline | snapshot | 判定 |
|------|----------|----------|------|
| buildDocumentAst (2000 keys) | 0.825 ms | 0.911 ms | 回滚 |
| transform sort (2000 keys) | 0.310 ms | 0.146 ms | 保留 |
| fixture sort+compact e2e | 0.773 ms | 0.654 ms | 保留 transform 收益 |

路径 A：撤 build 预索引，留 transform in-place。

## Goals / Non-Goals

**Goals:**

- 恢复 `token-slice.js` 三查找函数至线性扫描（无 `TokenIndex`）
- 保留 `transformObject` / `transformArray` / `transformDocumentAst` 的 in-place 逻辑
- `npm test` 全绿；bench 验收 build ≤ baseline、transform ≤ snapshot

**Non-Goals:**

- 重新设计预索引（路径 B）
- 修改 parse/emit/public API
- 更新 expected 文件

## Decisions

### 1. 完全删除 TokenIndex 相关代码

不保留 dead code 或 optional index 参数——减少分支，与 baseline build 路径一致。

### 2. 保留的 transform 实现

```javascript
// transformDocumentAst: doc.value = transformValue(...); return doc;
// transformObject: in-place entry.value; sortKeys via index order array
// transformArray: in-place entry.value only
```

### 3. 验收基准

对比 `test/resources/benchmark/bench-v2.7.1.json`：

- `phases:2000 keys sort+compact` → transform ≤ 0.16 ms，build ≤ 0.84 ms
- format 输出不变

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 回滚时误删 transform | tasks 分步：先 token-slice，再 ast-builder；保留 transform 函数体 |
| bench 噪声 | 同 session 跑 snapshot + compare |

## Migration Plan

1. 回滚 token-slice.js
2. 回滚 ast-builder build 链路，确认 transform 未动
3. test + bench --snapshot
4. archive change

## Open Questions

（无）
