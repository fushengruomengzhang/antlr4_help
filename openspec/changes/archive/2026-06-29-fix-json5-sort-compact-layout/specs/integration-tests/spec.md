## ADDED Requirements

### Requirement: JSON5 sort compact layout case fixtures

The runner SHALL process additional fixtures under `test/resources/cases/` for sort+compact layout: container opening comment on same line as `{`, and no blank lines between members.

#### Scenario: Sort compact opening comment assert
- **WHEN** `json5.format` is called with `{ sortKeys: true, compact: true }` on `cases/json5.sort-compact-opening.text`
- **THEN** the case passes asserting output includes `{ // head`

#### Scenario: Sort compact no blank lines assert
- **WHEN** `json5.format` is called with `{ sortKeys: true, compact: true }` on `cases/json5.sort-compact-no-blank.text`
- **THEN** the case passes asserting output does not contain `\n\n`
