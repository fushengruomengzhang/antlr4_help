## Why

`format({ sortKeys: true, compact: true })` 在收集 member 后缀时使用 `spanBetween(valStop, sourceNextKey)`，该区间包含**下一 member 的 prefix 注释**（位于上一 value 与下一 key 之间）。无 sort 时 emit 顺序与源码一致，视觉正确；sort 后 prefix 注释随上一 member 的 suffix 输出，漂到错误 key（如 `// 中文 key` 出现在 `$key` 前、`// unicode` 出现在 `deleted` 前）。行尾 `, //` 注释已修复，但 member 前缀注释锚定仍错误。

## What Changes

- 修复 `memberSuffixForSortedMember`：suffix 区间 MUST NOT 包含 `hiddenLeft(sourceNextKey)` 的 token；下一 member 的 prefix 仅经 `hiddenLeftForSortedMember` emit
- 同步 pretty + sortKeys 路径（若共用 suffix 逻辑）
- 明确 spec：sort 时 member 前缀注释（含 `// unicode`、`// 中文 key` 等）MUST 与所属 key 相邻
- 新增 case fixture 与集成断言；更新 `test.json5.format.sorted.text` 中错位注释

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `json5-api`：补充 sort+compact/pretty 下 member 前缀注释锚定 scenario；细化 suffix 不得吞 prefix 的 requirement
- `integration-tests`：新增 sort prefix comment 小 fixture 断言

## Impact

- **代码**：`src/parser/json5/format-emitter.js`（`memberSuffixForSortedMember`、必要时 suffix 过滤 helper）
- **测试**：`test/run.mjs`、`test/resources/cases/`、`test/resources/out/test.json5.format.sorted.text`
- **API**：非 **BREAKING**；修正 sortKeys 组合下注释锚定
