## Why

`format({ sortKeys: true, compact: true })` 在 compact 路径使用 `spanBetween(valStop, nextKey)` 计算 member 后缀，但 sortKeys 重排后 emit 顺序与源码 token 顺序不一致，导致 member 重复 emit、注释暴增（大 fixture 上 117→657 条）。集成测试 `test.json5.format.sorted.text` 仅用 `{ sortKeys: true }`（pretty 模式），产物松散且与用户期望的紧凑 sorted 输出不符。

## What Changes

- 修复 `formatObjectCompact` / `formatArrayCompact`：当 `sortKeys: true` 时改用 member 锚定的 `hiddenLeft`/`hiddenRight`，不再用 `spanBetween` 连到排序后的下一项 key
- `sortKeys: false` 的 compact 路径保持现有 `spanBetween` 逻辑不变
- 集成 runner 将 sorted 用例改为 `json5.format(input, { sortKeys: true, compact: true })`
- 补充 sort+compact 的 spec scenario（无重复 member、注释条数不变）

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `json5-api`：明确 compact+sortKeys 时注释锚定与 member emit 语义；补充防重复 scenario
- `integration-tests`：sorted fixture 调用改为 `{ sortKeys: true, compact: true }`

## Impact

- **代码**：`src/parser/json5/format-emitter.js`
- **测试**：`test/run.mjs`、`test/resources/out/test.json5.format.sorted.text` 快照更新
- **API**：非 **BREAKING**；`sortKeys` alone 行为不变；修复 `sortKeys+compact` 组合
