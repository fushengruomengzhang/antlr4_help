## ADDED Requirements

### Requirement: JSON5 compact 空容器缩进回归用例

The runner SHALL process an additional fixture under `test/resources/cases/` for compact format empty object/array closing-brace indent when `indent.size` differs from source layout.

#### Scenario: Compact empty object indent assert
- **WHEN** `JSON5.format` is called with `{ compact: true, indent: { type: 'space', size: 4 } }` on `cases/json5.compact-empty-object-indent.text`
- **THEN** the case passes asserting `"user": { //` 行与下一行 `},` 具有相同前导空格数，且 golden 匹配 `test/resources/golden/json5.compact-empty-object-indent.text`
