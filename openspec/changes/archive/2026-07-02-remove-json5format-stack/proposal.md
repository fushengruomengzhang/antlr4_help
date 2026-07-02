## Why

项目存在两套并行的 JSON5 format 实现：`JSON5.format`（legacy，`format-emitter.js`）与 `JSON5Format.format`（document grammar 独立栈）。benchmark 显示 legacy 在小对象上更快、代码量更少，大对象两者持平；双轨维护成本高（~3800 行独立 grammar + parser + 测试）。Explore 阶段已决定只保留 legacy 单轨，删除 JSON5Format 栈。

## What Changes

- **BREAKING**：删除 `JSON5Format` 与 `JSON5_FORMAT_DEFAULT_OPTIONS` 公共导出
- 删除 `src/parser/json5-format/` 与 `src/grammars/json5-format/` 全部文件
- 删除 `test/json5-format-standalone.mjs`、`test/expected-diff.mjs`
- 删除 `test/resources/expected/json5format/`；将 `expected/legacy/json5/` 扁平化为 `expected/json5/`
- 精简 `test/update-expected.mjs`、`scripts/bench-json5.mjs`、`scripts/generate.sh`
- 将有价值的 standalone 断言（注释不重复、三引号 round-trip、空对象 compact）迁入 `test/run.mjs`
- `npm test` 仅运行 `run.mjs`（及可选精简 smoke）
- 保留 `JSON5.validate` / `JSON5.parse` / `JSON5.format` 不变

## Capabilities

### New Capabilities

- `json5-single-format`: 单一 JSON5 format 实现与测试布局（无 JSON5Format 双轨）

### Modified Capabilities

- `test-expected-layout`（change delta）：expected 目录仅保留一套 `json5/` baseline，移除 json5format 双轨对比

### Removed Capabilities

- `json5-format-standalone`: 独立 JSON5Format grammar、parser 管线与导出（整 capability 移除）

## Impact

- **删除**：~3800 行 json5-format 相关源码与测试
- **不变**：`src/parser/json5/`、`grammars/json5/`、JSON5 对外 API（除移除 JSON5Format export）
- **OpenSpec**：`json5-format-*` 系列 change 标记 superseded；主 spec `json5-format-ast` 仍描述 legacy format 行为
