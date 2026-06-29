## Purpose

Integration runner that reads fixture files under `test/resources/`, invokes public parsing APIs, and writes inspectable outputs to `test/resources/out/`.

## Requirements

### Requirement: npm test runs integration runner

The project SHALL provide an npm script `test` that executes `node test/run.mjs` and processes all fixture files under `test/resources/`.

#### Scenario: Test script invocation

- **WHEN** the user runs `npm test`
- **THEN** Node executes `test/run.mjs` without requiring Java or ANTLR regeneration

### Requirement: Runner reads fixtures and writes outputs

The integration runner SHALL read text fixtures from `test/resources/*.text`, invoke the public parsing APIs, and write results to `test/resources/out/`.

#### Scenario: Output directory creation

- **WHEN** `test/run.mjs` starts and `test/resources/out/` does not exist
- **THEN** the runner creates `test/resources/out/` recursively before writing files

#### Scenario: Generated outputs are gitignored

- **WHEN** the change is applied
- **THEN** `.gitignore` includes `test/resources/out/` so generated files are not committed

### Requirement: JSON5 fixture coverage

The runner SHALL process `test/resources/test.json5.text` with json5 APIs and produce four output files.

#### Scenario: JSON5 validate success

- **WHEN** `test.json5.text` is valid JSON5
- **THEN** the runner writes `test/resources/out/test.json5.validate.txt` containing `OK`

#### Scenario: JSON5 parse output

- **WHEN** json5.parse succeeds on `test.json5.text`
- **THEN** the runner writes pretty-printed JSON to `test/resources/out/test.json5.parse.json`

#### Scenario: JSON5 format default

- **WHEN** json5.format is called with default options on `test.json5.text`
- **THEN** the runner writes the formatted string to `test/resources/out/test.json5.format.text`

#### Scenario: JSON5 format with sortKeys

- **WHEN** json5.format is called with `{ sortKeys: true }` on `test.json5.text`
- **THEN** the runner writes the formatted string to `test/resources/out/test.json5.format.sorted.text`

### Requirement: JSON fixture coverage

The runner SHALL process `test/resources/test.json.text` containing valid standard JSON.

#### Scenario: JSON fixture is non-empty

- **WHEN** the change is applied
- **THEN** `test/resources/test.json.text` contains valid JSON (not an empty file)

#### Scenario: JSON parse output

- **WHEN** json.parse succeeds on `test.json.text`
- **THEN** the runner writes pretty-printed JSON to `test/resources/out/test.json.parse.json`

### Requirement: Java8 fixture coverage

The runner SHALL process `test/resources/test.java.text` with java8 APIs.

#### Scenario: Java8 first class name

- **WHEN** java8.firstClassName is called on `test.java.text`
- **THEN** the runner writes the result to `test/resources/out/test.java.firstClassName.txt`

#### Scenario: Java8 signatures output

- **WHEN** java8.signatures is called on `test.java.text`
- **THEN** the runner writes pretty-printed FileModel JSON to `test/resources/out/test.java.signatures.json`

### Requirement: Runner continues on per-case errors

If a single API call throws ParseError or other errors, the runner SHALL record the error and continue remaining cases.

#### Scenario: Error written to sidecar file

- **WHEN** an API call throws an error for a fixture
- **THEN** the runner writes `{ language, line, column, message }` to a corresponding `*.error.json` file under `test/resources/out/` and logs the failure to stderr
