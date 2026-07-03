# json5-parse-sort-keys

## ADDED Requirements

### Requirement: JSON5.parse accepts optional sortKeys option

`JSON5.parse` SHALL accept an optional second argument `options` with shape `{ sortKeys?: boolean }`. When `options` is omitted or `sortKeys` is `false`, parse behavior SHALL match the pre-change implementation (source key and array element order preserved).

#### Scenario: Default parse preserves source order

- **WHEN** `JSON5.parse('{ b: 1, a: 2 }')` is called without options
- **THEN** the returned object SHALL have key insertion order `b` then `a`
- **AND** `result.b` SHALL be `1` and `result.a` SHALL be `2`

#### Scenario: sortKeys false preserves source order

- **WHEN** `JSON5.parse('{ b: 1, a: 2 }', { sortKeys: false })` is called
- **THEN** the returned object SHALL have key insertion order `b` then `a`

#### Scenario: Non-boolean sortKeys rejected

- **WHEN** `JSON5.parse('{}', { sortKeys: 1 })` is called
- **THEN** the implementation SHALL throw `TypeError`

---

### Requirement: sortKeys true stably sorts object keys by locale-aware string comparison

When `sortKeys: true`, the implementation SHALL recursively sort each object's keys using `keyA.localeCompare(keyB)` with stable tie-breaking by original source member index (`compareResult || originalIndex`). Keys SHALL be compared using the same decoded string form as `keyToString` in `decode.js`. Array elements SHALL NOT be reordered.

The comparison algorithm SHALL match `JSON5.format` `sortKeys: true` object key ordering (`localeCompare` without explicit locale argument).

#### Scenario: Top-level keys sorted

- **WHEN** `JSON5.parse('{ b: 2, a: 1 }', { sortKeys: true })` is called
- **THEN** `Object.keys(result)` SHALL equal `['a', 'b']`
- **AND** `result.a` SHALL be `1` and `result.b` SHALL be `2`

#### Scenario: Nested objects sorted recursively

- **WHEN** `JSON5.parse('{ z: { y: 1, x: 2 } }', { sortKeys: true })` is called
- **THEN** top-level `Object.keys(result)` SHALL equal `['z']`
- **AND** `Object.keys(result.z)` SHALL equal `['x', 'y']`

#### Scenario: Array element order unchanged

- **WHEN** `JSON5.parse('[3, 1, 2]', { sortKeys: true })` is called
- **THEN** the returned array SHALL deeply equal `[3, 1, 2]`

#### Scenario: Array inside sorted object unchanged

- **WHEN** `JSON5.parse('{ b: [3, 1], a: 0 }', { sortKeys: true })` is called
- **THEN** `Object.keys(result)` SHALL equal `['a', 'b']`
- **AND** `result.b` SHALL deeply equal `[3, 1]`

#### Scenario: Stable sort preserves source order on localeCompare tie

- **WHEN** two object keys compare equal under `localeCompare` (same decoded string value)
- **THEN** their relative order in the output object SHALL match their relative order in the source text

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
