## ADDED Requirements

### Requirement: SLL 预测模式与 LL 回退

共享解析管线 `runParsePipeline` SHALL 在调用入口规则前将 Parser 预测模式设为 SLL（`PredictionMode.SLL`）；若 parse 抛出异常或产生需回退的预测失败，SHALL reset token stream 与 parser 后以 LL 模式（`PredictionMode.LL`）重试一次。成功路径的 CST 与错误路径的 ParseError MUST 与仅使用 LL 模式时语义一致。

#### Scenario: 合法 JSON4 输入 SLL 成功
- **WHEN** 对合法标准 JSON 字符串调用 `JSON4.parse`
- **THEN** 返回与优化前相同的 JavaScript 值且不抛出异常

#### Scenario: 合法 JSON5 输入 SLL 成功
- **WHEN** 对合法 JSON5 字符串调用 `JSON5.parse`
- **THEN** 返回与优化前相同的 JavaScript 值且不抛出异常

#### Scenario: 非法输入仍抛出 ParseError
- **WHEN** 对语法非法字符串调用 `JSON5.validate`
- **THEN** 抛出 ParseError，且 `language`、`line`、`column`、`message` 字段均存在

#### Scenario: Java8 合法输入 SLL 或回退后成功
- **WHEN** 对 `test/resources/test.java.text` 调用 `JAVA8.signatures`
- **THEN** 返回非空 `types` 数组且不抛出异常
