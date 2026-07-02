# json5-format-ast

## Purpose

JSON5 `format` internal architecture: grammar-driven Document AST, comment anchor slots on entries, and three-phase build/transform/emit pipeline. Public API surface (`validate` / `parse` / `format`) is unchanged.

## Requirements

### Requirement: Format internal pipeline uses grammar-driven AST

The JSON5 format implementation SHALL build a Document AST from the parse tree and filled token stream before emitting output. The pipeline SHALL consist of three internal phases: build AST, transform AST (options), emit AST. Public APIs (`JSON5.validate`, `JSON5.parse`, `JSON5.format`) SHALL NOT change signatures.

#### Scenario: Format entry uses AST pipeline

- **WHEN** `JSON5.format(input, options)` is called with valid JSON5 input
- **THEN** the implementation SHALL parse input, build Document AST, apply transform for options, and emit text without re-deriving comment ownership from token spans during emit

#### Scenario: Parse does not use AST builder

- **WHEN** `JSON5.parse(input)` is called
- **THEN** the implementation SHALL NOT invoke the Document AST builder and SHALL return a plain JavaScript value without comments

---

### Requirement: Document AST build assigns comments on value grammar without emit re-derivation

The format implementation SHALL assign all comment and layout text to Document AST slots during the build phase using the existing `Json5Parser.g4` parse tree and filled token stream. Object and array entry separator boundaries SHALL be determined during build (including g4 `COMMA` token placement where applicable), not by emit-time heuristics. The emit phase SHALL concatenate pre-assigned slot strings and SHALL NOT call `getHiddenTokensToLeft`, `getHiddenTokensToRight`, or span-based comment ownership heuristics (including prefix versus inline classification) during emission.

#### Scenario: Build uses g4 COMMA for sep

- **WHEN** the AST builder processes an object with two members separated by a g4 `COMMA` token
- **THEN** the first member's separator slot SHALL include the COMMA character and following hidden text until the next member's key
- **AND** the second member's `before` SHALL contain only hidden text before its key start

#### Scenario: Emit does not re-derive comment ownership

- **WHEN** `emitDocument` runs after build and transform
- **THEN** it SHALL NOT invoke token-stream archaeology helpers to assign comments to members
- **AND** output SHALL be produced by concatenating entry and container slot strings in documented order

#### Scenario: sortKeys moves entries after build

- **WHEN** `sortKeys: true` is applied in the transform phase
- **THEN** each `ObjectEntry` including comment anchor slots SHALL move as a unit
- **AND** the transform phase SHALL NOT re-scan the token stream to reassign prefix comments

---

### Requirement: Document and container comment anchors

The Document AST SHALL anchor comments at semantic levels aligned with the parse tree.

Document node SHALL have `before` (hidden before root value) and `after` (hidden after root value).

Object and Array container nodes SHALL have `openRight` (hidden after `{` or `[`), `closeBefore` (hidden before `}` or `]`), and `closeRight` (hidden after `}` or `]`).

Triple-quoted string nodes SHALL have `openRight` for hidden after the opener token.

#### Scenario: File header and footer comments

- **WHEN** input has line or block comments before the root value
- **THEN** those comments SHALL be stored in `Document.before`

#### Scenario: Opening brace inline comment

- **WHEN** input is `{ // comment` followed by members
- **THEN** the comment SHALL be stored in `Object.openRight` and SHALL NOT be attached to the first member's `before`

#### Scenario: Triple-quote opener comment

- **WHEN** input contains `''' // opener` or `""" // opener`
- **THEN** the comment SHALL be stored on the string node's `openRight` and SHALL NOT appear in `JSON5.parse` output

---

### Requirement: ObjectEntry groups member and separator with comment slots

Each g4 `member` and its following separator SHALL be represented as one `ObjectEntry` that moves as a unit when `sortKeys` is enabled.

Each `ObjectEntry` SHALL contain:

- `before`: hidden tokens before `key.start` (leading / prefix comments)
- `key`: canonical sort string (same semantics as `keyToString`)
- `keySource`: source text for emission (preserves JSON5 key form)
- `value`: recursive AST node
- `right`: hidden between `value` stop and the next g4 `COMMA` token on the same member span, excluding the COMMA token
- `sep`: when a g4 `COMMA` exists between this member and the next, `sep` SHALL start with the COMMA token text and include following hidden until the next member's key; otherwise `sep` SHALL be empty

Object node SHALL have `trailingSep` for the optional g4 trailing `COMMA?` after the last member.

#### Scenario: Leading and inline comments on same entry

- **WHEN** input contains a line comment on the line before key `a`, then `a: 12 , // inline`
- **THEN** the leading comment SHALL be in `before` and the inline comment (with comma if present in source) SHALL be in `sep` or `right` per g4 COMMA placement, all on the same `ObjectEntry`

#### Scenario: COMMA presence follows g4

- **WHEN** g4 matches `COMMA` between two members
- **THEN** `sep` for the first member SHALL include the comma character

#### Scenario: No COMMA between value and next key

- **WHEN** there is no g4 `COMMA` token after a member's value before the next member (invalid input) or after the last member without trailing comma
- **THEN** `sep` or `trailingSep` SHALL NOT invent a comma character

#### Scenario: Non-ASCII comma not in sep

- **WHEN** input uses a fullwidth comma `，` that is not lexed as g4 `COMMA`
- **THEN** that character SHALL NOT be placed in `sep` as a separator comma

#### Scenario: Duplicate keys preserved in entries

- **WHEN** input contains two members with the same key in source order
- **THEN** the AST SHALL contain two `ObjectEntry` items and `JSON5.parse` SHALL still apply last-wins semantics

---

### Requirement: ArrayEntry uses same slot model without sorting

Each g4 array `value` and its following separator SHALL be an `ArrayEntry` with `before`, `value`, `right`, and `sep` defined analogously to `ObjectEntry`, using g4 `array.COMMA()` for `sep` boundaries.

The format implementation SHALL NOT reorder array elements when any format option is set.

#### Scenario: Array element inline comment

- **WHEN** input contains `[ 1 , // comment` within an array
- **THEN** the comment SHALL be anchored on the array entry for element `1` according to g4 COMMA placement

---

### Requirement: sortKeys sorts entries with comments attached

When `sortKeys: true`, the implementation SHALL stably sort each `ObjectNode.entries` array by `key` using locale-aware string comparison. The entire entry including `before`, `right`, and `sep` SHALL move with its key.

Array elements SHALL NOT be sorted.

#### Scenario: Prefix comment follows key after sort

- **WHEN** `JSON5.format` is called with `sortKeys: true` on input where a prefix comment precedes a Unicode or quoted key
- **THEN** output SHALL place that comment immediately before the sorted position of that key

#### Scenario: Inline comment follows member after sort

- **WHEN** `JSON5.format` is called with `sortKeys: true, compact: true` on input with trailing inline comments on members
- **THEN** each inline comment SHALL remain on the same line as its member's value in output

#### Scenario: Stable sort for duplicate keys

- **WHEN** `sortKeys: true` and two entries share the same `key`
- **THEN** their relative order SHALL match stable sort by original source order

---

### Requirement: Format output behavior unchanged for public options

Format output SHALL preserve existing documented behavior for `indent`, `compact`, and `sortKeys`.

Pretty mode (`compact: false`) SHALL use clear structural line breaks, normalize single-line string values to double quotes, convert `'''` multiline strings to `"""`, remove trailing commas from objects and arrays, and preserve JSON5 key source forms.

Compact mode (`compact: true`) SHALL use compact layout, preserve source string token forms, eliminate whitespace-only blank lines, and keep header/footer comments co-located with containers and members as today.

When both `sortKeys: true` and `compact: true` are set, layout SHALL match compact mode with only object key order differing.

Trailing comma removal SHALL be applied in transform or emit to `trailingSep` (and equivalent array trailing separator), not during AST build.

#### Scenario: Trailing comma stripped on format

- **WHEN** input is `{ a: 1, }` and `JSON5.format` is called with default options
- **THEN** output SHALL not contain a trailing comma before `}`

#### Scenario: Compact sort produces no whitespace-only lines

- **WHEN** `JSON5.format` is called with `sortKeys: true, compact: true`
- **THEN** output SHALL NOT contain lines that are only whitespace

---

### Requirement: Comment slots store opaque strings in v1

In the first version, each comment anchor slot (`before`, `right`, `sep`, `openRight`, `closeBefore`, `closeRight`, `after`, `trailingSep`) SHALL store opaque raw string text including whitespace, sufficient for round-trip emission in slot order.

#### Scenario: Round-trip slot order on emit

- **WHEN** AST is emitted without sort or layout-normalizing options that reorder entries
- **THEN** emitted text SHALL concatenate slots in order: container `openRight`, entry `before`, key, value, entry `right`, entry `sep`, container `trailingSep`, container close slots, document `after`
