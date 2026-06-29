## MODIFIED Requirements

### Requirement: JSON5 fixture coverage

The runner SHALL process `test/resources/test.json5.text` with json5 APIs and produce five output files.

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

#### Scenario: JSON5 format with compact

- **WHEN** json5.format is called with `{ compact: true }` on `test.json5.text`
- **THEN** the runner writes the formatted string to `test/resources/out/test.json5.format.compact.text`
