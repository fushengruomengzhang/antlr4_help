## ADDED Requirements

### Requirement: JSON5 sort prefix comment case fixtures

The runner SHALL process additional fixtures under `test/resources/cases/` for sort+compact member prefix comment anchoring.

#### Scenario: Sort prefix comment 中文 key assert
- **WHEN** `json5.format` is called with `{ sortKeys: true, compact: true }` on `cases/json5.sort-prefix-comment.text`
- **THEN** the case passes asserting `// 中文 key` appears before `中文字段` and not before `"$key"`

#### Scenario: Sort prefix comment unicode assert
- **WHEN** `json5.format` is called with `{ sortKeys: true, compact: true }` on `cases/json5.sort-prefix-unicode.text`
- **THEN** the case passes asserting `// unicode` appears before `"unicode"` and not before `"a"` or `"b"`
