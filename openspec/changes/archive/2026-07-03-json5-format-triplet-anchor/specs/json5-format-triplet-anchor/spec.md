## ADDED Requirements

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

---

### Requirement: Formatter rewrites whitespace, preserves comment text

Emit SHALL output literal comment token text from interval slices. Pure-whitespace HIDDEN tokens SHALL NOT be copied from source; structural whitespace (newlines, indentation, spacing around `:` and `,`) SHALL be produced by the formatter according to `compact`, `sortKeys`, and `indent` options.

#### Scenario: Compact sort eliminates whitespace-only lines

- **WHEN** `JSON5.format` is called with `sortKeys: true, compact: true`
- **THEN** output SHALL NOT contain lines that are only whitespace
- **AND** SHALL still preserve comment text from interval slices

---

### Requirement: Performance regression guard

After implementation, `buildDocumentAst` on the 2000-key benchmark input SHALL NOT exceed the recorded pre-refactor baseline of **1.522 ms/op** by more than 10%, and end-to-end `JSON5.format` on the same input with `sortKeys: true, compact: true` SHALL NOT exceed **4.232 ms/op** by more than 10%.

#### Scenario: Bench comparison recorded

- **WHEN** implementation is complete
- **THEN** `node scripts/bench-json5.mjs` SHALL be executed and results compared to the pre-refactor baseline documented in `design.md`
