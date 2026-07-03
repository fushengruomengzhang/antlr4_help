# test

## Purpose

Define how JSON5 format test baselines are stored, compared during `npm test`, and updated via maintainer scripts.

## Requirements

### Requirement: Fixture format baselines live in expected directory

The test suite SHALL store committed JSON5 format-output baselines under `test/resources/expected/json5/`. Only the main JSON5 fixture (`test/resources/test.json5.text`) SHALL have expected snapshots. Case inputs under `test/resources/cases/` SHALL NOT have expected snapshot files.

#### Scenario: Expected directory structure

- **WHEN** the repository is checked out
- **THEN** `test/resources/expected/json5/` SHALL contain `fixture.default.text`, `fixture.compact.text`, and `fixture.sort-compact.text`
- **AND** no directory named `json5format` or `legacy` SHALL exist under `test/resources/expected/`

#### Scenario: Case inputs use assertions only

- **WHEN** a test runs against a file in `test/resources/cases/`
- **THEN** the test SHALL use inline assertions and SHALL NOT read or write expected snapshot files for that case

#### Scenario: Error cases excluded from expected

- **WHEN** a case represents invalid input (e.g. `json5.invalid.text`, `json5.triple-unclosed.text`, `json5.triple-mismatch.text`)
- **THEN** no corresponding file SHALL exist under `test/resources/expected/`

---

### Requirement: npm test compares runtime output to expected baselines

Running `npm test` SHALL compare `JSON5.format` output for the main fixture against `test/resources/expected/json5/` without writing snapshot files to `test/resources/out/`.

#### Scenario: Fixture default format

- **WHEN** `npm test` runs and `JSON5.format(test.json5.text)` is executed
- **THEN** the result SHALL match `expected/json5/fixture.default.text` after normalization

#### Scenario: Fixture compact format

- **WHEN** `npm test` runs and `JSON5.format(test.json5.text, { compact: true })` is executed
- **THEN** the result SHALL match `expected/json5/fixture.compact.text` after normalization

#### Scenario: Fixture sort compact format

- **WHEN** `npm test` runs and `JSON5.format(test.json5.text, { sortKeys: true, compact: true })` is executed
- **THEN** the result SHALL match `expected/json5/fixture.sort-compact.text` after normalization

#### Scenario: No out directory writes during test

- **WHEN** `npm test` completes successfully
- **THEN** the test scripts SHALL NOT require or populate `test/resources/out/` for pass/fail determination

---

### Requirement: Baselines can be updated via npm script

The project SHALL provide `npm run test:update-expected` (or equivalent documented script) to regenerate fixture expected files from the current `JSON5.format` implementation.

#### Scenario: Update expected baselines

- **WHEN** a maintainer runs the update-expected script after an intentional format output change
- **THEN** all three fixture baseline files under `expected/json5/` SHALL be overwritten with current formatter output

---

### Requirement: Module spec provides Simplified Chinese mirror document

`openspec/specs/test/spec.zh.md` SHALL fully mirror `spec.md` in Simplified Chinese with the same preservation rules as the json4 documentation requirement.

#### Scenario: test mirror exists

- **WHEN** the repository is checked out
- **THEN** `openspec/specs/test/spec.zh.md` SHALL exist

