## MODIFIED Requirements

### Requirement: No gap archaeology during emit

The emit phase SHALL NOT scan reformatted output gaps or hoist prefix comments to the first sorted key. Prefix comments SHALL be extracted only from each entry's `key` Triplet interval A and emitted immediately before that entry's key in sorted output order.

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

Emit SHALL output literal comment token text from Triplet interval slices. Pure-whitespace HIDDEN tokens SHALL NOT be copied from source.

#### Scenario: Last member inline without comma

- **WHEN** input contains `"zip": "100000" // 邮编` as the last member without trailing comma
- **THEN** output SHALL keep `// 邮编` on the same line as the value in compact mode
