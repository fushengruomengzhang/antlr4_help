## ADDED Requirements

### Requirement: JSON5Format is independent of json5 module

The fast format product line SHALL be implemented under `src/parser/json5-format/` and `src/grammars/json5-format/`. No file under `src/parser/json5-format/` SHALL import from `src/parser/json5/` or from generated parsers under `src/grammars/json5/`. The existing `JSON5.format` implementation SHALL remain unchanged.

#### Scenario: No json5 module imports in json5-format

- **WHEN** the dependency graph of `src/parser/json5-format/` is inspected
- **THEN** no import path SHALL resolve to `src/parser/json5/` or `src/grammars/json5/`

#### Scenario: Legacy format preserved

- **WHEN** `JSON5.format(input, options)` is called after this change
- **THEN** it SHALL continue to use the existing `src/parser/json5/` implementation

---

### Requirement: JSON5Format public export

The library SHALL export `JSON5Format` with a `format(input, options?)` method from the package entry. Options SHALL support `indent`, `sortKeys`, and `compact` with the same documented semantics as `JSON5.format`.

#### Scenario: Root export

- **WHEN** a consumer imports `{ JSON5Format }` from `src/index.js`
- **THEN** `JSON5Format.format` SHALL be callable and return a formatted string for valid JSON5 input

---

### Requirement: Independent format grammar

JSON5Format SHALL use dedicated ANTLR grammars `Json5FormatLexer.g4` and `Json5FormatParser.g4` under `src/grammars/json5-format/`, generated to the same directory. These grammars SHALL NOT import or reference `Json5Lexer` / `Json5Parser`.

#### Scenario: Generate target exists

- **WHEN** `npm run generate` is run
- **THEN** JavaScript lexer and parser for json5-format SHALL be emitted under `src/grammars/json5-format/`

---

### Requirement: Triple-quoted string format slots

The format document builder SHALL represent triple-quoted strings with `openRight` (hidden/layout after opener before body), concatenated `body` from `TRIPLE_S_BODY` / `TRIPLE_D_BODY` tokens, and `closeSource` from the close token. Opener-line comments SHALL NOT be attached to a parent object entry's `before` or `sep`.

#### Scenario: Opener inline comment on triple string

- **WHEN** input contains `''' // opener` before body content
- **THEN** the format document node for that string SHALL store the comment in `openRight`

#### Scenario: Body preserved for emit

- **WHEN** a triple-quoted value is formatted with `compact: true`
- **THEN** output SHALL preserve the original quote style and body text from the document node

---

### Requirement: Format performance faster than legacy on large objects

For an object with 2000 flat numeric members, `JSON5Format.format(input, { sortKeys: true, compact: true })` SHALL complete in less wall time per operation than `JSON5.format` with the same input and options, measured by the repository bench script.

#### Scenario: 2000-key sort compact bench

- **WHEN** the bench script compares legacy and JSON5Format on a 2000-key object
- **THEN** JSON5Format median time per operation SHALL be strictly less than JSON5.format median time

---

### Requirement: sortKeys moves entries with layout

When `sortKeys: true`, JSON5Format SHALL stably sort each object's entries by canonical key string. Each entry's layout slots (`before`, `right`, `sep`) SHALL move with the entry.

#### Scenario: Inline comment follows key after sort

- **WHEN** `JSON5Format.format` is called with `sortKeys: true, compact: true` on input with member inline comments
- **THEN** each comment SHALL remain attached to its member in output
