## ADDED Requirements

### Requirement: Fixture format baselines live in expected directory

The test suite SHALL store committed format-output baselines under `test/resources/expected/`. Only the main JSON5 fixture (`test.json5.text`) SHALL have expected snapshots. Case inputs under `test/resources/cases/` SHALL NOT have expected snapshot files.

#### Scenario: Expected directory structure

- **WHEN** the repository is checked out
- **THEN** `test/resources/expected/legacy/json5/` and `test/resources/expected/json5format/json5/` SHALL each contain `fixture.default.text`, `fixture.compact.text`, and `fixture.sort-compact.text`

#### Scenario: Case inputs use assertions only

- **WHEN** a test runs against a file in `test/resources/cases/`
- **THEN** the test SHALL use inline assertions and SHALL NOT read or write expected snapshot files for that case

#### Scenario: Error cases excluded from expected

- **WHEN** a case represents invalid input (e.g. `json5.invalid.text`, `json5.triple-unclosed.text`, `json5.triple-mismatch.text`)
- **THEN** no corresponding file SHALL exist under `test/resources/expected/`

---

### Requirement: npm test compares runtime output to expected baselines

Running `npm test` SHALL compare legacy JSON5 format output for the main fixture against `expected/legacy/json5/` and JSON5Format format output against `expected/json5format/json5/` without writing snapshot files to `test/resources/out/`.

#### Scenario: Legacy fixture default format

- **WHEN** `npm test` runs and legacy `JSON5.format(test.json5.text)` is executed
- **THEN** the result SHALL match `expected/legacy/json5/fixture.default.text` after normalization

#### Scenario: JSON5Format fixture compact format

- **WHEN** `npm test` runs and `JSON5Format.format(test.json5.text, { compact: true })` is executed
- **THEN** the result SHALL match `expected/json5format/json5/fixture.compact.text` after normalization

#### Scenario: No out directory writes during test

- **WHEN** `npm test` completes successfully
- **THEN** the test scripts SHALL NOT require or populate `test/resources/out/` for pass/fail determination

---

### Requirement: Baselines can be updated via npm script

The project SHALL provide `npm run test:update-expected` to regenerate all fixture expected files from the current format implementations.

#### Scenario: Update expected baselines

- **WHEN** a maintainer runs `npm run test:update-expected` after an intentional format output change
- **THEN** all six fixture baseline files under `expected/legacy/json5/` and `expected/json5format/json5/` SHALL be overwritten with current formatter output
