## Why

JSON5 `format` after the AST pipeline refactor is measurably slower in two hot paths: **compact emit** on large objects suffers O(n²) string copying via `TextBuf.beginMemberLine`, and **AST build** repeats token-span scans without the span cache the old `format-emitter` had. These are pure performance regressions—output must stay byte-identical to current baselines.

## What Changes

- **TextBuf compact path**: Rework `beginMemberLine` / `beginCloseLine` so compact emit does not call full `materialize()` on every member line (eliminate O(n²) copying).
- **Token span cache in build**: Add `_spanCache` to `TokenStreamHelper` (same keying as legacy emitter: `fromIdx:toIdx`), and deduplicate `spanBetween` work when computing `suffix` / `suffixSort` and pure-prefix analysis.
- **Benchmark guardrails**: Extend `scripts/bench-json5.mjs` with segmented timings (parse / build / transform / emit) and document before/after targets for the 2000-key compact case and the comment-heavy fixture.
- **No API or output changes**: `JSON5.format` signatures and all `test/resources/expected/json5/` baselines remain unchanged.

## Capabilities

### New Capabilities

- `json5-format-perf`: Performance requirements for the format pipeline (TextBuf emit complexity, build-phase span caching) without altering public format semantics.

### Modified Capabilities

- _(none — behavior requirements stay in `json5-format-ast`; this change only tightens internal performance constraints)_

## Impact

- `src/parser/core/text-buf.js` — compact line helpers
- `src/parser/json5/format/token-helpers.js` — span cache
- `src/parser/json5/format/ast-builder.js` — reuse cached spans, avoid duplicate scans
- `scripts/bench-json5.mjs` — segmented benchmarks
- Tests: existing `npm test` must pass unchanged; bench script for manual regression checks
