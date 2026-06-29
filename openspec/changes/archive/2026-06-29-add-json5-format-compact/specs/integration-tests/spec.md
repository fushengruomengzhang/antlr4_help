## ADDED Requirements

### Requirement: JSON5 compact format fixture coverage

The runner SHALL process `test/resources/test.json5.text` with `json5.format({ compact: true })` and write the output to `test/resources/out/test.json5.format.compact.text`.

#### Scenario: JSON5 compact format output
- **WHEN** json5.format is called with `{ compact: true }` on `test.json5.text`
- **THEN** the runner writes the formatted string to `test/resources/out/test.json5.format.compact.text`
