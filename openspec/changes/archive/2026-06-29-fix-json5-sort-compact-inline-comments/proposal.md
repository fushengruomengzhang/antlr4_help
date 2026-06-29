## Why

`format({ sortKeys: true, compact: true })` 在 `test.json5.text` 大 fixture 上未满足 compact 语义：大量 member 丢失行尾 inline 注释（如 `"age": 18` 缺 `// 年龄`），并出现多余空行。根因是 `fix-json5-sort-prefix-newline` 为修复 prefix 粘连，将 `hiddenLeft(nextKey)` **整段**从上一 member suffix 排除，但该批次同时含上一 member 的行尾 inline 与下一 member 的 section prefix，导致 inline 注释彻底丢失。integration-tests spec 已写 SHOULD 但未 enforce。

## What Changes

- 修复 `excludedNextMemberPrefixIndices`：只排除下一 member 的 **pure prefix** token（及仅服务于 prefix 的 layout whitespace），**保留**上一 member 行尾 inline 于 suffix
- 验证 `hiddenLeftForSortedMember` 不误删已保留的 suffix inline
- 新增 case fixture（section prefix + 行尾 inline + 下一 section prefix）及大 fixture `sorted` runCase assert
- 更新 `test.json5.format.sorted.text` 快照（inline 注释归位、减少 orphan 空行）

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `json5-api`：明确 sort+compact 下行尾 inline 在「下一 member 有 section prefix」时仍 MUST 与 value 同行
- `integration-tests`：新增 section+inline case；大 fixture sorted runCase 加 assert（抽样 inline 注释）

## Impact

- **代码**：`src/parser/json5/format-emitter.js`（`excludedNextMemberPrefixIndices`，必要时 suffix/prefix 切分 helper）
- **测试**：`test/run.mjs`、`test/resources/cases/`、`test/resources/out/test.json5.format.sorted.text`
- **API**：非 **BREAKING**；修正 sort+compact 下行尾 inline 保留
