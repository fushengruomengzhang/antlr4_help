## ADDED Requirements

### Requirement: Parse pipeline retries with LL after SLL bail

The shared parse pipeline (`runParsePipeline`) MUST attempt the entry rule first with SLL prediction and a bail error strategy. When SLL prediction fails by cancellation (bail), the pipeline MUST reset the token stream and parser, clear any errors collected during the SLL attempt, switch to LL prediction with the default error strategy, and re-run the same entry rule once. When SLL completes without bail, the pipeline MUST NOT re-parse with LL.

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

#### Scenario: Truly invalid input still yields ParseError after LL

- **WHEN** `JAVA8.firstClassName` is called with source that remains illegal under LL (e.g. `class {`)
- **THEN** the implementation SHALL throw `ParseError` with `language` equal to `'java8'`

### Requirement: Stale SLL diagnostics MUST NOT surface after successful LL

After a successful LL retry, `throwIfErrors` MUST NOT raise a `ParseError` that originated solely from the failed SLL attempt.

#### Scenario: Successful LL retry has empty effective error set

- **WHEN** an input fails under SLL bail but succeeds under LL (e.g. `import foo.Bar;\npublic class A {}`)
- **THEN** the pipeline SHALL return a parse tree without throwing
- **AND** no SLL-era `mismatched input '.' expecting ';'` diagnostic SHALL be reported to the caller
