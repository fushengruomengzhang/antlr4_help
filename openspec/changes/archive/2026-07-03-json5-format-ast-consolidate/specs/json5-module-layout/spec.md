## MODIFIED Requirements

### Requirement: Format implementation lives under format directory

All JSON5 format-specific implementation files SHALL reside under `src/parser/json5/format/`. This SHALL include at minimum: Document AST build/transform (`ast-builder-transform.js`), token slice helpers (`token-slice.js`), and format-local decode utilities. **Format options** (`DEFAULT_FORMAT_OPTIONS`, option resolution) SHALL reside in the top-level `format.js` facade. The top-level `format.js` SHALL orchestrate the format pipeline by importing from `format/` only (plus shared core grammar pipeline), resolve user options once at entry, and call `buildAndTransformDocumentAst` before emit.

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
