## Why

`format({ sortKeys: true, compact: true })` 在注释锚定修复后仍与 `format({ compact: true })` 布局不一致：`test.json5.text` 大 fixture 的 sorted 输出含 30+ 行仅 whitespace 的空行（compact 为 0），总行数 175 vs 141。根因是 sort 路径将 member 间隙拆为 suffix（含源码 gap whitespace）与 prefix 分 emit，未丢弃 compact 不应保留的 layout gap。用户期望：**sorted 输出完全贴近 compact，仅各 object 层 key 顺序不同**。

## What Changes

- 修复 sort+compact suffix：member suffix 在 compact 模式下 MUST NOT 保留 pure prefix 之前的 inter-member gap whitespace（仅保留 `, // inline` 等同行后缀）
- 收紧 `normalizeMemberSuffixCompact` / `beginMemberLine` 协作，消除 whitespace-only 行
- 明确 spec：`sortKeys + compact` 输出布局 MUST 与无 sort compact 相同（除各 object member 顺序外）
- 集成测试：sorted runCase 断言无 whitespace-only 行；可选 parity helper（sorted vs reordered-compact 抽样）
- 更新 `test.json5.format.sorted.text` 快照

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `json5-api`：明确 sort+compact 布局 parity requirement（等同 compact + key 排序）；加强 member 间无空行 scenario
- `integration-tests`：sorted fixture 断言无 whitespace-only 行；parity 相关 scenario

## Impact

- **代码**：`src/parser/json5/format-emitter.js`（`memberSuffixForSortedMember`、`normalizeMemberSuffixCompact`，必要时 suffix trim helper）
- **测试**：`test/run.mjs`、`test/resources/out/test.json5.format.sorted.text`
- **API**：非 **BREAKING**；修正 sort+compact 布局至 spec 意图
