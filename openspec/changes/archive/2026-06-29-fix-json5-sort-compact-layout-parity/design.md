## Context

`format` 使用 ANTLR Parse Tree + TokenStream（非 visitValue AST）。sort+compact 通过 `memberSuffixForSortedMember` + `hiddenLeftForSortedMember` 锚定注释；`purePrefixHiddenTokens` 已切分 prefix 与上一 member inline，但 suffix 仍保留 pure prefix 之前的 gap token（`\n\n  `），在 value 行后形成 whitespace-only 行。

无 sort compact 将 gap 与下一 section prefix 合并在 suffix 一次 emit，`compactWhitespace` 压成紧凑布局。sort 路径 prefix 单独 emit 后 gap  orphaned。

当前指标（`test.json5.text`）：compact 0 blank-ish lines；sort+compact 34 blank-ish lines。

## Goals / Non-Goals

**Goals:**

- `sortKeys + compact` 输出布局等同 `compact`（各 object 层仅 member 顺序不同）
- 无 whitespace-only 行；section prefix 紧贴下一 key（与 compact golden 相同模式）
- 保留已有 comment 锚定：prefix 分行、行尾 inline、无粘连、无丢失
- 大 fixture sorted 快照与 parity 测试

**Non-Goals:**

- 不改变 grammar / parse pipeline
- 不引入完整 sorted golden 文件（用 parity assert + out 快照）
- 不改变 pretty（非 compact）sort 路径

## Decisions

### 1. sort+compact suffix 丢弃 inter-member gap

在 `memberSuffixForSortedMember(..., compact=true)` 中，对 suffix 应用 `trimInterMemberGapCompact(suffix)`：

- 保留：`, // inline` 及同行必要逗号
- 丢弃：pure prefix 之前已排除后仍残留的 trailing `\n[ \t]+`（member 间 layout gap）
- 非末项：suffix 归一化后 SHOULD 不以 standalone `\n[ \t]+\n` 结束

**Rationale**：compact 语义不回放源码 section 间空行；下一 member 的 `beginMemberLine + prefix` 负责换行。

**Alternative**：先 compact 再 reorder member 块 — 语义最清晰但 refactor 大；本 change 优先 incremental suffix trim。

### 2. 收紧 normalizeMemberSuffixCompact

- 去除 suffix 末尾 `\n[ \t]+$`（compact sort 路径）
- 保留 `\n{2,}` → `\n` 折叠（与现有 no-blank scenario 一致）
- 可选：去除仅含 whitespace 的「行」若仍出现

### 3. hiddenLeftForSortedMember / purePrefix 不变

comment 锚定逻辑不在此 change 重写；仅 suffix gap trim。实现后全量跑 sort-prefix-* / sort-inline-* / sort-section-inline cases。

### 4. 测试

- `cases/json5.sort-compact-gap.text`：section + 空行 + 下一 section，assert 无 whitespace-only 行且 `"a": 1, // a` 同行
- `run.mjs` sorted runCase：assert `text.split('\n').every(l => l.trim() !== '' || ...)` 或等价（允许文件末尾空行）
- 可选 parity：对 `test.json5.text` 比较 line count 接近 compact、blank-ish lines === 0

## Risks / Trade-offs

- **[Risk] 误删有意留白** → 仅 sort+compact suffix trim；pretty 路径不动
- **[Risk] 与 prefix-newline / inline fixes 冲突** → 同一 test suite 回归
- **[Risk] 嵌套 object 同样有空行** → formatObjectCompact 递归，suffix trim 对所有 depth 生效

## Migration Plan

1. 实现 `trimInterMemberGapCompact` + 接入 `memberSuffixForSortedMember`
2. 收紧 `normalizeMemberSuffixCompact`
3. 新增 case + 加强 sorted runCase assert
4. `npm test`、`openspec validate --all`

## Open Questions

（无）
