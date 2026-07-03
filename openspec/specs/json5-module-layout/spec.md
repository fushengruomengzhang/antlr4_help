# json5-module-layout

## Purpose

Define the independent API module layout for JSON5 validate, parse, and format, including directory boundaries and removal of legacy mixed modules.

## Requirements

### Requirement: Three independent API entry modules

The JSON5 product line SHALL expose `validate`, `parse`, and `format` through three separate top-level modules under `src/parser/json5/`: `validate.js`, `parse.js`, and `format.js`. The public aggregator `index.js` SHALL import only these three modules and re-export `JSON5` and `DEFAULT_FORMAT_OPTIONS`. `JSON5.validate(input)` signature SHALL NOT change. `JSON5.parse(input, options?)` SHALL accept an optional second argument with shape `{ sortKeys?: boolean }`; when omitted, parse behavior SHALL match the pre-extension single-argument form. `JSON5.format(input, options?)` SHALL remain a two-argument function; **`options.indent` SHALL be a string** (breaking change from the prior object form).

#### Scenario: Index aggregates three entries

- **WHEN** a consumer imports `{ JSON5, DEFAULT_FORMAT_OPTIONS }` from `src/parser/json5/index.js`
- **THEN** `JSON5.validate`, `JSON5.parse`, and `JSON5.format` SHALL be callable
- **AND** `DEFAULT_FORMAT_OPTIONS.indent` SHALL be the string `'  '`

#### Scenario: API modules do not cross-import

- **WHEN** the dependency graph of `validate.js`, `parse.js`, and `format.js` is inspected
- **THEN** none of these three files SHALL import any of the other two

#### Scenario: Parse accepts optional sortKeys

- **WHEN** a consumer calls `JSON5.parse('{ b: 1, a: 2 }', { sortKeys: true })`
- **THEN** the call SHALL succeed without breaking single-argument `JSON5.parse(input)` callers

---

### Requirement: Package subpath exports for selective JSON5 imports

The package SHALL declare Node.js `exports` subpaths so consumers can import only the JSON5 capability they need without loading unrelated modules. At minimum:

- `antlr4_help` (`.`) — full library entry (`JSON5`, `JSON4`, `JAVA8`, `API`, `ParseError`, `DEFAULT_FORMAT_OPTIONS`)
- `antlr4_help/json5` — full JSON5 namespace (`JSON5.validate`, `JSON5.parse`, `JSON5.format`, `DEFAULT_FORMAT_OPTIONS`)
- `antlr4_help/json5/validate` — validate-only facade
- `antlr4_help/json5/parse` — parse-only facade
- `antlr4_help/json5/format` — format-only facade plus `DEFAULT_FORMAT_OPTIONS`

Each single-capability subpath SHALL export a `JSON5` object containing **only** the methods for that capability, using the same method names as the full namespace (`validate`, `parse`, or `format`).

#### Scenario: Validate subpath exposes JSON5.validate

- **WHEN** a consumer runs `import { JSON5 } from 'antlr4_help/json5/validate'`
- **THEN** `JSON5.validate(input)` SHALL be callable
- **AND** `JSON5` SHALL NOT include `parse` or `format` properties

#### Scenario: Parse subpath exposes JSON5.parse

- **WHEN** a consumer runs `import { JSON5 } from 'antlr4_help/json5/parse'`
- **THEN** `JSON5.parse(input)` SHALL be callable
- **AND** `JSON5` SHALL NOT include `validate` or `format` properties

#### Scenario: Format subpath exposes JSON5.format and defaults

- **WHEN** a consumer runs `import { JSON5, DEFAULT_FORMAT_OPTIONS } from 'antlr4_help/json5/format'`
- **THEN** `JSON5.format(input, options?)` SHALL be callable
- **AND** `DEFAULT_FORMAT_OPTIONS` SHALL be available
- **AND** `JSON5` SHALL NOT include `validate` or `parse` properties

#### Scenario: Full json5 subpath matches aggregator

- **WHEN** a consumer imports from `antlr4_help/json5`
- **THEN** the exported `JSON5` object SHALL provide `validate`, `parse`, and `format` with the same behavior as `src/parser/json5/index.js`

#### Scenario: Root entry unchanged

- **WHEN** a consumer imports `{ JSON5 } from 'antlr4_help'`
- **THEN** all three JSON5 methods SHALL remain available with unchanged behavior

---

### Requirement: Validate-only import does not load format implementation

Importing `antlr4_help/json5/validate` SHALL NOT transitively import any module under `src/parser/json5/format/`.

#### Scenario: Validate subpath dependency graph

- **WHEN** the static import graph of `antlr4_help/json5/validate` is analyzed
- **THEN** no file under `src/parser/json5/format/` SHALL appear in the graph

---

### Requirement: Format implementation lives under format directory

All JSON5 format-specific implementation files SHALL reside under `src/parser/json5/format/`. This SHALL include at minimum: Document AST build/transform (`ast-builder-transform.js`), token slice helpers (`token-slice.js`), emit, and format-local decode utilities. **Format options** (`DEFAULT_FORMAT_OPTIONS`, option resolution) SHALL reside in the top-level `format.js` facade, not under `format/`. The top-level `format.js` SHALL orchestrate the format pipeline by importing from `format/` only (plus shared core grammar pipeline), resolve user options once at entry, and call `buildAndTransformDocumentAst` before emit.

#### Scenario: Format entry orchestrates parse-to-AST then format

- **WHEN** `JSON5.format(input, options)` is invoked
- **THEN** the implementation SHALL build and transform the Document AST from the parse tree and filled token stream, then emit text, without importing `parse.js` or `validate.js`
- **AND** option resolution SHALL occur exactly once in `format.js` before transform and emit

#### Scenario: Format internals are directory-scoped

- **WHEN** AST builder/transform, emitter, and token-slice modules are located
- **THEN** their file paths SHALL be under `src/parser/json5/format/`
- **AND** `ast-builder.js`, `ast-transform.js`, `types.js`, and `format-options.js` SHALL NOT exist under `format/`

#### Scenario: Resolved options passed to pipeline

- **WHEN** `buildAndTransformDocumentAst` or `emitDocument` is called from `format.js`
- **THEN** they SHALL receive already-resolved format options
- **AND** SHALL NOT invoke option normalization internally

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

#### Scenario: format-emitter removed

- **WHEN** the migration is complete
- **THEN** `src/parser/json5/format-emitter.js` SHALL NOT exist
- **AND** `JSON5.format` SHALL be exported from `format.js` using the `format/` directory modules

#### Scenario: value-visitor split into validate and parse

- **WHEN** the migration is complete
- **THEN** `validate.js` and `parse.js` SHALL exist under `src/parser/json5/`
- **AND** `value-visitor.js` SHALL NOT exist
