## MODIFIED Requirements

### Requirement: Format implementation lives under format directory

All JSON5 format-specific implementation files SHALL reside under `src/parser/json5/format/`. This SHALL include at minimum: Document AST build/transform/emit, token helpers, and format-local decode utilities. **Format options** (`DEFAULT_FORMAT_OPTIONS`, option resolution) SHALL reside in the top-level `format.js` facade, not under `format/`. The top-level `format.js` SHALL orchestrate the format pipeline by importing from `format/` only (plus shared core grammar pipeline), resolve user options once at entry, and pass resolved options to transform and emit.

#### Scenario: Format entry orchestrates parse-to-AST then format

- **WHEN** `JSON5.format(input, options)` is invoked
- **THEN** the implementation SHALL first build a Document AST from the parse tree and filled token stream, then apply format options and emit text, without importing `parse.js` or `validate.js`
- **AND** option resolution SHALL occur exactly once in `format.js` before transform and emit

#### Scenario: Format internals are directory-scoped

- **WHEN** AST builder, transform, and emitter modules are located
- **THEN** their file paths SHALL be under `src/parser/json5/format/`
- **AND** `format-options.js` SHALL NOT exist under `format/`

#### Scenario: Resolved options passed to pipeline

- **WHEN** `transformDocumentAst` or `emitDocument` is called from `format.js`
- **THEN** they SHALL receive already-resolved format options
- **AND** SHALL NOT invoke option normalization internally
