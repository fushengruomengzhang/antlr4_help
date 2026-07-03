## MODIFIED Requirements

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
