## 1. Baseline

- [x] 1.1 Run `node scripts/bench-json5.mjs` and record end-to-end + note current segmented timings (parse/build/emit) for fixture and 2000-key compact as pre-change reference

## 2. TextBuf compact emit fix

- [x] 2.1 Refactor `TextBuf.beginMemberLine` and `beginCloseLine` to avoid full `materialize()` on each call; use incremental line-boundary state per `design.md`
- [x] 2.2 Verify `materialize()` / `toString()` still produce identical output for existing format paths (pretty unchanged)
- [x] 2.3 Run `npm test` — all JSON5 expected baselines must pass without updates

## 3. Span cache in build phase

- [x] 3.1 Add `_spanCache` to `TokenStreamHelper.spanBetween` keyed by `fromIdx:toIdx`, storing `{ idx, text }[]` entries (port from legacy `format-emitter`)
- [x] 3.2 Update `isNextMemberPurePrefix` to accept precomputed span text instead of re-scanning
- [x] 3.3 In `ast-builder.js`, compute `suffix` once per boundary; derive `suffixSort` via cached filter; share one span for array entries where exclude is unused
- [x] 3.4 Run `npm test` including AST builder slot assertions

## 4. Benchmark script

- [x] 4.1 Extend `scripts/bench-json5.mjs` with segmented timings: parse+fill, buildDocumentAst, transform, emit (fixture + 2000-key compact/sort+compact)
- [x] 4.2 Re-run bench and confirm 2000-key compact emit meets ≥5× improvement target; document results in change notes or PR

## 5. Validation

- [x] 5.1 Run `openspec validate --all`
- [x] 5.2 Mark all tasks complete in `tasks.md`
