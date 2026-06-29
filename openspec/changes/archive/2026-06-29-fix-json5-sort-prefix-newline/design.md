## Context

`fix-json5-sort-prefix-comments` 通过 `excludedNextMemberPrefixIndices` 从 suffix 区间排除下一 member 的 pure prefix **comment token**，并引入 `hiddenLeftForSortedMember` 的 `hasTrailingInlineComment` 分支以过滤上一 member 行尾 inline 注释。

ANTLR `getHiddenTokensToLeft(keyTok)` 返回自上一非 hidden token 起**全部** hidden token，包含上一 member 的行尾 inline 注释（`, // xxx`）与当前 member 的 prefix 注释及其中换行。

当上一 member 含行尾 inline 且与下一 member prefix 之间有空行时：

1. `hasTrailingInlineComment` 因批次中的 `// $` 等为 true，误删 prefix 区全部 whitespace → `// 下划线` 与 `"_private"` 粘连
2. `excludedNextMemberPrefixIndices` 只排除 comment token，suffix 仍 emit comment 后的 `\n`，经 `emittedHiddenIndices` 去重后 prefix 侧换行丢失

`test.json5.text` 大 fixture 几乎每个 key 都有 section prefix + 行尾 inline，sort 后大面积 `// 标签"key"` 粘连。

## Goals / Non-Goals

**Goals:**

- sort+compact（及 pretty+sort）时，member prefix 注释与 key 之间 MUST 保留换行（MUST NOT 与 key token 粘连）
- 保留 `fix-json5-sort-prefix-comments` 已有行为：prefix 挂对 key、`, // 行尾` 形态、opening 同行、无重复 member
- 覆盖「上一 member 行尾 inline + 空行 + 下一 member prefix」组合
- 小 fixture + `test.json5.format.sorted.text` 快照修正

**Non-Goals:**

- 不改变无 sort 路径
- 不重写 comment 锚定架构
- 不处理 section 分组注释（如 `// 字符串`）的语义归类（若仍漂移，另开 change）

## Decisions

### 1. suffix 排除整段 next member pure prefix hidden

当 `isNextMemberPurePrefix(valStop, sourceNextKey, t)` 对 `hiddenLeft(sourceNextKey)` 中任一 comment token 为 true 时，将 **hiddenLeft(sourceNextKey) 的全部 token**（含 comment 后 whitespace/newline）加入 `excludeIndices`，而不只排除 comment token。

**Rationale**：换行属于 prefix 布局，不得由上一 member suffix 先 emit。

**Alternative**：suffix 截断到最后一个 comma — 无法处理无 comma 的 gap；弃用。

### 2. hiddenLeftForSortedMember：按 token 过滤，不 blanket 删 whitespace

移除或重写 `hasTrailingInlineComment` 触发的「删除所有非 comment hidden」逻辑。改为：

- 对含 `//`/`/*` 的 token：仅当 `isNextMemberPurePrefix(prevValStop, keyTok, t)` 为 true 时保留（属于当前 member prefix）
- 对不含 comment 的 token：保留（属于 prefix 布局 whitespace），**不因**批次中存在上一 member 行尾 inline 而整批删除

上一 member 行尾 inline 注释 token（`isNextMemberPurePrefix` 为 false）单独过滤掉，不影响后续 prefix whitespace。

**Rationale**：根因是 `hasTrailingInlineComment` 的 over-filter；精确 per-token 过滤即可。

### 3. pretty + sort 共用同一 helper

`memberSuffixForSortedMember` 与 `hiddenLeftForSortedMember` 改动同时作用于 compact 与 pretty sort 路径。

### 4. 测试

- `cases/json5.sort-prefix-newline.text`：
  ```json5
  {
    "$key": "value", // $
    
    // 下划线
    "_private": true, // private
  }
  ```
  assert：输出含 `// 下划线` 与 `"_private"` 分行（MUST NOT 含 `下划线"_private"`）
- 现有 sort-prefix-comment、sort-inline-comment 等无回归
- 更新 `test/resources/out/test.json5.format.sorted.text`

## Risks / Trade-offs

- **[Risk] 排除整段 hiddenLeft 误伤 suffix 合法换行** → 仅当存在 pure prefix comment 时排除整段；trailing inline 场景仍只排除 inline comment token（现有 `isNextMemberPurePrefix` 区分）
- **[Risk] emittedHiddenIndices 双重去重** → 实现后跑全量 case + 大 fixture
- **[Risk] sorted.text 大面积 diff** → 预期注释换行归位

## Migration Plan

1. 调整 `excludedNextMemberPrefixIndices` 排除整段 prefix hidden
2. 重写 `hiddenLeftForSortedMember` whitespace 过滤
3. 新增 case + 更新 sorted 快照
4. `npm test`、`openspec validate --all`

## Open Questions

（无）
