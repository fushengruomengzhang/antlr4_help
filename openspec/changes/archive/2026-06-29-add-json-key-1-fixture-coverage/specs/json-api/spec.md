## MODIFIED Requirements

### Requirement: JSON ANTLR 解析

项目 SHALL 提供 `json.parse(input: string): unknown`，使用 ANTLR 生成的 JSON 语法（非 `JSON.parse`）将输入字符串解析为 JavaScript 值。合法输入 MUST 返回 plain object、array、string、number、boolean 或 null。

#### Scenario: 对象解析
- **WHEN** 对 `{"a":1,"b":"x"}` 调用 `json.parse`
- **THEN** 返回 `{ a: 1, b: "x" }`

#### Scenario: 数组解析
- **WHEN** 对 `[1,2,3]` 调用 `json.parse`
- **THEN** 返回 `[1, 2, 3]`

#### Scenario: 字符串形态数字 key 解析
- **WHEN** 对 `{"1":"数字key"}` 调用 `json.parse`
- **THEN** 返回对象且 `obj["1"]` 严格等于 `"数字key"`

#### Scenario: 非法 JSON 抛出 ParseError
- **WHEN** 对 `{a:1}`（非标准 JSON）调用 `json.parse`
- **THEN** 抛出 ParseError，且 `language` 为 `'json'`
