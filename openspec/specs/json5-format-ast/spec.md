# json5-format-ast

## Purpose

JSON5 `format` internal architecture: grammar-driven Document AST with `AnchorTriplet` coordinates, three-phase build/transform/emit pipeline, and emit-time comment interval slicing. Public API surface (`validate` / `parse` / `format`) is unchanged.

## Requirements

### Requirement: Format internal pipeline uses grammar-driven AST

The JSON5 format implementation SHALL build a Document AST from the parse tree and filled token stream before emitting output. The pipeline SHALL consist of three internal phases: build AST, transform AST (options), emit AST. Public APIs (`JSON5.validate`, `JSON5.parse`, `JSON5.format`) SHALL NOT change signatures.

#### Scenario: Format entry uses AST pipeline

- **WHEN** `JSON5.format(input, options)` is called with valid JSON5 input
- **THEN** the implementation SHALL parse input, build Document AST, apply transform for options, and emit text using `CommentSlicer` interval extraction at emit time

#### Scenario: Parse does not use AST builder

- **WHEN** `JSON5.parse(input)` is called
- **THEN** the implementation SHALL NOT invoke the Document AST builder and SHALL return a plain JavaScript value without comments

---

### Requirement: Document AST build assigns comments on value grammar without emit re-derivation

The format implementation SHALL build a structure-only Document AST with `AnchorTriplet` coordinates on semantic tokens during the build phase using the `Json5Parser.g4` parse tree and filled token stream. Comment text SHALL NOT be stored on AST nodes during build. The emit phase SHALL extract comment text by slicing HIDDEN-channel comment tokens from token-index intervals defined by each anchor's `prev`, `current`, and `next` coordinates. Emit SHALL NOT use gap archaeology heuristics (`purePrefixHiddenTokens`, cross-entry span exclusion, or output-gap inference).

#### Scenario: Build uses triplets without comment strings

- **WHEN** the AST builder processes an object with commented members
- **THEN** each entry SHALL store `key` and `end` `AnchorTriplet` values
- **AND** SHALL NOT store `before`, `suffix`, or `suffixSort` string fields

#### Scenario: Emit slices comments from token stream

- **WHEN** `emitDocument` runs with the filled token stream
- **THEN** it SHALL extract prefix comments from intervals between `triplet.prev` and `triplet.current`
- **AND** suffix comments from intervals between `triplet.current` and `triplet.next`

#### Scenario: sortKeys moves entries after build

- **WHEN** `sortKeys: true` is applied in the transform phase
- **THEN** each `ObjectEntry` including its `AnchorTriplet` values SHALL move as a unit
- **AND** the transform phase SHALL NOT re-scan the token stream to reassign prefix comments

---

### Requirement: Document and container comment anchors

The Document AST SHALL anchor comments via `AnchorTriplet` on semantic tokens rather than opaque string slots.

Root document header/footer comments SHALL use the root value container's `open` prefix interval (with stream-start sentinel) and `close` suffix interval (with stream-end sentinel) respectively.

Object and Array container nodes SHALL have `open` and `close` `AnchorTriplet` values. Opening-brace inline comments SHALL be extracted from the `open` suffix interval on the same line as `{` or `[`. Closing-brace leading comments SHALL be extracted from the `close` prefix interval.

Triple-quoted string nodes SHALL have an `open` `AnchorTriplet` for opener-line comments.

#### Scenario: File header comments

- **WHEN** input has line or block comments before the root value
- **THEN** those comments SHALL be emitted from the root container `open` prefix interval

#### Scenario: Opening brace inline comment

- **WHEN** input is `{ // comment` followed by members
- **THEN** the comment SHALL be emitted from the object `open` suffix interval on the same line as `{`
- **AND** SHALL NOT be attached to the first member's key prefix interval

#### Scenario: Triple-quote opener comment

- **WHEN** input contains `''' // opener` or `""" // opener`
- **THEN** the comment SHALL be extracted from the string node's `open` interval and SHALL NOT appear in `JSON5.parse` output

---

### Requirement: ObjectEntry groups member with triplet anchors

Each g4 `member` SHALL be represented as one `ObjectEntry` with:

- `key`: `AnchorTriplet` on the member key token (`prev` = `{` or previous member `end.current`, `next` = `:`)
- `end`: `AnchorTriplet` on the member separator (`prev` = value stop, `current` = `COMMA` if present else value stop, `next` = next member key or `}`)
- `keySource`, `sortKey`, `value` as today

#### Scenario: Leading and inline comments on same entry

- **WHEN** input contains a line comment on the line before key `a`, then `a: 12 , // inline`
- **THEN** the leading comment SHALL be extracted from the `key` prefix interval
- **AND** the inline comment SHALL be extracted from the `end` suffix interval on the same line as `end.current`

#### Scenario: Duplicate keys preserved in entries

- **WHEN** input contains two members with the same key in source order
- **THEN** the AST SHALL contain two `ObjectEntry` items and `JSON5.parse` SHALL still apply last-wins semantics

---

### Requirement: ArrayEntry uses triplet anchors without sorting

Each g4 array `value` and its following separator SHALL be an `ArrayEntry` with `item` and `end` `AnchorTriplet` values defined analogously to `ObjectEntry`.

The format implementation SHALL NOT reorder array elements when any format option is set.

#### Scenario: Array element inline comment

- **WHEN** input contains `[ 1 , // comment` within an array
- **THEN** the comment SHALL be extracted from the array entry `end` suffix interval for element `1`

---

### Requirement: sortKeys sorts entries with comments attached

When `sortKeys: true`, the implementation SHALL stably sort each `ObjectNode.entries` array by `sortKey` using locale-aware string comparison. The entire entry including `AnchorTriplet` values SHALL move with its key.

Array elements SHALL NOT be sorted.

#### Scenario: Prefix comment follows key after sort

- **WHEN** `JSON5.format` is called with `sortKeys: true` on input where a prefix comment precedes a Unicode or quoted key
- **THEN** output SHALL place that comment immediately before the sorted position of that key

#### Scenario: Inline comment follows member after sort

- **WHEN** `JSON5.format` is called with `sortKeys: true, compact: true` on input with trailing inline comments on members
- **THEN** each inline comment SHALL remain on the same line as its member's value in output

#### Scenario: Stable sort for duplicate keys

- **WHEN** `sortKeys: true` and two entries share the same `sortKey`
- **THEN** their relative order SHALL match stable sort by original source order

---

### Requirement: Format output behavior unchanged for public options

Format output SHALL preserve existing documented behavior for `compact` and `sortKeys`. The `indent` option SHALL be a string representing the indentation unit repeated once per nesting depth; default SHALL be `'  '` (two spaces per level), producing the same pretty layout as the previous `{ type: 'space', size: 2 }` default.

Pretty mode (`compact: false`) SHALL use clear structural line breaks, normalize single-line string values to double quotes, convert `'''` multiline strings to `"""`, remove trailing commas from objects and arrays, and preserve JSON5 key source forms. Trailing inline comments that were on a separate line in the golden `fixture.default.text` baseline SHALL remain on their own indented line after the value, not merged onto the same line as the value.

Compact mode (`compact: true`) SHALL use compact layout, preserve source string token forms, eliminate whitespace-only blank lines, and keep header/footer comments co-located with containers and members as today. Output SHALL match the golden `fixture.compact.text` baseline byte-for-byte after bug fixes, except where superseded by the sortKeys prefix-order requirement in `json5-format-triplet-anchor`.

When both `sortKeys: true` and `compact: true` are set, layout SHALL match compact mode with only object key order differing.

Trailing comma removal SHALL be applied in emit, not during AST build.

At nesting depth `d` (0 = root container), emit SHALL prefix member/close lines with `indent.repeat(d)` for pretty and compact member-line layout.

#### Scenario: Tab indent per level

- **WHEN** `JSON5.format(input, { indent: '\t' })` is called in pretty mode
- **THEN** each nested level SHALL be indented with one additional tab character per depth

#### Scenario: Custom indent string per level

- **WHEN** `JSON5.format(input, { indent: '    ' })` is called in pretty mode
- **THEN** each nested level SHALL add four spaces per depth relative to the parent line

#### Scenario: Trailing comma stripped on format

- **WHEN** input is `{ a: 1, }` and `JSON5.format` is called with default options
- **THEN** output SHALL not contain a trailing comma before `}`

#### Scenario: Compact sort produces no whitespace-only lines

- **WHEN** `JSON5.format` is called with `sortKeys: true, compact: true`
- **THEN** output SHALL NOT contain lines that are only whitespace

#### Scenario: Pretty default matches golden baseline

- **WHEN** `JSON5.format(input)` is called with default options on the comment-heavy fixture
- **THEN** output SHALL match `test/resources/expected/json5/fixture.default.text` byte-for-byte

#### Scenario: Compact matches golden baseline

- **WHEN** `JSON5.format(input, { compact: true })` is called on the comment-heavy fixture
- **THEN** output SHALL match `test/resources/expected/json5/fixture.compact.text` byte-for-byte

#### Scenario: Triple-quote opener comment in output

- **WHEN** input contains `''' // 三引号注释` before string body
- **THEN** pretty/compact output SHALL preserve `// 三引号注释` on the opener line in the formatted string literal emission matching the golden compact baseline

---

### Requirement: indent option is string only (hard cut)

`FormatOptions.indent` SHALL be a string. The implementation SHALL NOT accept the legacy `{ type, size }` object form. `DEFAULT_FORMAT_OPTIONS.indent` SHALL be `'  '`.

#### Scenario: Object indent rejected or ignored is not supported

- **WHEN** a caller passes `indent: { type: 'space', size: 2 }`
- **THEN** the implementation SHALL NOT treat it as valid indent configuration (MAY throw or produce incorrect output; callers MUST migrate to string form)

#### Scenario: Empty string indent

- **WHEN** `JSON5.format(input, { indent: '' })` is called in pretty mode
- **THEN** structural newlines SHALL still be emitted but member lines SHALL have no added indent prefix per level
