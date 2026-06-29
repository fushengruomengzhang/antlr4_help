## ADDED Requirements

### Requirement: Java8 toApiSchema fixture coverage

The integration runner SHALL process `test/resources/test.java.text` with `java8.toApiSchema` and validate output via structure assertions (MUST NOT compare `id` or `parentId` values against golden).

#### Scenario: toApiSchema writes inspectable output

- **WHEN** `java8.toApiSchema` succeeds on `test.java.text` with `{ rootClass: 'User' }` (or equivalent default root)
- **THEN** the runner writes pretty-printed JSON to `test/resources/out/test.java.api.json`

#### Scenario: Structure golden match

- **WHEN** a case specifies structure comparison against `test/resources/golden/test.java.api.structure.json` after stripping `id` and `parentId` from actual and expected
- **THEN** the case passes only if normalized structures are deeply equal

#### Scenario: Id uniqueness assert

- **WHEN** `toApiSchema` succeeds on `test.java.text`
- **THEN** the case `assert` callback verifies every node has non-empty string `id` and all collected ids are unique

#### Scenario: check semantics on fixture

- **WHEN** `toApiSchema` runs on `test.java.text` for root `User`
- **THEN** the `name` field node has `check: true` and the `age` field node has `check: false`

#### Scenario: toApiSchema failure no out write

- **WHEN** `toApiSchema` throws (e.g. missing root class)
- **THEN** the case fails and no `test.java.api.json` is written under `test/resources/out/`
