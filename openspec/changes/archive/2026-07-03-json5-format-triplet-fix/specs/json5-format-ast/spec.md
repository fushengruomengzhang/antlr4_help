## MODIFIED Requirements

### Requirement: Format output behavior unchanged for public options

Pretty mode (`compact: false`) SHALL emit structural line breaks such that trailing inline comments that were on a separate line in the golden `fixture.default.text` baseline remain on their own indented line after the value, not merged onto the same line as the value.

Compact mode (`compact: true`) SHALL match the golden `fixture.compact.text` baseline byte-for-byte after bug fixes, except where superseded by the sortKeys prefix-order requirement in `json5-format-triplet-anchor`.

#### Scenario: Pretty default matches golden baseline

- **WHEN** `JSON5.format(input)` is called with default options on the comment-heavy fixture
- **THEN** output SHALL match `test/resources/expected/json5/fixture.default.text` byte-for-byte

#### Scenario: Compact matches golden baseline

- **WHEN** `JSON5.format(input, { compact: true })` is called on the comment-heavy fixture
- **THEN** output SHALL match `test/resources/expected/json5/fixture.compact.text` byte-for-byte

#### Scenario: Triple-quote opener comment in output

- **WHEN** input contains `''' // 三引号注释` before string body
- **THEN** pretty/compact output SHALL preserve `// 三引号注释` on the opener line in the formatted string literal emission matching the golden compact baseline
