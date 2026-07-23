## REMOVED Requirements

### Requirement: Parse pipeline retries with LL after SLL bail

**Reason**: Universal SLL+Bail→LL fallback is replaced by per-language prediction (`java8` = LL, `json5`/`json` = SLL) with a single parse attempt.

**Migration**: Rely on language-selected prediction mode; do not expect a second LL pass after SLL bail.

### Requirement: Stale SLL diagnostics MUST NOT surface after successful LL

**Reason**: There is no SLL→LL retry, so stale SLL diagnostics from a failed first attempt no longer apply.

**Migration**: None.

## ADDED Requirements

### Requirement: Prediction mode is selected by language

The shared parse pipeline (`runParsePipeline`) MUST select ANTLR prediction mode from the `language` option: when `language` is `'java8'`, the pipeline MUST use LL prediction with the default error strategy and MUST NOT use BailErrorStrategy or a second parse attempt; when `language` is `'json5'` or `'json'`, the pipeline MUST use SLL prediction with the default error strategy and MUST NOT use BailErrorStrategy or a second parse attempt.

#### Scenario: java8 uses a single LL parse

- **WHEN** `JAVA8.firstClassName` is invoked (pipeline `language` is `'java8'`)
- **THEN** the compilation unit SHALL be parsed with LL prediction
- **AND** the pipeline SHALL NOT retry the entry rule after an SLL bail

#### Scenario: json5 uses a single SLL parse

- **WHEN** `JSON5.parse` is invoked (pipeline `language` is `'json5'`)
- **THEN** the input SHALL be parsed with SLL prediction
- **AND** the pipeline SHALL NOT apply BailErrorStrategy or an LL retry

### Requirement: java8 accepts two-segment qualified imports under LL

With `language` `'java8'` and LL prediction, valid compilation units that use two-segment type imports (including Lombok-style `import lombok.Data;`) MUST parse successfully. Truly illegal input MUST still yield `ParseError` with `language` `'java8'`.

#### Scenario: Two-segment Java import succeeds

- **WHEN** `JAVA8.firstClassName` is called with source `import foo.Bar;\npublic class A {}`
- **THEN** the call SHALL return `"A"`
- **AND** the call SHALL NOT throw `ParseError`

#### Scenario: Two-segment Java package succeeds

- **WHEN** `JAVA8.firstClassName` is called with source `package a.b;\npublic class A {}`
- **THEN** the call SHALL return `"A"`
- **AND** the call SHALL NOT throw `ParseError`

#### Scenario: Lombok-style two-segment imports succeed

- **WHEN** `JAVA8.signatures` is called with a compilation unit that includes `import lombok.Data;` (and other valid two-segment `lombok.*` imports) plus a public class body
- **THEN** the call SHALL return a `FileModel` whose first type name matches the public class
- **AND** the call SHALL NOT throw `ParseError`

#### Scenario: Truly invalid input still yields ParseError

- **WHEN** `JAVA8.firstClassName` is called with source that remains illegal under LL (e.g. `class {`)
- **THEN** the implementation SHALL throw `ParseError` with `language` equal to `'java8'`
