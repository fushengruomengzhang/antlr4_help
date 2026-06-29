## Why

集成测试中 `test.json5.text` 含数字 key `1: "数字key"`，但 `test.json.text` 未覆盖等价的字符串 key `"1"`。调用 `json.parse(test.json.text)` 时 `obj["1"]` 为 `undefined`，易被误判为 parser 丢值。需要在 JSON fixture 与 spec 中明确覆盖「字符串形态的数字 key」场景，与 JSON5 数字 key 用例形成对照。

## What Changes

- 在 `test/resources/test.json.text` 增加 `"1": "数字key"` 字段（标准 JSON 引号字符串 key）
- 在 `json-api` spec 增加字符串 key `"1"` 的解析场景
- 在 `integration-tests` spec 明确 JSON fixture 须包含数字字符串 key 且 parse 结果可访问 `obj["1"]`
- 集成 runner 增加对 `obj["1"]` 的断言（或文档化人工检查点），防止回归

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `json-api`: 增加 `"1"` 字符串 key 的对象解析场景
- `integration-tests`: 明确 JSON fixture 须覆盖数字字符串 key 及 parse 结果断言

## Impact

- **测试数据**: `test/resources/test.json.text`
- **测试 runner**: `test/run.mjs`（可选断言）
- **Spec**: `openspec/specs/json-api/spec.md`、`openspec/specs/integration-tests/spec.md`（经 delta 合并）
- **API/语法**: 无变更；`json.parse` 已支持 `"1"` key，仅补覆盖与文档
