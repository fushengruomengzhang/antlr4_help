## MODIFIED Requirements

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
