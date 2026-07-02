## ADDED Requirements

### Requirement: Compact emit avoids quadratic string copying

The compact format emit path (`compact: true`) SHALL NOT perform full-buffer materialization (joining all output built so far) on each member or array element line break. Line-break helpers in `TextBuf` SHALL maintain incremental state so total work for emitting N members scales linearly with total output size, not quadratically.

#### Scenario: Large flat object compact emit is linear-time

- **WHEN** `JSON5.format` is called with `{ compact: true }` on input containing a single object with 2000 simple numeric members and no comments
- **THEN** emit-phase time SHALL be at least 5× faster than the pre-change baseline measured on the same hardware with `scripts/bench-json5.mjs` segmented emit timing
- **AND** output text SHALL match the existing expected baseline byte-for-byte

#### Scenario: Pretty emit unchanged

- **WHEN** `JSON5.format` is called with default (pretty) options on the comment-heavy fixture
- **THEN** output SHALL remain identical to pre-change baselines
- **AND** pretty emit SHALL NOT regress in wall-clock time by more than 10% on the fixture benchmark

---

### Requirement: Build phase caches token spans between indices

`TokenStreamHelper.spanBetween` SHALL cache the token text entries for each `(fromTokenIndex, toTokenIndex)` pair for the lifetime of a single `buildDocumentAst` call. Subsequent requests for the same pair with an `excludeIndices` filter SHALL derive from the cached entries without re-scanning the token array.

#### Scenario: suffix and suffixSort share one scan

- **WHEN** the AST builder computes both `suffix` and `suffixSort` for the same object member boundary
- **THEN** the implementation SHALL perform at most one full token-index scan for that boundary
- **AND** `suffixSort` SHALL be produced by filtering excluded indices from the cached span entries

#### Scenario: Pure-prefix analysis reuses cached span

- **WHEN** `isNextMemberPurePrefix` or `excludedNextMemberPrefixIndices` needs the text between `valStop` and `nextKeyTok`
- **THEN** the implementation SHALL reuse the cached span for that token index pair rather than invoking an independent scan loop

---

### Requirement: Format output behavior unchanged

All optimizations in this capability SHALL preserve existing format semantics defined in `json5-format-ast`. No public API signature, option name, or documented output rule SHALL change.

#### Scenario: Full test suite passes unchanged

- **WHEN** `npm test` runs after performance changes
- **THEN** all JSON5 format expected-file comparisons SHALL pass without updating baselines
- **AND** AST builder slot assertions in tests SHALL continue to pass

#### Scenario: Segmented benchmark script available

- **WHEN** a maintainer runs `node scripts/bench-json5.mjs`
- **THEN** the script SHALL report per-phase timings (parse+fill, build, transform, emit) in addition to end-to-end format timings for the fixture and at least one large-key scenario
