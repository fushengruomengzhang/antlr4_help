## MODIFIED Requirements

### Requirement: Token pre-index during Document AST build

The format Document AST builder SHALL NOT require a separate token pre-index pass. Member-boundary lookups (`findCommaToken`, `streamNextToken`, `openLineEndToken`) SHALL use direct scans over the filled token stream, equivalent to the pre-`json5-format-build-perf` implementation.

#### Scenario: Build without TokenIndex

- **WHEN** `buildDocumentAst` runs on any input with `fillTokens: true`
- **THEN** the implementation SHALL NOT call `buildTokenIndex` or allocate `nextAny` / `nextComma` / `lineMax` arrays

#### Scenario: Comma and next-token resolution unchanged

- **WHEN** building object or array members with commas and hidden-channel tokens
- **THEN** comma and next-token coordinates SHALL match the pre-index baseline behavior validated by existing tests

---

### Requirement: Format output unchanged after build perf optimizations

All internal performance optimizations in the JSON5 format pipeline SHALL preserve the exact formatting behavior validated by existing tests. For any input and resolved format options, `JSON5.format(input, options)` output SHALL match the pre-optimization output byte-for-byte.

#### Scenario: Existing expected fixtures unchanged

- **WHEN** `npm test` runs all json5 format cases against stored expected files
- **THEN** every format assertion SHALL pass without updating any expected file

#### Scenario: All format option combinations preserved

- **WHEN** `JSON5.format` is invoked with default, `{ compact: true }`, `{ sortKeys: true, compact: true }`, and tab indent options on existing test inputs
- **THEN** output SHALL match pre-optimization results for each combination

---

### Requirement: Scope limited to JSON5 format implementation

Performance optimizations SHALL apply only to modules under `src/parser/json5/format/` and the top-level `src/parser/json5/format.js` orchestrator. They SHALL NOT modify `parse.js`, `validate.js`, `decode.js` behavior (except import-only usage unchanged), shared `src/parser/core/` parse pipeline, or ANTLR grammars.

#### Scenario: Parse and validate dependency graph unchanged

- **WHEN** the static import graph of `antlr4_help/json5/parse` and `antlr4_help/json5/validate` is analyzed
- **THEN** no new imports from `src/parser/json5/format/` SHALL appear beyond pre-change baselines

#### Scenario: Format subpath still isolated

- **WHEN** the static import graph of `antlr4_help/json5/format` is analyzed
- **THEN** it SHALL NOT import `parse.js` or `validate.js` beyond existing `format.js` facade patterns

## ADDED Requirements

### Requirement: Transform sortKeys path uses in-place updates

The format AST transform step SHALL update object and array entries in place when applying `sortKeys`, avoiding unnecessary spread copies of entry objects and document nodes.

#### Scenario: sortKeys transform faster than entry spread baseline

- **WHEN** `transformDocumentAst` runs on a flat object with 2000 keys and `{ sortKeys: true }`
- **THEN** transform phase wall time SHALL be less than the `bench-v2.7.1.json` baseline (~0.31 ms/op at 200 runs)

#### Scenario: Stable sort preserved

- **WHEN** two object keys compare equal under `localeCompare`
- **THEN** their relative order SHALL match the pre-transform source order
