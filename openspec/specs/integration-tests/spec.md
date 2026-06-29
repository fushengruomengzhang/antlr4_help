## Purpose

Integration runner that reads fixture files under `test/resources/`, invokes public parsing APIs, validates results via assertions and golden files, and writes inspectable outputs to `test/resources/out/` for passing cases only.

## Requirements

### Requirement: npm test runs integration runner

The project SHALL provide an npm script `test` that executes `node test/run.mjs` and processes all fixture files under `test/resources/`.

#### Scenario: Test script invocation

- **WHEN** the user runs `npm test`
- **THEN** Node executes `test/run.mjs` without requiring Java or ANTLR regeneration

### Requirement: Runner clears output directory on start

The integration runner SHALL clear all files in `test/resources/out/` at the start of each run (after ensuring the directory exists). SHALL NOT delete `test/resources/golden/` or fixture files.

#### Scenario: Fresh out directory each run

- **WHEN** `test/run.mjs` starts
- **THEN** `test/resources/out/` exists and contains no files from a previous run before any case writes

### Requirement: Runner reads fixtures and writes outputs

The integration runner SHALL read text fixtures from `test/resources/*.text` and `test/resources/cases/*.text`, invoke the public parsing APIs, and write results to `test/resources/out/` **only for cases that pass all checks**. Failed cases MUST NOT write any file under `test/resources/out/`.

#### Scenario: Output directory creation

- **WHEN** `test/run.mjs` starts and `test/resources/out/` does not exist
- **THEN** the runner creates `test/resources/out/` recursively before writing files

#### Scenario: Generated outputs are gitignored

- **WHEN** the change is applied
- **THEN** `.gitignore` includes `test/resources/out/` so generated files are not committed

#### Scenario: Passed case writes output

- **WHEN** a case passes all checks and has an `outputName`
- **THEN** the runner writes the result to `test/resources/out/<outputName>`

### Requirement: Runner assertions and golden comparison

The integration runner SHALL support per-case validation via `assert` callbacks, `golden` file comparison against `test/resources/golden/`, and `expectError` with optional `assertError` for expected `ParseError`. Golden comparison SHALL apply text normalization (collapse consecutive blank lines, ensure single trailing newline) before comparing. A case passes only when API execution and all configured checks succeed.

#### Scenario: Golden match passes

- **WHEN** a case specifies `golden: 'test.json5.format.compact.text'` and normalized actual output equals the golden file
- **THEN** the case passes and actual output is written to `test/resources/out/test.json5.format.compact.text`

#### Scenario: Golden mismatch fails without writing out

- **WHEN** normalized actual output differs from the golden file
- **THEN** the case fails, no file is written under `test/resources/out/` for that case, and stderr reports a golden mismatch with diff summary

#### Scenario: Inline assert passes

- **WHEN** a case `assert` callback completes without throwing
- **THEN** the case passes and output is written if `outputName` is set

#### Scenario: expectError passes without out

- **WHEN** a case sets `expectError: true` and the API throws `ParseError` satisfying `assertError`
- **THEN** the case passes and no output file is written

### Requirement: Runner non-zero exit on failure

The integration runner SHALL exit with code 1 if any case fails; SHALL exit 0 only when all cases pass.

#### Scenario: All cases pass

- **WHEN** every case passes
- **THEN** the process exits with code 0

#### Scenario: Any case fails

- **WHEN** at least one case fails
- **THEN** the process exits with code 1

### Requirement: Golden files directory

Expected outputs for golden comparison SHALL live under `test/resources/golden/` and SHALL be tracked in git. The file `test/resources/target.json5.format.text` SHALL be migrated to `test/resources/golden/test.json5.format.compact.text`.

#### Scenario: Compact format golden location

- **WHEN** the change is applied
- **THEN** `test/resources/golden/test.json5.format.compact.text` exists and `test/resources/target.json5.format.text` is removed

### Requirement: Small-case fixtures

The runner SHALL support additional fixtures under `test/resources/cases/` for focused regression tests.

#### Scenario: Sort compact no duplicate members

- **WHEN** `json5.format` is called with `{ sortKeys: true, compact: true }` on `cases/json5.sort-compact.text`
- **THEN** the case passes assert checks that each member value appears exactly once and `// about b` is preserved

#### Scenario: Invalid JSON5 expectError

- **WHEN** `json5.validate` is called on `cases/json5.invalid.text`
- **THEN** the case passes with `expectError` and `ParseError.language === 'json5'`

### Requirement: JSON5 triple-quote case fixtures

The runner SHALL process additional fixtures under `test/resources/cases/` for triple-quote opener comments and unpaired delimiter errors.

#### Scenario: Triple opener line comment parse assert

- **WHEN** json5.parse runs on `cases/json5.triple-opener-line.text`
- **THEN** a case passes asserting the parsed value does not contain the opener-line comment text

#### Scenario: Triple unclosed expectError

- **WHEN** json5.validate runs on `cases/json5.triple-unclosed.text`
- **THEN** the case passes with `expectError` and `ParseError.language === 'json5'`

#### Scenario: Triple delimiter mismatch expectError

- **WHEN** json5.validate runs on `cases/json5.triple-mismatch.text`
- **THEN** the case passes with `expectError`

### Requirement: JSON5 fixture coverage

The runner SHALL process `test/resources/test.json5.text` with json5 APIs and produce five output files on success. The compact format case SHALL compare output against `test/resources/golden/test.json5.format.compact.text` before writing. The golden file SHALL include the opener-line comment on the `names` triple-quoted field (`''' // 三引号注释`).

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

#### Scenario: JSON5 format with compact golden

- **WHEN** json5.format is called with `{ compact: true }` on `test.json5.text` and output matches golden after normalization
- **THEN** the runner writes the formatted string to `test/resources/out/test.json5.format.compact.text`

### Requirement: JSON fixture coverage

The runner SHALL process `test/resources/test.json.text` containing valid standard JSON.

#### Scenario: JSON fixture is non-empty

- **WHEN** the change is applied
- **THEN** `test/resources/test.json.text` contains valid JSON (not an empty file)

#### Scenario: JSON parse output

- **WHEN** json.parse succeeds on `test.json.text`
- **THEN** the runner writes pretty-printed JSON to `test/resources/out/test.json.parse.json`

#### Scenario: JSON fixture includes numeric string key

- **WHEN** `test.json.text` is applied
- **THEN** the fixture contains a root-level `"1"` string key with value `"数字key"` (standard JSON quoted key, not JSON5 unquoted numeric key)

#### Scenario: JSON parse preserves numeric string key

- **WHEN** json.parse succeeds on `test.json.text`
- **THEN** the parse result satisfies `result["1"] === "数字key"`

### Requirement: Java8 fixture coverage

The runner SHALL process `test/resources/test.java.text` with java8 APIs.

#### Scenario: Java8 first class name

- **WHEN** java8.firstClassName is called on `test.java.text`
- **THEN** the runner writes the result to `test/resources/out/test.java.firstClassName.txt`

#### Scenario: Java8 signatures output

- **WHEN** java8.signatures is called on `test.java.text`
- **THEN** the runner writes pretty-printed FileModel JSON to `test/resources/out/test.java.signatures.json`

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

### Requirement: Runner continues on per-case errors

If a single case fails (API error, assertion failure, or golden mismatch), the runner SHALL log the failure to stderr and continue remaining cases. SHALL NOT write `*.error.json` sidecar files under `test/resources/out/`.

#### Scenario: Failure reported to stderr only

- **WHEN** a case fails for any reason
- **THEN** the runner logs the failure to stderr and does not write any file for that case under `test/resources/out/`
