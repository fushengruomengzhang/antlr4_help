## ADDED Requirements

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

- `antlr4_help` (`.`) — full library entry
- `antlr4_help/json5` — full JSON5 namespace
- `antlr4_help/json5/validate` — validate-only facade
- `antlr4_help/json5/parse` — parse-only facade
- `antlr4_help/json5/format` — format-only facade plus `DEFAULT_FORMAT_OPTIONS`

Each single-capability subpath SHALL export a `JSON5` object containing **only** the methods for that capability.

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

All JSON5 format-specific implementation files SHALL reside under `src/parser/json5/format/`. Format options (`DEFAULT_FORMAT_OPTIONS`, option resolution) SHALL reside in the top-level `format.js` facade. The top-level `format.js` SHALL orchestrate the format pipeline, resolve user options once at entry, and call `buildAndTransformDocumentAst` before emit.

#### Scenario: Format entry orchestrates parse-to-AST then format

- **WHEN** `JSON5.format(input, options)` is invoked
- **THEN** the implementation SHALL build and transform the Document AST from the parse tree and filled token stream, then emit text, without importing `parse.js` or `validate.js`
- **AND** option resolution SHALL occur exactly once in `format.js` before transform and emit

#### Scenario: Format internals are directory-scoped

- **WHEN** AST builder/transform, emitter, and token-slice modules are located
- **THEN** their file paths SHALL be under `src/parser/json5/format/`
- **AND** legacy split files (`ast-builder.js`, `ast-transform.js`, `types.js`, `format-options.js`) SHALL NOT exist under `format/`

#### Scenario: Resolved options passed to pipeline

- **WHEN** `buildAndTransformDocumentAst` or `emitDocument` is called from `format.js`
- **THEN** they SHALL receive already-resolved format options
- **AND** SHALL NOT invoke option normalization internally

---

### Requirement: Parse and validate do not use format directory

`parse.js` and `validate.js` SHALL NOT import any module under `src/parser/json5/format/`. `JSON5.parse` SHALL use a CST-based value extraction path. `JSON5.validate` SHALL perform grammar validation only via the shared parse pipeline without building JavaScript values or Document AST.

#### Scenario: Parse avoids format AST builder

- **WHEN** `JSON5.parse(input)` is called
- **THEN** the implementation SHALL NOT import or call `buildDocumentAst` or any module under `format/`

#### Scenario: Validate is pipeline-only

- **WHEN** `JSON5.validate(input)` is called
- **THEN** the implementation SHALL run the JSON5 parse pipeline without `fillTokens: true`, without building a JavaScript value, and without importing `format/`

---

### Requirement: Legacy mixed modules removed

The mixed modules `value-visitor.js` and `format-emitter.js` SHALL be removed from `src/parser/json5/` after migration. No remaining production code under `src/parser/json5/` SHALL import these files.

#### Scenario: No references to removed modules

- **WHEN** the repository is searched for imports of `value-visitor.js` or `format-emitter.js` under `src/parser/json5/`
- **THEN** no such imports SHALL exist

#### Scenario: format-emitter removed

- **WHEN** the repository is inspected
- **THEN** `src/parser/json5/format-emitter.js` SHALL NOT exist
- **AND** `JSON5.format` SHALL be exported from `format.js` using the `format/` directory modules

#### Scenario: value-visitor split into validate and parse

- **WHEN** the repository is inspected
- **THEN** `validate.js` and `parse.js` SHALL exist under `src/parser/json5/`
- **AND** `value-visitor.js` SHALL NOT exist

---

### Requirement: Library exposes format only through JSON5.format

The package SHALL provide JSON5 formatting exclusively via `JSON5.format` on the `JSON5` export. The library SHALL NOT export `JSON5Format`, `JSON5_FORMAT_DEFAULT_OPTIONS`, or any module under `src/parser/json5-format/`.

#### Scenario: Package entry has no JSON5Format export

- **WHEN** a consumer imports from `src/index.js`
- **THEN** `JSON5Format` SHALL NOT be among the exported bindings
- **AND** `JSON5.format` SHALL remain callable with `indent`, `sortKeys`, and `compact` options

#### Scenario: json5-format directories removed

- **WHEN** the repository is inspected
- **THEN** `src/parser/json5-format/` and `src/grammars/json5-format/` SHALL NOT exist

---

### Requirement: JSON5.parse accepts optional sortKeys option

`JSON5.parse` SHALL accept an optional second argument `options` with shape `{ sortKeys?: boolean }`. When `options` is omitted or `sortKeys` is `false`, parse behavior SHALL preserve source key and array element order.

#### Scenario: Default parse preserves source order

- **WHEN** `JSON5.parse('{ b: 1, a: 2 }')` is called without options
- **THEN** the returned object SHALL have key insertion order `b` then `a`

#### Scenario: Non-boolean sortKeys rejected

- **WHEN** `JSON5.parse('{}', { sortKeys: 1 })` is called
- **THEN** the implementation SHALL throw `TypeError`

---

### Requirement: JSON5.parse sortKeys true stably sorts object keys

When `sortKeys: true`, the implementation SHALL recursively sort each object's keys using `keyA.localeCompare(keyB)` with stable tie-breaking by original source member index. Keys SHALL use the same decoded string form as `keyToString`. Array elements SHALL NOT be reordered. The algorithm SHALL match `JSON5.format` `sortKeys: true` ordering.

#### Scenario: Top-level keys sorted

- **WHEN** `JSON5.parse('{ b: 2, a: 1 }', { sortKeys: true })` is called
- **THEN** `Object.keys(result)` SHALL equal `['a', 'b']`

#### Scenario: Nested objects sorted recursively

- **WHEN** `JSON5.parse('{ z: { y: 1, x: 2 } }', { sortKeys: true })` is called
- **THEN** `Object.keys(result.z)` SHALL equal `['x', 'y']`

#### Scenario: Array element order unchanged

- **WHEN** `JSON5.parse('[3, 1, 2]', { sortKeys: true })` is called
- **THEN** the returned array SHALL deeply equal `[3, 1, 2]`

#### Scenario: Unicode and unquoted keys use localeCompare

- **WHEN** `JSON5.parse` is called with `sortKeys: true` on input containing Unicode or unquoted identifier keys
- **THEN** key order SHALL follow `String.prototype.localeCompare` on strings from `keyToString`

---

### Requirement: JSON5 module documents parse options

The `src/parser/json5/index.js` module documentation SHALL describe the optional `options` argument on `JSON5.parse`, the `sortKeys` field (default `false`), and that array elements are not sorted when `sortKeys` is enabled.

#### Scenario: Public API documentation lists sortKeys

- **WHEN** a consumer reads `JSON5.parse` JSDoc in `src/parser/json5/index.js`
- **THEN** it SHALL document `options.sortKeys` as an optional boolean defaulting to `false`
- **AND** SHALL state that only object keys are sorted, not array elements

---

### Requirement: Format internal pipeline uses grammar-driven AST

The JSON5 format implementation SHALL build a Document AST from the parse tree and filled token stream before emitting output. The pipeline SHALL consist of three internal phases: build AST, transform AST (options), emit AST.

#### Scenario: Format entry uses AST pipeline

- **WHEN** `JSON5.format(input, options)` is called with valid JSON5 input
- **THEN** the implementation SHALL parse input, build Document AST, apply transform for options, and emit text using comment interval extraction at emit time

#### Scenario: Parse does not use AST builder

- **WHEN** `JSON5.parse(input)` is called
- **THEN** the implementation SHALL NOT invoke the Document AST builder

---

### Requirement: AnchorTriplet records semantic token boundaries

The format AST builder SHALL assign each comment-bearing semantic token an `AnchorTriplet` with `prev`, `current`, and `next` coordinates. Stream-start and stream-end sentinel coordinates SHALL close intervals for file header and footer comments.

#### Scenario: Object open anchor uses sentinel prev

- **WHEN** the AST builder processes a root object whose `{` is the first visible token
- **THEN** `open.prev` SHALL be the stream-start sentinel
- **AND** prefix comments before `{` SHALL be discoverable via interval `(open.prev, open.current)`

#### Scenario: Entry key anchor uses previous separator boundary

- **WHEN** the AST builder processes the second object member key
- **THEN** `key.prev` SHALL be the previous member's `end.current` token (typically `COMMA`)

---

### Requirement: AST build stores structure without comment strings

The AST builder SHALL NOT populate comment or layout string slots on Document, container, or entry nodes. Comment text SHALL be deferred to the emit phase.

#### Scenario: ObjectEntry has triplet anchors only

- **WHEN** `buildDocumentAst` completes for an object with commented members
- **THEN** each `ObjectEntry` SHALL contain `key` and `end` `AnchorTriplet` values and SHALL NOT contain `before` or `suffix` string fields

---

### Requirement: Emit extracts comments by token-index interval slicing

The emit phase SHALL extract prefix comments from intervals between `triplet.prev` and `triplet.current`, and suffix comments from intervals between `triplet.current` and `triplet.next`.

#### Scenario: Prefix preserves comment source text

- **WHEN** emit processes an entry whose key interval contains `// 中文 key`
- **THEN** output SHALL include the literal text `// 中文 key` before that key

#### Scenario: Inline suffix same-line filter

- **WHEN** emit processes an entry whose end interval contains `// 年龄` on the same line as the member comma
- **THEN** output SHALL emit the inline comment on the same line as the member value in compact sort mode

---

### Requirement: No gap archaeology during emit

The emit phase SHALL NOT scan reformatted output gaps or use `purePrefixHiddenTokens`, cross-entry span exclusion, or equivalent gap-reconstruction helpers.

#### Scenario: Sort moves entries without re-scanning token stream

- **WHEN** `sortKeys: true` is applied in transform
- **THEN** each entry's prefix and suffix comments SHALL be extracted only from that entry's build-time triplets

#### Scenario: Prefix follows key after sort

- **WHEN** `JSON5.format` runs with `sortKeys: true` on input where `// 中文 key` precedes key `中文字段`
- **THEN** output SHALL place `// 中文 key` immediately before `中文字段` in sorted position

---

### Requirement: Open inline comments use suffix interval only

Opening-brace inline comments SHALL be extracted via the `open` suffix interval. The implementation SHALL NOT use whole-source-line scanning that misattributes comments.

#### Scenario: Empty object inline not attributed to inner brace

- **WHEN** input is `"emptyObject": {}, // 空对象`
- **THEN** output SHALL be `"emptyObject": {}, // 空对象` on one logical compact line
- **AND** SHALL NOT emit `{ // 空对象` for the inner empty object

---

### Requirement: Document and container comment anchors

Root document header/footer comments SHALL use the root value container's `open` prefix interval and `close` suffix interval. Object and Array container nodes SHALL have `open` and `close` `AnchorTriplet` values. Triple-quoted string nodes SHALL have an `open` `AnchorTriplet` for opener-line comments.

#### Scenario: File header comments

- **WHEN** input has line or block comments before the root value
- **THEN** those comments SHALL be emitted from the root container `open` prefix interval

#### Scenario: Triple-quote opener comment

- **WHEN** input contains `''' // opener` or `""" // opener`
- **THEN** the comment SHALL be extracted from the string node's `open` interval and SHALL NOT appear in `JSON5.parse` output

---

### Requirement: ObjectEntry groups member with triplet anchors

Each g4 `member` SHALL be represented as one `ObjectEntry` with `key` and `end` `AnchorTriplet` values, plus `keySource`, `sortKey`, and `value`.

#### Scenario: Leading and inline comments on same entry

- **WHEN** input contains a line comment on the line before key `a`, then `a: 12 , // inline`
- **THEN** the leading comment SHALL be extracted from the `key` prefix interval
- **AND** the inline comment SHALL be extracted from the `end` suffix interval

#### Scenario: Duplicate keys preserved in entries

- **WHEN** input contains two members with the same key in source order
- **THEN** the AST SHALL contain two `ObjectEntry` items and `JSON5.parse` SHALL still apply last-wins semantics

---

### Requirement: ArrayEntry uses triplet anchors without sorting

Each g4 array `value` and its following separator SHALL be an `ArrayEntry` with `item` and `end` `AnchorTriplet` values. The format implementation SHALL NOT reorder array elements when any format option is set.

#### Scenario: Array element inline comment

- **WHEN** input contains `[ 1 , // comment` within an array
- **THEN** the comment SHALL be extracted from the array entry `end` suffix interval for element `1`

---

### Requirement: sortKeys sorts entries with comments attached

When `sortKeys: true`, the implementation SHALL stably sort each `ObjectNode.entries` array by `sortKey` using locale-aware string comparison. The entire entry including `AnchorTriplet` values SHALL move with its key. Array elements SHALL NOT be sorted.

#### Scenario: Inline comment follows member after sort

- **WHEN** `JSON5.format` is called with `sortKeys: true, compact: true` on input with trailing inline comments on members
- **THEN** each inline comment SHALL remain on the same line as its member's value in output

#### Scenario: Stable sort for duplicate keys

- **WHEN** `sortKeys: true` and two entries share the same `sortKey`
- **THEN** their relative order SHALL match stable sort by original source order

---

### Requirement: Format output behavior unchanged for public options

Format output SHALL preserve existing documented behavior for `compact` and `sortKeys`. The `indent` option SHALL be a string; default SHALL be `'  '`. Pretty mode SHALL use structural line breaks; compact mode SHALL eliminate whitespace-only blank lines. Trailing comma removal SHALL be applied in emit.

#### Scenario: Pretty default matches golden baseline

- **WHEN** `JSON5.format(input)` is called with default options on the comment-heavy fixture
- **THEN** output SHALL match `test/resources/expected/json5/fixture.default.text` byte-for-byte

#### Scenario: Compact matches golden baseline

- **WHEN** `JSON5.format(input, { compact: true })` is called on the comment-heavy fixture
- **THEN** output SHALL match `test/resources/expected/json5/fixture.compact.text` byte-for-byte

#### Scenario: Compact sort produces no whitespace-only lines

- **WHEN** `JSON5.format` is called with `sortKeys: true, compact: true`
- **THEN** output SHALL NOT contain lines that are only whitespace

#### Scenario: Trailing comma stripped on format

- **WHEN** input is `{ a: 1, }` and `JSON5.format` is called with default options
- **THEN** output SHALL not contain a trailing comma before `}`

---

### Requirement: indent option is string only

`FormatOptions.indent` SHALL be a string. The implementation SHALL NOT accept the legacy `{ type, size }` object form. `DEFAULT_FORMAT_OPTIONS.indent` SHALL be `'  '`.

#### Scenario: Empty string indent

- **WHEN** `JSON5.format(input, { indent: '' })` is called in pretty mode
- **THEN** structural newlines SHALL still be emitted but member lines SHALL have no added indent prefix per level

---

### Requirement: Format output unchanged after perf optimizations

All internal performance optimizations in the JSON5 format pipeline SHALL preserve the exact formatting behavior validated by existing tests.

#### Scenario: Existing expected fixtures unchanged

- **WHEN** `npm test` runs all json5 format cases against stored expected files
- **THEN** every format assertion SHALL pass without updating any expected file

---

### Requirement: Document AST build uses linear token scans

The format Document AST builder SHALL NOT require a separate token pre-index pass.

#### Scenario: Build without TokenIndex

- **WHEN** `buildDocumentAst` runs on any input with `fillTokens: true`
- **THEN** the implementation SHALL NOT call `buildTokenIndex` or allocate pre-index arrays for token navigation

---

### Requirement: Scope limited to JSON5 format implementation

Performance optimizations SHALL apply only to modules under `src/parser/json5/format/` and `src/parser/json5/format.js`. They SHALL NOT modify `parse.js`, `validate.js`, shared core, or ANTLR grammars.

#### Scenario: Parse and validate dependency graph unchanged

- **WHEN** the static import graph of `antlr4_help/json5/parse` and `antlr4_help/json5/validate` is analyzed
- **THEN** no new imports from `src/parser/json5/format/` SHALL appear beyond pre-change baselines

---

### Requirement: Transform sortKeys path uses in-place updates

The format AST transform step SHALL update object and array entries in place when applying `sortKeys`, avoiding unnecessary spread copies of entry objects and document nodes.

#### Scenario: Stable sort preserved

- **WHEN** two object keys compare equal under `localeCompare`
- **THEN** their relative order SHALL match the pre-transform source order
