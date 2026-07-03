## MODIFIED Requirements

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

---

### Requirement: Comment slots store opaque strings in v1

**Reason**: Superseded by triplet interval slicing; comments are no longer stored as opaque strings on AST nodes.

**Migration**: Emit extracts comment text at emission time via `CommentSlicer`.
