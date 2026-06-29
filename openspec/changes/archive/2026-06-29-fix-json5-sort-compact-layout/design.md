## Context

`formatObjectCompact` 在 `sortKeys: true` 时设 `openingHidden = []` 并跳过 emit，是为避免与首个 member `hiddenLeft` 重复；但偏离了 `fix-json5-sort-compact` design 的「emit opening + 去重」方案。容器头注释（`{` 与源码首个 key 之间）被当作首个**排序** member 的 prefix，排序后漂移。`memberSuffixForSortedMember` 通过源码 `spanBetween` 保留原始换行，排序后相邻 emit 的 member 之间出现 `\n\n`。`fix-json5-sort-inline-comments` 的 suffix 与 prefix 拆分逻辑应保留，本 change 在其上补 compact 布局。

## Goals / Non-Goals

**Goals:**

- `{ sortKeys: true, compact: true }` 满足 compact requirement：opening 同行、member 间无多余空行、容器头注释不随 sort 挂到 member
- 保留 sort+compact 已有语义：无重复 member、`, //` 行尾注释、member 前缀注释随 key 移动
- 嵌套容器递归一致
- 小 fixture + spec scenario 锁住回归

**Non-Goals:**

- 不改变 `sortKeys: false` compact 路径
- 不要求 sort+compact 输出与 compact golden 逐字相同（key 顺序不同）
- 不修改 pretty+sortKeys 路径（可后续单独 change）
- 不重写 comment 锚定模型

## Decisions

### 1. 恢复 opening emit + tokenIndex 去重

sort+compact 与非 sort 一样 emit `hiddenRight(openTok)`（compact 化）。维护 `emittedHiddenIndices: Set<number>`，首个及后续 member 的 `hiddenLeftForSortedMember` / `emitHiddenCompact` 过滤已 emit index。

**Rationale**：与 archive design 一致；`{ // head` 恢复同行。

**Alternative**：仅把 opening hidden 挂到容器级变量 — 无法处理 `{ // a\n // b\n firstKey` 多段头注释，仍用 opening emit 更简单。

### 2. 容器头注释 vs member 前缀

定义容器头区间：token 从 `openTok` 之后到**源码** `sourceMembers[0].key().start` 之前（不含 key）。该区间 hidden MUST 仅经 opening emit 输出，MUST NOT 出现在任何 member `hiddenLeft`。

实现：`hiddenLeftForSortedMember` 额外排除落在「当前 member 源码 index > 0 时，上一 member valStop+1 到 key」之外的区间；对**排序后首个 emit member**，若其源码 index ≠ 0，其 `hiddenLeft` 仍只含真正 member 前缀（非容器头）。容器头已在 opening 输出。

对 `{ // head\n b: 1, a: 2 }` + sort：opening 含 `// head`；`a` emit 时 hiddenLeft 不含 head；`b` 的 `// about b` 类 prefix 仍锚定 b。

### 3. suffix 换行规范化

在 `memberSuffixForSortedMember`（compact=true）输出前：

- 将 suffix 中 trailing 空白 normalize
- 将 `\n{2,}` 替换为 `\n`（已有 `compactWhitespace`，在 suffix 与 `beginMemberLine` 组合后再 trim 连续空行）
- suffix 末尾 MUST NOT 以 `\n\n` 结束

**Rationale**：源码 member 间双换行在 sort 后不应变为输出空行。

### 4. array compact opening

`formatArrayCompact` 若未来加 sortKeys 或已有 opening 逻辑，同步 opening emit；当前 array 不 sort，但 nested object 内 sort 走 `formatObjectCompact` 递归，Decision 1–3 自动适用。

### 5. 测试

- `cases/json5.sort-compact-opening.text`：`{ // head\n b: 1, a: 2 }` assert 含 `{ // head` 且 `// head` 不在 `b:` 行首
- `cases/json5.sort-compact-no-blank.text`：`{ b: 1,\n\n a: 2 }` assert 输出无 `\n\n`
- 现有 sort-inline-comment、sort-compact case 仍通过

## Risks / Trade-offs

- **[Risk] opening 与 member prefix 重复 emit** → tokenIndex Set 去重 + 单测
- **[Risk] 容器头注释与首个 member 前注释边界模糊** → 用源码首个 key 作容器头区间右界
- **[Risk] 过度压缩 block 注释换行** → 仅规范 `\n{2,}`，不改 block 内部结构
- **[Risk] sorted.text 快照 diff** → 预期更紧凑，更新 out 文件

## Migration Plan

1. 实现 opening + 去重 + suffix 规范化
2. 新增 case + run.mjs
3. `npm test`、`openspec validate --all`

## Open Questions

（无）
