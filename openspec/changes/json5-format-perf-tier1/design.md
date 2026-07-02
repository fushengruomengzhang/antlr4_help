## Context

After `json5-format-ast-pipeline`, format uses a three-phase AST pipeline (build → transform → emit). Profiling shows two distinct bottlenecks:

1. **Compact emit O(n²)**: `TextBuf.beginMemberLine` calls `materialize()` (full `head + parts.join('')`) before every member in `emitObjectCompact` / `emitArrayCompact`. On a 2000-key flat object, emit alone ~14 ms vs ~0.25 ms for pretty.

2. **Build redundant span scans**: `ast-builder.js` computes `suffix` and `suffixSort` with separate `spanBetween` loops, and pure-prefix analysis (`isNextMemberPurePrefix`) scans the same range again. The deleted `format-emitter.js` had `_spanCache: Map<"from:to", SpanEntry[]>` to amortize this.

Public output is locked by `test/resources/expected/json5/` baselines; changes must be behavior-preserving.

## Goals / Non-Goals

**Goals:**

- Fix `TextBuf` so compact emit is O(n) in total output length.
- Add span cache to `TokenStreamHelper` and deduplicate boundary scans in `ast-builder.js`.
- Extend bench script with segmented timings for regression visibility.
- Keep `npm test` green without baseline updates.

**Non-Goals:**

- Lazy slot build (options-dependent AST fields) — separate future change.
- Parse/validate path changes.
- Changing format output rules or AST slot schema.
- CI integration of benchmarks (manual script only, matching existing practice).

## Decisions

### 1. Incremental line state in TextBuf (not pre-sized single buffer)

**Choice:** Track whether the buffer ends at a line boundary and append newline + indent directly to `parts` without materializing `head` on each `beginMemberLine`.

**Approach:**

- Add internal flags: e.g. `_endsWithNewline`, `_pendingMemberIndent` or equivalent.
- `beginMemberLine`: trim trailing spaces on the *current line only* (last part or tail scan of last part), push `\n` + indent string, reset `parts` merge into `head` only when `materialize()` is explicitly needed—or avoid materialize entirely until `toString()`.
- `beginCloseLine`: same pattern with container depth indent.

**Alternatives considered:**

- *Pre-allocate one big Array and join once at end* — works for flat objects but harder for nested compact with interleaved `beginMemberLine` / `beginCloseLine`.
- *Keep materialize but cache line count* — still O(n²); rejected.

**Rationale:** Minimal API surface change (`TextBuf` is internal); emit code in `emit.js` stays unchanged.

### 2. Span cache on TokenStreamHelper instance (per build)

**Choice:** Port legacy emitter cache shape:

```javascript
// cacheKey = `${fromTok.tokenIndex}:${toTok.tokenIndex}`
// value = [{ idx: number, text: string }, ...]
```

`spanBetween(from, to, exclude)`:

1. Lookup or populate cache entry by scanning token indices once.
2. If no `exclude`, `entries.map(e => e.text).join('')`.
3. If `exclude`, filter then join.

**Alternatives considered:**

- *Module-level global cache* — risks stale token stream; rejected.
- *Pass cache from ast-builder* — more plumbing; instance field is enough.

**Rationale:** One `TokenStreamHelper` per `buildDocumentAst` call; cache lifetime is clear.

### 3. ast-builder deduplication patterns

**Choice:**

- For each member boundary, call `spanBetween(valStop, sourceNextKey)` once → `suffix`; call `spanBetween(valStop, sourceNextKey, exclude)` for `suffixSort` (cache hit, filter only).
- Refactor `isNextMemberPurePrefix` to accept precomputed span string instead of re-calling `spanBetween`.
- For arrays where `suffix === suffixSort` (no exclude logic), assign one variable to both fields.

**Rationale:** Smallest diff; no slot schema change.

### 4. Benchmark targets (informational, not CI gates)

| Scenario | Phase | Target vs pre-change |
|----------|-------|----------------------|
| 2000 keys, compact | emit | ≥5× faster |
| 2000 keys, sort+compact | end-to-end | no regression |
| fixture, default format | end-to-end | ≤10% slower than post-AST baseline (build cache may recover part of gap) |

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| TextBuf line-trim logic changes whitespace at line ends | Run full `npm test`; add unit test for `TextBuf` line helpers if gaps found |
| Span cache memory on huge files | Cache scoped to one build; cleared when helper is GC'd |
| `beginMemberLine` edge cases (empty object, nested depth) | Cover with existing format expected files + manual nested compact cases |
| Filtered `suffixSort` diverges from old double-scan | Compare builder slot tests and full expected baselines |

## Migration Plan

1. Implement TextBuf fix; run `npm test`.
2. Add span cache + builder dedup; run `npm test`.
3. Update `scripts/bench-json5.mjs` with segmented section.
4. Record before/after numbers in PR description (manual).

Rollback: revert commits; no data migration.

## Open Questions

- None blocking — lazy build explicitly deferred.

## Benchmark Results (post tier-1)

Pre-change baseline (same machine, `scripts/bench-json5.mjs`):

| Scenario | End-to-end | Emit (segmented) |
|----------|------------|------------------|
| fixture default | 0.691 ms | ~0.024 ms |
| 2000 keys compact | 18.501 ms | ~14 ms |

Post-change:

| Scenario | End-to-end | Emit (segmented) | Speedup |
|----------|------------|------------------|---------|
| fixture default | 0.735 ms | 0.015 ms | ~same e2e |
| 2000 keys compact | 4.159 ms | 0.801 ms | **4.4× e2e, ~17× emit** |
| 2000 keys sort+compact | 4.357 ms | 0.972 ms | **4.4× e2e** |

Build phase on fixture: ~0.13 ms → ~0.09 ms (span cache).
