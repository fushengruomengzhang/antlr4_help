## MODIFIED Requirements

### Requirement: JSON5Format output preserves comment ownership without duplication

When formatting valid JSON5 input, each comment or whitespace hidden region SHALL appear exactly once in the emitted output. Comments attached to container openers, member prefixes, inline suffixes, and separators SHALL NOT be duplicated on adjacent lines or entries.

#### Scenario: Opening brace inline comment not duplicated on first member

- **WHEN** input is `{ // header` followed by members on subsequent lines
- **THEN** the formatted output SHALL contain `// header` once (in the opening line context) and SHALL NOT repeat it on the first member's line

#### Scenario: Inline member comment not duplicated on next member

- **WHEN** input contains `"age": 18, // inline` followed by another member
- **THEN** `// inline` SHALL appear once on the age line and SHALL NOT appear again before the next member key

#### Scenario: Sort prefix comment not duplicated

- **WHEN** input contains a line comment before a key and `sortKeys: true` is used
- **THEN** the prefix comment SHALL appear once with its associated key after sorting

### Requirement: JSON5Format pretty triple-quoted strings are re-parseable

Pretty format (`compact: false`) SHALL emit triple-quoted strings with consistent opener and closer quote style matching the source delimiter family, and the emitted text SHALL be parseable by the JSON5Format grammar.

#### Scenario: Single-quote triple string pretty round-trip

- **WHEN** input contains a `'''`-delimited triple-quoted string with comments in `openRight` and body newlines
- **THEN** pretty-formatted output SHALL use `'''` for both open and close delimiters and SHALL parse without error

### Requirement: JSON5Format compact empty containers preserve structure

Compact format of empty objects and arrays with opener comments SHALL emit closing delimiter on the correct structural line, not merged into a sibling member suffix.

#### Scenario: Nested empty object with opener comment

- **WHEN** input contains `"user": { // comment\n  }` inside a compact-formatted object
- **THEN** output SHALL close the inner object with `}` before any trailing comma for the outer member
