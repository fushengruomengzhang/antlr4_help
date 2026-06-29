## ADDED Requirements

### Requirement: JSON5 sort compact layout parity case fixture

The runner SHALL process an additional fixture under `test/resources/cases/` for sort+compact layout parity (no whitespace-only lines between members).

#### Scenario: Sort compact gap no blank lines assert
- **WHEN** `JSON5.format` is called with `{ sortKeys: true, compact: true }` on `cases/json5.sort-compact-gap.text`
- **THEN** the case passes asserting output has no whitespace-only lines and preserves inline trailing comments on the same line as values

## MODIFIED Requirements

### Requirement: JSON5 fixture coverage

The runner SHALL process `test/resources/test.json5.text` and write outputs under `test/resources/out/`.

#### Scenario: JSON5 format default

- **WHEN** JSON5.format is called with default options on `test.json5.text`
- **THEN** the runner writes the formatted string to `test/resources/out/test.json5.format.text`

#### Scenario: JSON5 format with sortKeys and compact

- **WHEN** JSON5.format is called with `{ sortKeys: true, compact: true }` on `test.json5.text`
- **THEN** the runner writes the formatted string to `test/resources/out/test.json5.format.sorted.text`
- **AND** the case passes asserting output includes `"age": 18, // 年龄`
- **AND** the case passes asserting output has no whitespace-only lines (layout parity with compact intent)

#### Scenario: JSON5 format with compact golden

- **WHEN** JSON5.format is called with `{ compact: true }` on `test.json5.text` and output matches golden after normalization
- **THEN** the runner writes the formatted string to `test/resources/out/test.json5.format.compact.text`
