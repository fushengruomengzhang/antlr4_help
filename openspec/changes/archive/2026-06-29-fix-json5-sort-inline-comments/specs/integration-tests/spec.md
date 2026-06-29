## ADDED Requirements

### Requirement: JSON5 sort inline comment case fixture

The runner SHALL process `test/resources/cases/json5.sort-inline-comment.text` with `json5.format(input, { sortKeys: true, compact: true })` and assert the output contains the substring `"age": 18, // 年龄` on one line.

#### Scenario: sort inline comment comma before comment
- **WHEN** `json5.format` is called with `{ sortKeys: true, compact: true }` on `cases/json5.sort-inline-comment.text`
- **THEN** the case passes asserting output includes `"age": 18, // 年龄`

## MODIFIED Requirements

### Requirement: JSON5 format with sortKeys and compact

The runner SHALL process `test/resources/test.json5.text` with json5 APIs and produce five output files on success. The compact format case SHALL compare output against `test/resources/golden/test.json5.format.compact.text` before writing. The golden file SHALL include the opener-line comment on the `names` triple-quoted field (`''' // 三引号注释`).

#### Scenario: JSON5 format with sortKeys and compact
- **WHEN** json5.format is called with `{ sortKeys: true, compact: true }` on `test.json5.text`
- **THEN** the runner writes the formatted string to `test/resources/out/test.json5.format.sorted.text`
- **AND** sorted output for fields that had inline trailing comments in input SHOULD use `, // comment` on the same line as the value where compact golden does (e.g. `"age": 18, // 年龄`)
