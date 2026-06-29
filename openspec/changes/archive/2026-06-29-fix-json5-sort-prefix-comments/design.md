## Context

`fix-json5-sort-inline-comments` 引入 sort 路径 `spanBetween(valStop, sourceNextKey)` 以保留 `, // 行尾` 形态。词法上，member B 的 prefix 注释（`// about B`）位于 member A 的 value 终止 token 与 member B 的 key 之间，故被 span 收入 A 的 suffix。无 sort 时 A 紧邻 B emit，正确；sort 后 A、B 分离，prefix 跟错 member。

`hiddenLeftForSortedMember` 会从 B 的 prefix 中过滤已在 suffix emit 的 token（`emittedHiddenIndices`），但注释已随 A 输出，无法回收。

## Goals / Non-Goals

**Goals:**

- sort+compact（及 pretty+sort）时，member 前缀注释与所属 key 相邻输出
- 保留已有语义：`, // 行尾`、opening 同行、无空行、无重复 member
- 覆盖中文/unicode 标签注释及 `// unicode` + `"unicode"` key 场景
- 小 fixture + 大 fixture sorted 快照修正

**Non-Goals:**

- 不改变无 sort 的 compact/pretty 路径
- 不重写 comment 锚定架构
- 不处理 `{ // head` 与 member prefix 同名文本的特殊 UX（按锚定规则区分 opening vs prefix）

## Decisions

### 1. suffix 排除下一 member 的 hiddenLeft

在 `memberSuffixForSortedMember` 中：

```
sourceNext = sourceMembers[sourceIdx + 1] 或 closeTok
suffixTokens = spanBetween(valStop, sourceNextKey)
prefixOfNext = hiddenLeft(sourceNextKey)  // 当 sourceNext 为 member 时
suffix = suffixTokens 减去 prefixOfNext 的 token 文本（按 tokenIndex）
```

对容器末项（sourceNext = closeTok），无 next member prefix，逻辑不变。

**Rationale**：最小改动；prefix 仍由 `hiddenLeftForSortedMember` + sort 后 emit 到正确 key。

**Alternative**：suffix 只 span 到逗号 token — 会丢失跨行 layout 且难覆盖无逗号末项前的区间；弃用。

### 2. hiddenLeftForSortedMember 简化

排除 `[prevValStop+1, keyTok)` 的 filter 原意为避免与 prev suffix 重复；suffix 已不再含 next prefix 后，可简化为：

- `hiddenLeft(keyTok)` 减去 `emittedHiddenIndices`
- 可选保留 prev-member suffix 区间去重（防御 double emit）

实现时验证是否仍需 source-prev 区间 filter；若 suffix 已排除 next prefix，member 自身 prefix 应完整保留。

### 3. pretty + sort 共用 helper

`memberSuffixForSortedMember(..., compact=false)` 同样应用 prefix 排除，避免 pretty sort 路径漂移。

### 4. 测试

- `cases/json5.sort-prefix-comment.text`：
  ```json5
  { "_private": true, // 中文 key\n 中文字段: "v", "$key": "x" }
  ```
  assert：`// 中文 key` 在 `中文字段` 行附近，不在 `"$key"` 前
- `cases/json5.sort-prefix-unicode.text`：
  ```json5
  { "a": 1, // unicode\n "unicode": "\\u4F60\\u597D", "b": 2 }
  ```
  assert：`// unicode` 与 `"unicode"` member 相邻
- 现有 sort-inline-comment、sort-compact-opening 等无回归

## Risks / Trade-offs

- **[Risk] 误删 suffix 内合法换行** → 仅按 hiddenLeft(nextKey) tokenIndex 精确排除，不用启发式截断
- **[Risk] block 注释 prefix 跨行** → hiddenLeft 含完整 block token，整 token 排除/保留
- **[Risk] sorted.text 大面积 diff** → 预期注释归位

## Migration Plan

1. 实现 suffix prefix 排除
2. 验证/简化 hiddenLeftForSortedMember
3. 新增 case + 更新 sorted 快照
4. `npm test`、`openspec validate --all`

## Open Questions

（无）
