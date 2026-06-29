## MODIFIED Requirements

### Requirement: Small-case fixtures

The runner SHALL support additional fixtures under `test/resources/cases/` for focused regression tests.

#### Scenario: Sort compact no duplicate members

- **WHEN** `JSON5.format` is called with `{ sortKeys: true, compact: true }` on `cases/json5.sort-compact.text`
- **THEN** the case passes assert checks that each member value appears exactly once and `// about b` is preserved

#### Scenario: Sort inline comment comma before comment

- **WHEN** `JSON5.format` is called with `{ sortKeys: true, compact: true }` on `cases/json5.sort-inline-comment.text`
- **THEN** the case passes asserting output includes `"age": 18, // 年龄`

#### Scenario: Sort compact opening comment assert

- **WHEN** `JSON5.format` is called with `{ sortKeys: true, compact: true }` on `cases/json5.sort-compact-opening.text`
- **THEN** the case passes asserting output includes `{ // head`

#### Scenario: Sort compact no blank lines assert

- **WHEN** `JSON5.format` is called with `{ sortKeys: true, compact: true }` on `cases/json5.sort-compact-no-blank.text`
- **THEN** the case passes asserting output does not contain `\n\n`

#### Scenario: Invalid JSON5 expectError

- **WHEN** `JSON5.validate` is called on `cases/json5.invalid.text`
- **THEN** the case passes with `expectError` and `ParseError.language === 'json5'`

### Requirement: JSON5 triple-quote case fixtures

The runner SHALL process additional fixtures under `test/resources/cases/` for triple-quote opener comments and unpaired delimiter errors.

#### Scenario: Triple opener line comment parse assert

- **WHEN** `JSON5.parse` runs on `cases/json5.triple-opener-line.text`
- **THEN** a case passes asserting the parsed value does not contain the opener-line comment text

#### Scenario: Triple unclosed expectError

- **WHEN** `JSON5.validate` runs on `cases/json5.triple-unclosed.text`
- **THEN** the case passes with `expectError` and `ParseError.language === 'json5'`

#### Scenario: Triple delimiter mismatch expectError

- **WHEN** `JSON5.validate` runs on `cases/json5.triple-mismatch.text`
- **THEN** the case passes with `expectError`

### Requirement: JSON5 fixture coverage

The runner SHALL process `test/resources/test.json5.text` with JSON5 APIs and produce five output files on success. The compact format case SHALL compare output against `test/resources/golden/test.json5.format.compact.text` before writing. The golden file SHALL include the opener-line comment on the `names` triple-quoted field (`''' // 三引号注释`).

#### Scenario: JSON5 validate success

- **WHEN** `test.json5.text` is valid JSON5
- **THEN** the runner writes `test/resources/out/test.json5.validate.txt` containing `OK`

#### Scenario: JSON5 parse output

- **WHEN** `JSON5.parse` succeeds on `test.json5.text`
- **THEN** the runner writes pretty-printed JSON to `test/resources/out/test.json5.parse.json`

#### Scenario: JSON5 format default

- **WHEN** `JSON5.format` is called with default options on `test.json5.text`
- **THEN** the runner writes the formatted string to `test/resources/out/test.json5.format.text`

#### Scenario: JSON5 format with sortKeys and compact

- **WHEN** `JSON5.format` is called with `{ sortKeys: true, compact: true }` on `test.json5.text`
- **THEN** the runner writes the formatted string to `test/resources/out/test.json5.format.sorted.text`
- **AND** sorted output for fields that had inline trailing comments in input SHOULD use `, // comment` on the same line as the value where compact golden does (e.g. `"age": 18, // 年龄`)

#### Scenario: JSON5 format with compact golden

- **WHEN** `JSON5.format` is called with `{ compact: true }` on `test.json5.text` and output matches golden after normalization
- **THEN** the runner writes the formatted string to `test/resources/out/test.json5.format.compact.text`

### Requirement: JSON fixture coverage

The runner SHALL process `test/resources/test.json.text` containing valid standard JSON.

#### Scenario: JSON fixture is non-empty

- **WHEN** the change is applied
- **THEN** `test/resources/test.json.text` contains valid JSON (not an empty file)

#### Scenario: JSON parse output

- **WHEN** `JSON4.parse` succeeds on `test.json.text`
- **THEN** the runner writes pretty-printed JSON to `test/resources/out/test.json.parse.json`

#### Scenario: JSON fixture includes numeric string key

- **WHEN** `test.json.text` is applied
- **THEN** the fixture contains a root-level `"1"` string key with value `"数字key"` (standard JSON quoted key, not JSON5 unquoted numeric key)

#### Scenario: JSON parse preserves numeric string key

- **WHEN** `JSON4.parse` succeeds on `test.json.text`
- **THEN** the parse result satisfies `result["1"] === "数字key"`

### Requirement: Java8 fixture coverage

The runner SHALL process `test/resources/test.java.text` with JAVA8 APIs.

#### Scenario: Java8 first class name

- **WHEN** `JAVA8.firstClassName` is called on `test.java.text`
- **THEN** the runner writes the result to `test/resources/out/test.java.firstClassName.txt`

#### Scenario: Java8 signatures output

- **WHEN** `JAVA8.signatures` is called on `test.java.text`
- **THEN** the runner writes pretty-printed FileModel JSON to `test/resources/out/test.java.signatures.json`

### Requirement: Java8 toApiSchema fixture coverage

The integration runner SHALL process `test/resources/test.java.text` with `API.java8ToApiSchema` and validate output via structure assertions (MUST NOT compare `id` or `parentId` values against golden).

#### Scenario: toApiSchema writes inspectable output

- **WHEN** `API.java8ToApiSchema` succeeds on `test.java.text` with `{ rootClass: 'User' }` (or equivalent default root)
- **THEN** the runner writes pretty-printed JSON to `test/resources/out/test.java.api.json`

#### Scenario: Structure golden match

- **WHEN** a case specifies structure comparison against `test/resources/golden/test.java.api.structure.json` after stripping `id` and `parentId` from actual and expected
- **THEN** the case passes only if normalized structures are deeply equal

#### Scenario: Id uniqueness assert

- **WHEN** `API.java8ToApiSchema` succeeds on `test.java.text`
- **THEN** the case `assert` callback verifies every node has non-empty string `id` and all collected ids are unique

#### Scenario: check semantics on fixture

- **WHEN** `API.java8ToApiSchema` runs on `test.java.text` for root `User`
- **THEN** the `name` field node has `check: true` and the `age` field node has `check: false`

#### Scenario: toApiSchema failure no out write

- **WHEN** `API.java8ToApiSchema` throws (e.g. missing root class)
- **THEN** the case fails and no `test.java.api.json` is written under `test/resources/out/`

#### Scenario: UserP inherits User fields in structure

- **WHEN** `API.java8ToApiSchema` runs on `test.java.text` for root `User`
- **THEN** structure golden 中 `userDetail.userP`（或等价路径）下含来自 `User` 的 field 节点（如 `name`）及 `UserP` 自有 field（如 `id`）

#### Scenario: Self-ref child excludes nested child

- **WHEN** `API.java8ToApiSchema` runs on `test.java.text` for root `User`
- **THEN** `child` List 模板内层 `User` 节点含 `name` 等 field，但 **不含** 嵌套 `child` 字段节点
