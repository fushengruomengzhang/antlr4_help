## ADDED Requirements

### Requirement: JSON ANTLR 解析

项目 SHALL 提供 `json.parse(input: string): unknown`，使用 ANTLR 生成的 JSON 语法（非 `JSON.parse`）将输入字符串解析为 JavaScript 值。合法输入 MUST 返回 plain object、array、string、number、boolean 或 null。

#### Scenario: 对象解析
- **WHEN** 对 `{"a":1,"b":"x"}` 调用 `json.parse`
- **THEN** 返回 `{ a: 1, b: "x" }`

#### Scenario: 数组解析
- **WHEN** 对 `[1,2,3]` 调用 `json.parse`
- **THEN** 返回 `[1, 2, 3]`

#### Scenario: 非法 JSON 抛出 ParseError
- **WHEN** 对 `{a:1}`（非标准 JSON）调用 `json.parse`
- **THEN** 抛出 ParseError，且 `language` 为 `'json'`

### Requirement: JSON 解析错误格式统一

JSON 解析失败 MUST 通过 ParseError 抛出，MUST 包含 `line`、`column`、`message`，与 json5、java8 错误形状一致。

#### Scenario: 语法错误含行列
- **WHEN** 对 `[1,]` 调用 `json.parse`
- **THEN** 抛出的 ParseError 包含非零 `line` 与 `column`
