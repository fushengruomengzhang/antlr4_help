## MODIFIED Requirements

### Requirement: JSON5 fixture coverage

The runner SHALL process `test/resources/test.json5.text` with json5 APIs and produce five output files on success. The compact format case SHALL compare output against `test/resources/golden/test.json5.format.compact.text` before writing. The golden file SHALL include the opener-line comment on the `names` triple-quoted field (`''' // 三引号注释`).

#### Scenario: JSON5 validate success

- **WHEN** `test.json5.text` is valid JSON5
- **THEN** the runner writes `test/resources/out/test.json5.validate.txt` containing `OK`

#### Scenario: JSON5 parse output

- **WHEN** json5.parse succeeds on `test.json5.text`
- **THEN** the runner writes pretty-printed JSON to `test/resources/out/test.json5.parse.json`

#### Scenario: JSON5 format default

- **WHEN** json5.format is called with default options on `test.json5.text`
- **THEN** the runner writes the formatted string to `test/resources/out/test.json5.format.text`

#### Scenario: JSON5 format with sortKeys and compact

- **WHEN** json5.format is called with `{ sortKeys: true, compact: true }` on `test.json5.text`
- **THEN** the runner writes the formatted string to `test/resources/out/test.json5.format.sorted.text`

#### Scenario: JSON5 format with compact golden

- **WHEN** json5.format is called with `{ compact: true }` on `test.json5.text` and output matches golden after normalization
- **THEN** the runner writes the formatted string to `test/resources/out/test.json5.format.compact.text`

## ADDED Requirements

### Requirement: JSON5 triple-quote case fixtures

The runner SHALL process additional fixtures under `test/resources/cases/` for triple-quote opener comments and unpaired delimiter errors.

#### Scenario: Triple opener line comment parse assert

- **WHEN** json5.parse runs on `cases/json5.triple-opener-line.text`
- **THEN** a case passes asserting the parsed value does not contain the opener-line comment text

#### Scenario: Triple unclosed expectError

- **WHEN** json5.validate runs on `cases/json5.triple-unclosed.text`
- **THEN** the case passes with `expectError` and `ParseError.language === 'json5'`

#### Scenario: Triple delimiter mismatch expectError

- **WHEN** json5.validate runs on `cases/json5.triple-mismatch.text`
- **THEN** the case passes with `expectError`
