## MODIFIED Requirements

### Requirement: Java8 toApiSchema fixture coverage

The integration runner SHALL process `test/resources/test.java.text` with `api.java8ToApiSchema` and validate output via structure assertions (MUST NOT compare `id` or `parentId` values against golden).

#### Scenario: toApiSchema writes inspectable output

- **WHEN** `api.java8ToApiSchema` succeeds on `test.java.text` with `{ rootClass: 'User' }` (or equivalent default root)
- **THEN** the runner writes pretty-printed JSON to `test/resources/out/test.java.api.json`

#### Scenario: Structure golden match

- **WHEN** a case specifies structure comparison against `test/resources/golden/test.java.api.structure.json` after stripping `id` and `parentId` from actual and expected
- **THEN** the case passes only if normalized structures are deeply equal

#### Scenario: Id uniqueness assert

- **WHEN** `api.java8ToApiSchema` succeeds on `test.java.text`
- **THEN** the case `assert` callback verifies every node has non-empty string `id` and all collected ids are unique

#### Scenario: check semantics on fixture

- **WHEN** `api.java8ToApiSchema` runs on `test.java.text` for root `User`
- **THEN** the `name` field node has `check: true` and the `age` field node has `check: false`

#### Scenario: toApiSchema failure no out write

- **WHEN** `api.java8ToApiSchema` throws (e.g. missing root class)
- **THEN** the case fails and no `test.java.api.json` is written under `test/resources/out/`

#### Scenario: UserP inherits User fields in structure

- **WHEN** `api.java8ToApiSchema` runs on `test.java.text` for root `User`
- **THEN** structure golden 中 `userDetail.userP`（或等价路径）下含来自 `User` 的 field 节点（如 `name`）及 `UserP` 自有 field（如 `id`）

#### Scenario: Self-ref child excludes nested child

- **WHEN** `api.java8ToApiSchema` runs on `test.java.text` for root `User`
- **THEN** `child` List 模板内层 `User` 节点含 `name` 等 field，但 **不含** 嵌套 `child` 字段节点
