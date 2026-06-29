## Why

`format({ sortKeys: true, compact: true })` 在 sort 路径跳过 `hiddenRight({)`、将容器头注释落入首个排序 member 的 prefix，且 member suffix 保留源码 `\n\n`，导致 compact 核心布局（`{ // head` 同行、member 间无空行）在 sort 组合下失效。`fix-json5-sort-inline-comments` 已修复行尾 `, //` 注释，但未恢复 opening 同行与空行控制；spec 中 compact 规则未限定「仅无 sort」，但缺少 sort+compact 的 layout scenario 与测试门禁。

## What Changes

- 恢复 sort+compact 路径的容器 opening hidden emit，并对首个 emit member 的 `hiddenLeft` 去重（对齐 `fix-json5-sort-compact` 原 design）
- 区分**容器头注释**（`{` 与源码首个 member key 之间）与 **member 前缀注释**；容器头注释 MUST 留在 `{`/`[` 同行或容器顶部，MUST NOT 随 sort 挂到任意 member 前
- sort 路径 member suffix 规范化：member 间仅保留单换行，去除多余空行
- 嵌套 object/array 在 sort+compact 下递归应用相同 opening 与 suffix 规则
- 补充 spec scenario 与 case fixture（opening 同行、无空行、容器头注释不漂移）
- 可选：集成测试 assert sort+compact 无 `\n\n` 于 member 行之间（或与小 fixture golden 对比）

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `json5-api`：明确 sort+compact 仍满足 compact 布局 requirement；补充 opening 同行、无空行、容器头注释 scenario
- `integration-tests`：补充 sort+compact layout 小 fixture 与断言

## Impact

- **代码**：`src/parser/json5/format-emitter.js`（`formatObjectCompact` / `formatArrayCompact` sort 分支）
- **测试**：`test/run.mjs`、`test/resources/cases/`
- **API**：非 **BREAKING**；修正 sort+compact 组合输出，与 compact 语义对齐
