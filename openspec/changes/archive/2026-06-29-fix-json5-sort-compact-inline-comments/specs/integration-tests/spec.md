## ADDED Requirements

### Requirement: JSON5 sort section inline case fixture

The runner SHALL process an additional fixture under `test/resources/cases/` for sort+compact trailing inline preservation when the next member has a section prefix comment.

#### Scenario: Sort section inline assert
- **WHEN** `JSON5.format` is called with `{ sortKeys: true, compact: true }` on `cases/json5.sort-section-inline.text`
- **THEN** the case passes asserting output includes `"age": 18, // 年龄` and `"score": 99.5, // 分数`

## MODIFIED Requirements

### Requirement: JSON5 fixture coverage

The runner SHALL process `test/resources/test.json5.text` and write outputs under `test/resources/out/`.

#### Scenario: JSON5 format default

- **WHEN** JSON5.format is called with default options on `test.json5.text`
- **THEN** the runner writes the formatted string to `test/resources/out/test.json5.format.text`

#### Scenario: JSON5 format with sortKeys and compact

- **WHEN** JSON5.format is called with `{ sortKeys: true, compact: true }` on `test.json5.text`
- **THEN** the runner writes the formatted string to `test/resources/out/test.json5.format.sorted.text`
- **AND** the case passes asserting output includes `"age": 18, // 年龄` (inline trailing comment preserved on sorted+compact path)

#### Scenario: JSON5 format with compact golden

- **WHEN** JSON5.format is called with `{ compact: true }` on `test.json5.text` and output matches golden after normalization
- **THEN** the runner writes the formatted string to `test/resources/out/test.json5.format.compact.text`
