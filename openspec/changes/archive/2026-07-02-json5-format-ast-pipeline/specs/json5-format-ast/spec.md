## ADDED Requirements

### Requirement: Document AST build assigns comments on value grammar without emit re-derivation

The format implementation SHALL assign all comment and layout text to Document AST slots during the build phase using the existing `Json5Parser.g4` parse tree and filled token stream. Object and array entry `sep` boundaries SHALL be determined by g4 `COMMA` tokens (`object.COMMA(i)`, `array.COMMA(i)`), not by emit-time heuristics. The emit phase SHALL concatenate pre-assigned slot strings and SHALL NOT call `getHiddenTokensToLeft`, `getHiddenTokensToRight`, or span-based comment ownership heuristics (including prefix versus inline classification) during emission.

#### Scenario: Build uses g4 COMMA for sep

- **WHEN** the AST builder processes an object with two members separated by a g4 `COMMA` token
- **THEN** the first member's `sep` SHALL include the COMMA character and following hidden text until the next member's key
- **AND** the second member's `before` SHALL contain only hidden text before its key start

#### Scenario: Emit does not re-derive comment ownership

- **WHEN** `emitDocument` runs after build and transform
- **THEN** it SHALL NOT invoke token-stream archaeology helpers to assign comments to members
- **AND** output SHALL be produced by concatenating entry and container slot strings in documented order

#### Scenario: sortKeys moves entries after build

- **WHEN** `sortKeys: true` is applied in the transform phase
- **THEN** each `ObjectEntry` including `before`, `right`, and `sep` SHALL move as a unit
- **AND** the transform phase SHALL NOT re-scan the token stream to reassign prefix comments
