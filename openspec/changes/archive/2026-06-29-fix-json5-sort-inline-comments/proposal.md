## Why

`format({ sortKeys: true })` 在重排 member 后，行尾 `//` 注释（源码形态为 `value, // comment`）会被错误锚定到下一 member 的 `hiddenLeft`，且 emit 顺序为「value → 注释 → 逗号」，导致注释脱离 value、逗号出现在注释之后。这与 compact 无 sort 时的 golden 风格（`"age": 18, // 年龄`）不一致，也使 `test.json5.format.sorted.text` 大量行尾注释被拆成独立行。

## What Changes

- 修复 `formatObjectCompact` / `formatObjectPretty`（及 array 同类路径）：`sortKeys: true` 时将「逗号后的行尾注释」锚定到**前一个 member**，输出规范为 `value, // comment`（非末项）或 `value // comment`（末项，无尾逗号）
- 区分 member 注释类型：key 前注释（`hiddenLeft(key)`）vs 逗号后行尾注释（member 后缀），排序后各自随正确 member 移动
- 补充 spec scenario 覆盖 sort+compact、sort+pretty 的行尾注释同行与逗号顺序
- 更新 `test.json5.format.sorted.text` 及相关 case 快照/断言

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `json5-api`：明确 sortKeys 下行尾 inline 注释的锚定与 `, //` 输出格式；补充 object/array 相关 scenario
- `integration-tests`：sorted 快照语义对齐新格式；补充 sort+inline-comment 小 fixture 断言

## Impact

- **代码**：`src/parser/json5/format-emitter.js`（member 后缀收集与 emit 顺序）
- **测试**：`test/run.mjs`、`test/resources/cases/`、`test/resources/out/test.json5.format.sorted.text`
- **API**：非 **BREAKING**；修复 sortKeys 组合下的输出布局，与已有 compact golden 风格对齐
