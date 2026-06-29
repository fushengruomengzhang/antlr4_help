## Why

`fix-json5-sort-prefix-comments` 已修复 sort 后 member 前缀注释挂错 key 的问题，但引入遗漏边界：当上一 member 含行尾 inline 注释（`, // xxx`）且下一 member 有独立行 prefix 注释时，prefix 与 key 之间的换行被吃掉，输出粘连为 `// 下划线"_private": true` 而非分行形态。`test.json5.text` 大 fixture 在 sort+compact 下大量出现同类问题。

## What Changes

- 修复 `hiddenLeftForSortedMember`：`hasTrailingInlineComment` 不得因上一 member 行尾 inline 注释（混在 `hiddenLeft` 批次中）而误删当前 member prefix 的 whitespace/newline
- 修复 `excludedNextMemberPrefixIndices`：suffix 排除 pure prefix 时排除**整段** `hiddenLeft(nextKey)` token（含 comment 后换行），而不只排除 comment token
- 补充 spec：sort 时 prefix 注释 MUST 与 key 分行相邻（MUST NOT 与 key token 粘连）
- 新增 case fixture（上一 member 行尾 inline + 空行 + 下一 member prefix）及大 fixture sorted 快照更新

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `json5-api`：补充 prefix 注释与 key 之间换行保留的 requirement/scenario；细化 suffix 排除整段 next prefix hidden
- `integration-tests`：新增 sort prefix newline case fixture 与 assert

## Impact

- **代码**：`src/parser/json5/format-emitter.js`（`hiddenLeftForSortedMember`、`excludedNextMemberPrefixIndices`）
- **测试**：`test/run.mjs`、`test/resources/cases/`、`test/resources/out/test.json5.format.sorted.text`
- **API**：非 **BREAKING**；修正 sortKeys 组合下 prefix 注释布局
