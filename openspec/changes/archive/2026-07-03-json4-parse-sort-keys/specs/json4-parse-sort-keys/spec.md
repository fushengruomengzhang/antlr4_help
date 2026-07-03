# json4-parse-sort-keys

## ADDED Requirements

### Requirement: JSON4.parse accepts optional sortKeys option

`JSON4.parse` SHALL accept an optional second argument `options` with shape `{ sortKeys?: boolean }`. When `options` is omitted or `sortKeys` is `false`, parse behavior SHALL match the pre-change implementation (source key and array element order preserved).

#### Scenario: Default parse preserves source order

- **WHEN** `JSON4.parse('{"b":1,"a":2}')` is called without options
- **THEN** the returned object SHALL have key insertion order `b` then `a`
- **AND** `result.b` SHALL be `1` and `result.a` SHALL be `2`

#### Scenario: sortKeys false preserves source order

- **WHEN** `JSON4.parse('{"b":1,"a":2}', { sortKeys: false })` is called
- **THEN** the returned object SHALL have key insertion order `b` then `a`

#### Scenario: Non-boolean sortKeys rejected

- **WHEN** `JSON4.parse('{}', { sortKeys: 1 })` is called
- **THEN** the implementation SHALL throw `TypeError`

---

### Requirement: sortKeys true stably sorts object keys by locale-aware string comparison

When `sortKeys: true`, the implementation SHALL recursively sort each plain object's keys using `keyA.localeCompare(keyB)` with stable tie-breaking by original source pair index (`compareResult || originalIndex`). The implementation SHALL rebuild each object using `Object.create(null)` with keys inserted in sorted order. Array elements SHALL NOT be reordered.

The comparison algorithm SHALL match `JSON5.format` `sortKeys: true` object key ordering (`localeCompare` without explicit locale argument).

#### Scenario: Top-level keys sorted

- **WHEN** `JSON4.parse('{"b":2,"a":1}', { sortKeys: true })` is called
- **THEN** `Object.keys(result)` SHALL equal `['a', 'b']`
- **AND** `result.a` SHALL be `1` and `result.b` SHALL be `2`

#### Scenario: Nested objects sorted recursively

- **WHEN** `JSON4.parse('{"z":{"y":1,"x":2}}', { sortKeys: true })` is called
- **THEN** top-level `Object.keys(result)` SHALL equal `['z']`
- **AND** `Object.keys(result.z)` SHALL equal `['x', 'y']`

#### Scenario: Array element order unchanged

- **WHEN** `JSON4.parse('[3,1,2]', { sortKeys: true })` is called
- **THEN** the returned array SHALL deeply equal `[3, 1, 2]`

#### Scenario: Array inside sorted object unchanged

- **WHEN** `JSON4.parse('{"b":[3,1],"a":0}', { sortKeys: true })` is called
- **THEN** `Object.keys(result)` SHALL equal `['a', 'b']`
- **AND** `result.b` SHALL deeply equal `[3, 1]`

#### Scenario: Stable sort preserves source order on localeCompare tie

- **WHEN** two object keys compare equal under `localeCompare` (same string value)
- **THEN** their relative order in the output object SHALL match their relative order in the source text

#### Scenario: Unicode keys use localeCompare

- **WHEN** `JSON4.parse` is called with `sortKeys: true` on input containing Unicode string keys
- **THEN** key order SHALL follow `String.prototype.localeCompare` on decoded key strings

---

### Requirement: JSON4 module documents parse options

The `src/parser/json/index.js` module documentation SHALL describe the optional `options` argument, the `sortKeys` field (default `false`), and that array elements are not sorted when `sortKeys` is enabled.

#### Scenario: Public API documentation lists sortKeys

- **WHEN** a consumer reads `JSON4.parse` JSDoc in `src/parser/json/index.js`
- **THEN** it SHALL document `options.sortKeys` as an optional boolean defaulting to `false`
- **AND** SHALL state that only object keys are sorted, not array elements
