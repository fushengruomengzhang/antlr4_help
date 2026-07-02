## ADDED Requirements

### Requirement: Three independent API entry modules

The JSON5 product line SHALL expose `validate`, `parse`, and `format` through three separate top-level modules under `src/parser/json5/`: `validate.js`, `parse.js`, and `format.js`. The public aggregator `index.js` SHALL import only these three modules and re-export `JSON5` and `DEFAULT_FORMAT_OPTIONS`. Signatures and documented behavior of `JSON5.validate`, `JSON5.parse`, and `JSON5.format` SHALL NOT change.

#### Scenario: Index aggregates three entries

- **WHEN** a consumer imports `{ JSON5, DEFAULT_FORMAT_OPTIONS }` from `src/parser/json5/index.js`
- **THEN** `JSON5.validate`, `JSON5.parse`, and `JSON5.format` SHALL be callable with the same signatures as before this change

#### Scenario: API modules do not cross-import

- **WHEN** the dependency graph of `validate.js`, `parse.js`, and `format.js` is inspected
- **THEN** none of these three files SHALL import any of the other two

---

### Requirement: Format implementation lives under format directory

All JSON5 format-specific implementation files SHALL reside under `src/parser/json5/format/`. This SHALL include at minimum: Document AST build/transform/emit, token helpers, format options, and format-local decode utilities. The top-level `format.js` SHALL orchestrate the format pipeline by importing from `format/` only (plus shared core grammar pipeline).

#### Scenario: Format entry orchestrates parse-to-AST then format

- **WHEN** `JSON5.format(input, options)` is invoked
- **THEN** the implementation SHALL first build a Document AST from the parse tree and filled token stream, then apply format options and emit text, without importing `parse.js` or `validate.js`

#### Scenario: Format internals are directory-scoped

- **WHEN** AST builder, transform, emitter, and format options modules are located
- **THEN** their file paths SHALL be under `src/parser/json5/format/`

---

### Requirement: Parse and validate do not use format directory

`parse.js` and `validate.js` SHALL NOT import any module under `src/parser/json5/format/`. `JSON5.parse` SHALL continue to use a CST-based value extraction path and SHALL NOT invoke the Document AST builder. `JSON5.validate` SHALL perform grammar validation only via the shared parse pipeline without building JavaScript values or Document AST.

#### Scenario: Parse avoids format AST builder

- **WHEN** `JSON5.parse(input)` is called
- **THEN** the implementation SHALL NOT import or call `buildDocumentAst` or any module under `format/`

#### Scenario: Validate is pipeline-only

- **WHEN** `JSON5.validate(input)` is called
- **THEN** the implementation SHALL run the JSON5 parse pipeline without `fillTokens: true`, without building a JavaScript value, and without importing `format/`

---

### Requirement: Legacy mixed modules removed

The mixed modules `value-visitor.js` and `format-emitter.js` SHALL be removed from `src/parser/json5/` after their responsibilities are migrated to the new layout. No remaining production code under `src/parser/json5/` SHALL import these files.

#### Scenario: No references to removed modules

- **WHEN** the repository is searched for imports of `value-visitor.js` or `format-emitter.js` under `src/parser/json5/`
- **THEN** no such imports SHALL exist after migration is complete
