## Context

`FormatEmitter` 基于 ANTLR `CommonTokenStream` + Parse Tree 做 format（非 visitValue AST）。`runParsePipeline` 已 `fillTokens: true`，但 `hiddenLeft` / `hiddenRight` / `spanBetween` / `hiddenTokensBetween` 仍各自调用 `fill()`。sort 路径每个 member 多次 `sourceMembers.indexOf(member)`（至少 3 处），大 object 为 O(n²)。

**Benchmark 基线（本机 Node，2026-06-29，优化前 `scripts/bench-json5.mjs`）：**

| 场景 | 优化前 ms/op | 优化后 ms/op | 变化 |
|------|-------------|-------------|------|
| test.json5.text sort+compact | 0.901 | 0.734 | −19% |
| test.json5.text compact | 0.622 | 0.641 | ≈0 |
| sort+compact 500 keys (flat) | 2.049 | 1.989 | −3% |
| sort+compact 200 keys | 0.570 | 0.542 | −5% |
| sort+compact 50 keys | 0.125 | 0.121 | −3% |

v2.5.0 sort+compact 注释锚定逻辑（`hiddenLeftForSortedMember` slice、`trimInterMemberGapCompact` 等）**不得改动语义**。

## Goals / Non-Goals

**Goals:**

- P0/P1 优化落地；sort 路径大 object 预期 20–40% 提升（500 key synthetic）
- 全部 format 模式输出与优化前 **byte-equal**（`test.json5.text` + cases）
- `format-emitter.js` 方法中文注释；`parse-pipeline.js` 入口注释
- `scripts/bench-json5.mjs` 可重复跑 before/after

**Non-Goals:**

- 合并 compact/pretty 四套 formatter；compact-then-reorder 架构重写
- Java8 / API 性能优化
- 改 grammar、parse pipeline 行为
- 将 bench 纳入 `npm test` CI 门禁

## Decisions

### 1. P0-1：`ensureTokensFilled` 单次 fill

构造 `FormatEmitter` 时调用一次 `this.tokens.fill()`，设 `_tokensFilled`；四个 token 查询方法改调 `ensureTokensFilled()` 而非裸 `fill()`。

**Rationale**：pipeline 已 fill；重复 fill 无收益。**Alternative**：去掉 pipeline fill 仅 emitter fill — 不采纳，validate/parse 路径不需要 fill。

### 2. P0-2：`Map<MemberContext, number>` 传参

每个 `formatObject*` / 涉及 sort 的路径在 object 入口 `buildMemberIndexMap(sourceMembers)`，循环内 `memberIdx` 传入 `sourceNextKeyToken`、`hiddenLeftForSortedMember`、`excludedNextMemberPrefixIndices`、`memberSuffixForSortedMember`。

**Rationale**：O(n²) → O(n)，改动局部、风险低。

### 3. P0-3：sort key 预计算

```javascript
members
  .map((member, ord) => ({ member, sortKey: keySortString(member.key()), ord }))
  .sort((a, b) => a.sortKey.localeCompare(b.sortKey) || a.ord - b.ord);
```

**Rationale**：稳定排序 + 避免比较器内重复 decode key。

### 4. P1-4：indent 实例缓存

`this._indentCache = new Map()`，key 为 depth；`indentUnit` 查表。

### 5. P1-6：object 级 span 缓存

在 `formatObjectCompact` / `formatObjectPretty` 内创建 `spanCache`（`Map<string, string>`，key `${fromIdx}:${toIdx}`），传入或挂到 emitter 临时字段；`spanBetween` 无 exclude 时命中缓存；有 `excludeIndices` 时从 token 区间 filter（或缓存 token texts 数组）。

**Rationale**：`isNextMemberPurePrefix` 与 suffix 收集共享区间扫描。

### 6. P1-5：`TextBuf` chunk 拼接

新增轻量 helper（可同文件内 class 或闭包）：

- `push(...chunks)` 累积 `parts[]`
- `beginMemberLine(depth)` / `beginCloseLine(depth)` 在边界 materialize 尾部（与现逻辑等价）
- 仅重构 `formatObjectCompact/Pretty`、`formatArrayCompact/Pretty`；不动 `formatDocument`、`emitTriple*`

**Alternative**：全文件 `out +=` 保留 — 放弃 P1-5 最大单项收益。**Rationale**：四方法集中 ~80% 的 `+=`。

### 7. 中文注释约定

JSDoc 首行中文说明职责/约束；保留 `@param`/`@returns`。sort 锚定相关方法注明「源码下一 key 为 suffix 终点，非排序后下一项」。

### 8. 验收与 bench

- `npm test` 100% 通过
- bench：主 fixture 四种 format + 50/200/500 key synthetic sort+compact
- 可选：优化前 snapshot 输出到 `test/resources/out/` 对比（或 git stash 前后 diff）

## Risks / Trade-offs

- **[Risk] P1-5 TextBuf 改变字符串边界行为** → byte-equal 对比 + 全 sort case 回归
- **[Risk] spanCache exclude 路径漏 filter** → sort-prefix-* / sort-section-inline cases
- **[Risk] 优化后 bench 提升不明显于小 fixture** → 以 500 key synthetic 为主指标；小 fixture 仍须零回归
- **[Trade-off] 代码行数可能略增**（TextBuf + 缓存 + 注释）— 性能优先，可接受

## Migration Plan

1. 添加 `scripts/bench-json5.mjs`，记录 baseline 写入 design 或 PR 描述
2. 按 P0 → P1-4/6 → P1-5 → 注释顺序实现；每步 `npm test`
3. 跑 bench 对比；`openspec validate --all`
4. release `2.5.1` patch

## Open Questions

（无）
