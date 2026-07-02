## MODIFIED Requirements

### Requirement: JSON5Format builds Document AST from parse tree layout nodes

The JSON5Format document builder SHALL derive comment text from parser `layout` nodes (LINE_COMMENT, BLOCK_COMMENT) in the parse tree. The builder SHALL NOT assign comment ownership using `getHiddenTokensToLeft` or `getHiddenTokensToRight` for comment tokens.

Hidden channel tokens MAY be used only for whitespace gaps between structural tokens, not for comment placement.

#### Scenario: Member prefix comment from layout node

- **WHEN** input contains a line comment on the line before a member key inside an object
- **THEN** the builder SHALL attach that comment to the member's `before` slot via the member's leading `layout*` parse nodes

#### Scenario: Opening brace inline comment from layout node

- **WHEN** input is `{ // header` followed by members
- **THEN** the comment SHALL be stored in `Object.openRight` from objectBody leading `layout*` and SHALL NOT duplicate on the first member's `before`

### Requirement: JSON5Format sortKeys moves members as units with attached layouts

When `sortKeys` is enabled, each object member entry SHALL move as a whole unit including its prefix layouts and suffix parts (comma, inline comments).

#### Scenario: Sort preserves prefix and inline comments

- **WHEN** `JSON5Format.format(input, { sortKeys: true, compact: true })` is called on input with section prefix comments and inline member comments
- **THEN** each comment SHALL appear exactly once attached to the correct sorted member
