## ADDED Requirements

### Requirement: Format pipeline migration removes legacy emitter modules

After the AST format pipeline is wired, the repository SHALL remove `format-emitter.js` and SHALL not retain emit-time comment archaeology in production code under `src/parser/json5/`.

#### Scenario: format-emitter removed

- **WHEN** the migration is complete
- **THEN** `src/parser/json5/format-emitter.js` SHALL NOT exist
- **AND** `JSON5.format` SHALL be exported from `format.js` using the `format/` directory modules

#### Scenario: value-visitor split into validate and parse

- **WHEN** the migration is complete
- **THEN** `validate.js` and `parse.js` SHALL exist under `src/parser/json5/`
- **AND** `value-visitor.js` SHALL NOT exist
