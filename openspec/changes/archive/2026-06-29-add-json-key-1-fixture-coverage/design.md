## Context

- `test.json5.text` 第 10 行有 JSON5 数字 key：`1: "数字key"`
- `test.json.text` 为标准 JSON fixture，由 `json.parse` 处理，当前无 `"1"` 字段
- `json.parse('{"1":"x"}')` 已正确工作；问题在测试覆盖与 spec 缺失，非 parser 实现缺陷
- 集成 runner（`test/run.mjs`）当前只写输出文件，不对 parse 结果做字段级断言

## Goals / Non-Goals

**Goals:**

- JSON fixture 包含与 JSON5 用例语义对齐的 `"1": "数字key"`（标准 JSON 引号形式）
- Spec 明确 `json.parse` 对字符串 key `"1"` 的行为
- 集成测试能捕获 `obj["1"]` 回归（自动断言或明确检查点）

**Non-Goals:**

- 修改 JSON 语法或 `json.parse` 实现以支持无引号数字 key（属 JSON5 范畴）
- 修改 JSON5 fixture 或 `json5.parse` 行为
- 为所有 key 形态做 exhaustive 矩阵测试

## Decisions

### 1. Fixture 字段位置与形态

在 `test.json.text` 根对象**首位**（或紧跟 `{` 后）添加 `"1": "数字key"`，与 `test.json5.text` 中 `1: "数字key"` 的位置语义对齐。

- **理由**: 便于对照两个 fixture；首位字段在人工 diff 时最显眼
- **替代**: 放在 `"name"` 之后 — 与 json5 顺序不一致，放弃

### 2. 使用标准 JSON 引号 key，不用 JSON5 数字 key

JSON fixture 保持纯标准 JSON（RFC 8259），key 写为 `"1"` 而非 `1`。

- **理由**: `test.json.text` 的设计约束是「无 JSON5 特性」；`"1"` 是合法 JSON 字符串 key
- **替代**: 把 json5 内容混入 json fixture — 违反 fixture 分层

### 3. Runner 增加轻量断言

在 `test/run.mjs` 的 json parse case 中，parse 成功后断言 `result["1"] === "数字key"`；失败则 stderr 报错并写 error sidecar。

- **理由**: 输出文件在 `.gitignore` 中，仅靠人工看 `out/` 易漏；断言可立即失败
- **替代**: 仅更新 fixture + spec，不加断言 — 回归防护弱，作为 fallback 可接受但不首选

### 4. Spec 变更方式

- `json-api`: **MODIFIED**「JSON ANTLR 解析」requirement，增加字符串 key `"1"` scenario
- `integration-tests`: **MODIFIED**「JSON fixture coverage」requirement，增加数字字符串 key 场景

## Risks / Trade-offs

- **[Risk] 与 JSON5 用例重复** → 两者测试不同 API 与 key 形态（JSON5 无引号 vs JSON 引号），文档在 proposal/design 中说明对照关系
- **[Risk] 断言过窄** → 只断言 `"1"` 一个字段，不扩展为通用 property 测试框架
- **[Trade-off] 不修改 parser 代码** → 若未来 parser 真出 bug，仅靠 fixture 可能不够；可加一条单元级 smoke test（可选，非本 change 必须）

## Migration Plan

1. 更新 `test.json.text` 添加 `"1"` 字段
2. 更新 `test/run.mjs` 断言
3. 运行 `npm test` 验证通过
4. 无 API 破坏性变更，无需 rollback 策略

## Open Questions

- 无
