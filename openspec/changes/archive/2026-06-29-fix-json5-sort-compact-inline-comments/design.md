## Context

sort+compact 路径用 `memberSuffixForSortedMember` 经 `spanBetween(valStop, sourceNextKey)` 收集 suffix，并用 `excludedNextMemberPrefixIndices` 排除 `hiddenLeft(sourceNextKey)` 以免下一 member prefix 挂到上一 member。

`fix-json5-sort-prefix-newline` 将排除策略从「仅 comment token」改为「整段 hiddenLeft(nextKey)」，修复了 `// 下划线"_private"` 粘连，但引入回归：

```
源码:
  // 数字
  "age": 18, // 年龄
  // 浮点数
  "score": 99.5, // 分数

hiddenLeft("score" key) = [ ", // 年龄\n\n  ", "// 浮点数\n  " ]  (概念上)

整段排除 → age suffix 丢失 ", // 年龄"
hiddenLeftForSortedMember(score) 过滤 // 年龄 (非 pure prefix) → 注释消失
```

小 case `sort-inline-comment`（相邻 member、无 section prefix 间隔）仍通过；大 fixture 几乎每个 key 都有 section prefix + 行尾 inline，问题大面积暴露。

## Goals / Non-Goals

**Goals:**

- sort+compact 时，上一 member 行尾 inline（`, // xxx`）MUST 保留于该 member 行，即使下一 member 有 section prefix
- 保留 prefix 与 key 分行（fix-json5-sort-prefix-newline 成果）
- 减少 orphan 空行（suffix 排除后残留 layout）
- 小 case + 大 fixture assert

**Non-Goals:**

- 不改变无 sort 的 compact 路径
- 不为 sorted 输出引入完整 golden（仅抽样 assert + out 快照）
- 不重写 comment 锚定架构

## Decisions

### 1. 精确切分 hiddenLeft(nextKey)

新增 helper（如 `purePrefixHiddenTokens(prevValStop, nextKeyTok)`）：

- 输入：`hiddenLeft(nextKeyTok)` 全部 token
- 对每个 comment token：若 `isNextMemberPurePrefix(prevValStop, nextKeyTok, t)` → 属于 next prefix
- 对 non-comment token：若位于第一个 pure prefix comment **之后**（或与其同属 prefix 块）→ 排除；若位于 pure prefix **之前** → 属于 gap/suffix，**不排除**
- `excludedNextMemberPrefixIndices` 只返回 pure prefix 块 token index，而非整段 hiddenLeft

**Rationale**：上一 member 行尾 inline 在 hiddenLeft 批次前端，pure prefix 在后；按位置切分即可两者兼得。

**Alternative**：回退整段排除 + 单独 emit inline — 需重复 hiddenLeft 解析；弃用。

### 2. suffix 边界不变

仍用 `spanBetween(valStop, sourceNextKey, excludeIndices)`；excludeIndices 缩小为 pure prefix 子集后，`, // 年龄` 自然留在 suffix。

### 3. hiddenLeftForSortedMember 不变（除非实现时发现需微调）

当前逻辑：non-comment 全保留；comment 仅保留 pure prefix。实现后验证 // 年龄 不会出现在 score prefix emit。

### 4. 测试

- `cases/json5.sort-section-inline.text`：
  ```json5
  {
    // 数字
    "age": 18, // 年龄

    // 浮点数
    "score": 99.5, // 分数
  }
  ```
  assert：`"age": 18, // 年龄`；无 `下划线"_private"` 类粘连回归（可复用 prefix-newline case）
- `run.mjs` 大 fixture sorted runCase：assert 含 `"age": 18, // 年龄`、不含大面积丢失 inline 的启发式检查
- 现有 sort-inline-comment、sort-prefix-newline 无回归

## Risks / Trade-offs

- **[Risk] whitespace 切分边界错误** → 以 token 顺序 + isNextMemberPurePrefix 为准，不用字符串启发式截断
- **[Risk] 与 prefix-newline fix 互斥** → 同批 case 一起跑；prefix 粘连 assert 保留
- **[Risk] sorted.text 大面积 diff** → 预期 inline 归位

## Migration Plan

1. 实现 pure prefix 精确排除 helper
2. 更新 excludedNextMemberPrefixIndices
3. 新增 case + sorted runCase assert
4. `npm test`、`openspec validate --all`

## Open Questions

（无）
