# json5-single-format

## Purpose

Single JSON5 format implementation via `JSON5.format` only. No parallel `JSON5Format` stack or dual expected baselines.

## Requirements

### Requirement: Library exposes format only through JSON5.format

The package SHALL provide JSON5 formatting exclusively via `JSON5.format` on the `JSON5` export. The library SHALL NOT export `JSON5Format`, `JSON5_FORMAT_DEFAULT_OPTIONS`, or any module under `src/parser/json5-format/`.

#### Scenario: Package entry has no JSON5Format export

- **WHEN** a consumer imports from `src/index.js`
- **THEN** `JSON5Format` SHALL NOT be among the exported bindings
- **AND** `JSON5.format` SHALL remain callable with `indent`, `sortKeys`, and `compact` options

#### Scenario: json5-format directories removed

- **WHEN** the repository is inspected after this change
- **THEN** `src/parser/json5-format/` and `src/grammars/json5-format/` SHALL NOT exist

---

### Requirement: Expected baselines use single json5 directory

Fixture format baselines SHALL live under `test/resources/expected/json5/` only. There SHALL be no parallel `expected/json5format/` or `expected/legacy/` tree.

#### Scenario: Single expected tree

- **WHEN** the repository is checked out
- **THEN** `test/resources/expected/json5/` SHALL contain `fixture.default.text`, `fixture.compact.text`, and `fixture.sort-compact.text`
- **AND** no directory named `json5format` SHALL exist under `test/resources/expected/`
