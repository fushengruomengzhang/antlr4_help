# json5-format-triplet-anchor

## Purpose

JSON5 `format` uses `AnchorTriplet` coordinates (`prev` / `current` / `next`) on semantic tokens. Comments are extracted at emit time by slicing HIDDEN-channel tokens from token-index intervals. Gap archaeology is forbidden.

## Requirements

### Requirement: AnchorTriplet records semantic token boundaries

The format AST builder SHALL assign each comment-bearing semantic token an `AnchorTriplet` with `prev`, `current`, and `next` coordinates (`tokenIndex`, `start`, `stop`, `line`, `col`). `prev` and `next` SHALL be boundary tokens that define comment intervals, not necessarily the immediately adjacent stream token at `idx±1`. Stream-start and stream-end sentinel coordinates SHALL close intervals for file header and footer comments.

#### Scenario: Object open anchor uses sentinel prev

- **WHEN** the AST builder processes a root object whose `{` is the first visible token
- **THEN** `open.prev` SHALL be the stream-start sentinel
- **AND** prefix comments before `{` SHALL be discoverable via interval `(open.prev, open.current)`

#### Scenario: Entry key anchor uses previous separator boundary

- **WHEN** the AST builder processes the second object member key
- **THEN** `key.prev` SHALL be the previous member's `end.current` token (typically `COMMA`)
- **AND** prefix comments before that key SHALL be discoverable via interval `(key.prev, key.current)`

---

### Requirement: AST build stores structure without comment strings

The AST builder SHALL NOT populate comment or layout string slots (`before`, `suffix`, `openRight`, `closeBefore`, `after`, etc.) on Document, container, or entry nodes. Comment text SHALL be deferred to the emit phase.

#### Scenario: ObjectEntry has triplet anchors only

- **WHEN** `buildDocumentAst` completes for an object with commented members
- **THEN** each `ObjectEntry` SHALL contain `key` and `end` `AnchorTriplet` values and SHALL NOT contain `before` or `suffix` string fields

---

### Requirement: Emit extracts comments by token-index interval slicing

The emit phase SHALL instantiate a comment slicer over the filled token stream. Prefix comments SHALL be HIDDEN-channel comment tokens with indices strictly between `triplet.prev.tokenIndex` and `triplet.current.tokenIndex`. Suffix comments SHALL be HIDDEN-channel comment tokens strictly between `triplet.current.tokenIndex` and `triplet.next.tokenIndex`, optionally filtered to `triplet.current.line` for inline suffix slots.

#### Scenario: Prefix preserves comment source text

- **WHEN** emit processes an entry whose key interval contains `// 中文 key`
- **THEN** output SHALL include the literal text `// 中文 key` before that key

#### Scenario: Inline suffix same-line filter

- **WHEN** emit processes an entry whose end interval contains `// 年龄` on the same line as the member comma
- **THEN** output SHALL emit `, // 年龄` (or equivalent) on the same line as the member value in compact sort mode

#### Scenario: Open brace inline comment via open suffix interval

- **WHEN** input is `{ // head` followed by members
- **THEN** emit SHALL place `// head` on the same line as `{` using the object `open` suffix interval
- **AND** SHALL NOT attach that comment to the first member's key prefix interval

---

### Requirement: No gap archaeology during emit

The emit phase SHALL NOT scan reformatted output gaps, cross-entry heuristic spans, or source regions outside the `AnchorTriplet` intervals defined at build time. The implementation SHALL NOT use `purePrefixHiddenTokens`, `excludedNextMemberPrefixIndices`, or equivalent gap-reconstruction helpers.

#### Scenario: Sort moves entries without re-scanning token stream

- **WHEN** `sortKeys: true` is applied in transform
- **THEN** each entry's prefix and suffix comments SHALL be extracted only from that entry's build-time triplets
- **AND** transform SHALL NOT reassign comments by scanning token spans

#### Scenario: Prefix follows key after sort

- **WHEN** `JSON5.format` runs with `sortKeys: true` on input where `// 中文 key` precedes key `中文字段`
- **THEN** output SHALL place `// 中文 key` immediately before `中文字段` in sorted position
- **AND** SHALL NOT place that comment before a different key such as `$key`

#### Scenario: Sort prefix follows key anchor not source hoist

- **WHEN** `JSON5.format` runs with `sortKeys: true, compact: true` on input where `// 字符串` precedes key `1` and `// 下划线` precedes `"_private"`
- **THEN** `// 下划线` SHALL appear immediately before `"_private"` in sorted position
- **AND** `// 字符串` SHALL appear immediately before key `1` in sorted position
- **AND** `// 字符串` SHALL NOT appear before `"_private"` solely because it appeared earlier in source order

---

### Requirement: Open inline comments use suffix interval only

Opening-brace inline comments SHALL be extracted via `suffixComments(openTriplet, sameLineOnly=true)` on the Triplet interval between `open.current` and `open.next`. The implementation SHALL NOT use whole-source-line scanning (`openLineComments`) that attributes comments on the same physical line as `{` but after `,` on an entry span.

#### Scenario: Empty object inline not attributed to inner brace

- **WHEN** input is `"emptyObject": {}, // 空对象`
- **THEN** output SHALL be `"emptyObject": {}, // 空对象` on one logical compact line
- **AND** SHALL NOT emit `{ // 空对象` for the inner empty object

#### Scenario: Opening brace head comment preserved

- **WHEN** input is `{ // head` followed by members
- **THEN** output SHALL place `// head` on the same line as `{`

---

### Requirement: Formatter rewrites whitespace, preserves comment text

Emit SHALL output literal comment token text from interval slices. Pure-whitespace HIDDEN tokens SHALL NOT be copied from source; structural whitespace (newlines, indentation, spacing around `:` and `,`) SHALL be produced by the formatter according to `compact`, `sortKeys`, and `indent` options.

#### Scenario: Compact sort eliminates whitespace-only lines

- **WHEN** `JSON5.format` is called with `sortKeys: true, compact: true`
- **THEN** output SHALL NOT contain lines that are only whitespace
- **AND** SHALL still preserve comment text from interval slices

#### Scenario: Last member inline without comma

- **WHEN** input contains `"zip": "100000" // 邮编` as the last member without trailing comma
- **THEN** output SHALL keep `// 邮编` on the same line as the value in compact mode

---

### Requirement: Performance regression guard

After implementation, `buildDocumentAst` on the 2000-key benchmark input SHALL NOT exceed the recorded pre-refactor baseline of **1.522 ms/op** by more than 10%, and end-to-end `JSON5.format` on the same input with `sortKeys: true, compact: true` SHALL NOT exceed **4.232 ms/op** by more than 10%.

#### Scenario: Bench comparison recorded

- **WHEN** implementation is complete
- **THEN** `node scripts/bench-json5.mjs` SHALL be executed and results compared to the pre-refactor baseline documented in `design.md`
