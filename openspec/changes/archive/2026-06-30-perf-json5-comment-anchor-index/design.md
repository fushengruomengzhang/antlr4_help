## Context

`JSON5.format` 当前通过 `Json5Lexer`（COMMENT/WS → HIDDEN）+ `Json5Parser` + `FormatEmitter`（~830 行）在 token 流上事后推断注释/空白归属。sort+compact 路径依赖 `hiddenLeftForSortedMember`、`isNextMemberPurePrefix`、`memberSuffixForSortedMember`、`excludedNextMemberPrefixIndices`、`spanBetween` 等启发式，已有多轮 bugfix（sort-inline、sort-prefix、sort-section-inline 等）。`perf-json5-format-emitter-p0-p1` 已通过单次 fill、`memberIdxMap`、span 缓存等优化至 fixture ~0.7 ms、500 keys sort+compact ~2 ms。

`add-json5-format-grammar`（方案 A）已实现但 bench 显示 format parse ~7 ms（约 12× 回归），因 DEFAULT trivia token 数量膨胀且每条走 parser rule。用户决定 **还原 A、改方案 B**：保留单 grammar + HIDDEN，parse 后 **一次 O(n) 扫描** 预计算锚点索引，emit 查表而非 per-member 重复区间扫描。

主要调用场景（80%+）：`format({ sortKeys: true, compact: true })`。

## Goals / Non-Goals

**Goals:**

- 还原并删除方案 A 产物（`json5/format/` grammar、`format-cst-emitter.js`）；恢复 `format-emitter.js` + `format.js` baseline
- 新增 `comment-anchor-index.js`：`buildCommentAnchorIndex(tree, tokenStream)`，O(n) 单次扫描
- 索引语义与现有 `json5-api` sort+compact 注释锚定 requirement **等价**（byte-equal golden）
- `FormatEmitter` 接入索引；删除或大幅简化 `isNextMemberPurePrefix` 链及重复 `spanBetween` 调用
- format 性能：fixture ~0.6–0.8 ms；500 keys sort+compact 不劣于 P0/P1 优化后 baseline（~2 ms）
- `parse`/`validate` 与 `Json5Lexer.g4`/`Json5Parser.g4` **零改动**

**Non-Goals:**

- 修改 `JSON5.parse` / `validate` 行为或 grammar
- 双 grammar / CST trivia（方案 A 整体废弃）
- 合并 compact/pretty 四套 formatter 或 compact-then-reorder 架构重写
- 将 bench 纳入 `npm test` CI 门禁
- 改变公开 API 签名或 `DEFAULT_FORMAT_OPTIONS`

## Decisions

### 1. 还原方案 A 作为本 change 第一步

删除 `src/grammars/json5/format/`、`format-cst-emitter.js`；`git restore` `format-emitter.js`、`format.js`、`scripts/generate.sh`；确认 `npm test` 全绿后再接索引。

**Rationale**：B 基于 baseline emitter 改造，非在 A 之上叠加。**Alternative**：保留 A 代码作参考 — 拒绝，增加混淆与 generate 负担。

### 2. 索引构建：两阶段、单次 token 扫描

```
Phase A — tree walk（O(nodes)）
  收集锚点：
  • doc：根 value 前 / EOF 前
  • container：每个 object/array 的 open.stop、close.start
  • member：key.start、colon、value.stop、源码序 nextKey 或 close
  • triple：opener delimiter token index

Phase B — token 扫描（O(tokens)，与 fill 后 HIDDEN 一次遍历）
  对每个 HIDDEN token i：
  • prevDefault / nextDefault = 最近非 HIDDEN token
  • 查锚点表分类 → slot

  Slot 类型：
  DOC_BEFORE | DOC_AFTER
  OPEN_AFTER(container)
  CLOSE_BEFORE(container)
  MEMBER_PREFIX(member)   // key 前 section 注释 + 跟随 WS
  KEY_MID(member)         // key 与 : 之间
  VALUE_SUFFIX(member)    // value 后至下一 member key 前（含 , // inline）
  TRIPLE_OPENER_AFTER(tripleCtx)
  UNASSIGNED              // 不应出现；shadow 阶段 assert
```

**Rationale**：分类规则从现有 `isNextMemberPurePrefix` / `excludedNextMemberPrefixIndices` **搬迁**而非重写，降低 regression 风险。**Alternative**：parse 时 listener 边 walk 边分类 — 仍要第二遍对齐 token index，不如集中一处。

### 3. Pure prefix / suffix 边界（与现 heuristic 对齐）

沿用 archive change 语义：

| 场景 | 归属 |
|------|------|
| `// section` 独立行于 key 前 | `MEMBER_PREFIX` 该 key |
| `value, // inline` | `VALUE_SUFFIX` 该 value 的 member |
| 下一 member 的 pure prefix comment + 其后 WS/newline | `MEMBER_PREFIX(next)`；**不得**出现在上一 member `VALUE_SUFFIX` |
| 上一 member 行尾 inline（非 pure prefix） | 保留在上一 `VALUE_SUFFIX`；排除逻辑不得误删 |
| 容器头 `{` 与首个 member key 之间 | `OPEN_AFTER`，sort 时不挂到任意 member prefix |
| member 间 layout gap（pure prefix 之前的 `\n\n  `） | compact sort suffix **不保留**（`trimInterMemberGapCompact` 仍在 emitter） |

`isNextMemberPurePrefix(valStop, nextKeyTok, commentToken)` 逻辑 **内联为 index builder 的 predicate**，实现完成后删除 emitter 副本。

### 4. 索引 API 形状

```javascript
/**
 * @typedef {{ idx: number, text: string }} TriviaEntry
 * @typedef {{
 *   prefix: TriviaEntry[],
 *   keyMid: TriviaEntry[],
 *   suffix: TriviaEntry[],
 * }} MemberTrivia
 * @typedef {{
 *   openAfter: TriviaEntry[],
 *   closeBefore: TriviaEntry[],
 * }} ContainerTrivia
 */

buildCommentAnchorIndex(root, tokenStream) → {
  doc: { before: TriviaEntry[], after: TriviaEntry[] },
  members: WeakMap<MemberContext, MemberTrivia>,
  containers: WeakMap<ObjectContext|ArrayContext, ContainerTrivia>,
  tripleOpeners: WeakMap<..., TriviaEntry[]>,
}
```

`FormatEmitter` 构造时接收 `(tokenStream, tree, options)` 或在 `format.js` 预构建 index 传入。

**Rationale**：`WeakMap` 以 parse tree 节点为键，sort 重排 member 顺序时按 **member 对象** 取 prefix/suffix，自然随 key 移动。**Alternative**：按源码 index 排序的数组 — sort 时需额外映射，易错。

### 5. FormatEmitter 改造范围

**改用索引：**

- `hiddenLeftForSortedMember` → `index.members.get(member).prefix`（sort 路径；non-sort 可继续 `hiddenLeft` 或统一走 index）
- `memberSuffixForSortedMember` → `index.members.get(member).suffix` + 现有 `trimInterMemberGapCompact` / `emitHiddenCompact`
- `hiddenRight(openTok)` / doc / triple opener → 对应 container/doc/triple 槽位

**保留不变：**

- `TextBuf`、`compactWhitespace`、`sortMembers`、`formatObjectCompact/Pretty` 布局策略
- `value-visitor.js` 字符串/key 处理
- `emittedHiddenIndices` 去重（若 index 已互斥可后续简化）

**删除（索引稳定后）：**

- `isNextMemberPurePrefix`
- `purePrefixHiddenTokens`
- `excludedNextMemberPrefixIndices`
- sort 路径对 `spanBetween` 的热调用（non-sort pretty 仍可用 `spanBetween` 或逐步迁移）

### 6. Shadow 断言（可选过渡）

`comment-anchor-index.js` 导出 `shadowAssertMatchesLegacy(index, emitter, tree)`：对 `test/resources/cases/json5.sort-*` 与 `test.json5.text` 对比 index 分类与 legacy `hiddenLeftForSortedMember` / `memberSuffixForSortedMember` 的 token 集合。开发期可在 `format.js` 或 test hook 启用；**交付前移除或仅留 dev 脚本**，不进入 `npm test` 默认路径。

**Rationale**：高回归面；shadow 一次性验证后可删 legacy。**Alternative**：直接替换 + golden — 可行但 debug 更难。

### 7. 实施顺序

```
Step 0  Revert A → npm test 绿
Step 1  comment-anchor-index.js + Focused unit tests（pure prefix 边界 case）
Step 2  Shadow vs legacy on sort cases
Step 3  Wire FormatEmitter sort+compact（热路径）
Step 4  Wire 其余 format 模式；删 legacy helpers
Step 5  bench-json5.mjs 记录前后
```

## Risks / Trade-offs

- **[Risk] 索引分类与多轮 bugfix 语义漂移** → 规则从现有 emitter 搬迁；shadow 全 case；byte-equal golden
- **[Risk] 还原 A 时 workspace 状态不一致** → 以 git HEAD 为准 restore；删 untracked format/ 目录
- **[Risk] non-sort 路径未迁移仍调 spanBetween** → 第一阶段仅 sort 路径强制 index；non-sort 可后续统一
- **[Trade-off] 仍 HIDDEN，compact 下 prefix 后补 indent 仍在 emitter** → B 只替换「猜归属」，不替换「布局策略」；可维护性提升有限长度
- **[Trade-off] 不如方案 A 在 grammar 层消除 heuristic** → 接受，perf 优先

## Migration Plan

1. Revert 方案 A 文件；`npm test` 确认 baseline
2. 落地 index 模块 + shadow
3. 改造 emitter；删 legacy
4. `npm test` + bench
5. `add-json5-format-grammar` change **不 archive 为 completed**；可在 archive 时注明 superseded by 本 change
6. Rollback：revert 本 change 提交，恢复 pre-index `format-emitter.js`

## Open Questions

- non-sort pretty 路径是否本 change 一并切 index，还是仅 sort+compact 热路径？（建议：sort 相关全切，pretty default 可第二批）
- `emittedHiddenIndices` 在 index 互斥后是否可删除？（实现时验证）
