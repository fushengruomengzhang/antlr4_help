## Context

All languages share `src/parser/core/parse-pipeline.js` → `runParsePipeline`. It already documents SLL-then-LL fallback, but `parseWithPrediction` only retries on a thrown exception. With ANTLR’s default error strategy, SLL mis-predictions (common on Java8 left-recursive two-segment names such as `import A.B;` / `package a.b;`) are recovered into listener errors without throwing, so LL never runs and callers see a false `ParseError`.

Investigation showed: pure LL accepts those inputs; SLL + `BailErrorStrategy` throws `ParseCancellationException` (the intended fallback signal).

## Goals / Non-Goals

**Goals:**

- Make SLL→LL fallback reliable for every consumer of `runParsePipeline`
- Preserve successful SLL path (no double-parse when SLL succeeds)
- Keep `ParseError` semantics for truly invalid input after LL completes
- Cover two-segment Java `import` / `package` with regression tests

**Non-Goals:**

- Changing Java8 / JSON `.g4` productions
- Rewriting qualified-name rules for SLL friendliness
- Changing JAVA8 / JSON5 / JSON4 public API shapes
- Tuning performance beyond the standard Bail+SLL pattern

## Decisions

### 1. Classic Bail + SLL, then LL + default strategy

**Choice:** On the first attempt, set `predictionMode = SLL` and `_errHandler = BailErrorStrategy`. On `ParseCancellationException` (or equivalent bail), `tokenStream.seek(0)`, `parser.reset()`, clear collected error listeners, restore default error strategy, set `predictionMode = LL`, and re-run the entry rule.

**Why not** “retry when `listener.errors.length > 0` after default-strategy SLL”? Bail fails fast without polluted recovery tokens; matching the well-documented ANTLR recipe is clearer and avoids depending on partial recoveries.

**Why not** always LL? Would fix correctness but pay LL cost on every parse; SLL-first keeps the fast path for unambiguous inputs (e.g. 3+ segment imports already succeed under SLL).

### 2. Clear error listeners before LL retry

**Choice:** Reset or replace `CollectingErrorListener` instances (lexer + parser) before the LL attempt so SLL bail noise cannot leak into `throwIfErrors`.

### 3. No grammar changes

**Choice:** Leave `typeName` / `packageOrTypeName` / `packageName` as-is. The grammar is valid under LL; the defect is pipeline fallback.

### 4. Shared fix, language-agnostic tests + Java regression

**Choice:** Implement once in `parse-pipeline.js`. Add focused tests that exercise Java8 two-segment forms (the known repro) via `JAVA8.firstClassName` / `signatures`; optionally a tiny unit-style assert that the pipeline no longer throws on `import foo.Bar;`.

## Risks / Trade-offs

- **[Risk] Bail on SLL changes failure mode for other languages** → Mitigation: LL retry still runs; invalid JSON/JSON5 still fail after LL with the same `ParseError` shape. Run existing `npm test`.
- **[Risk] Double-parse cost on SLL-hard inputs** → Acceptable; only ambiguous/SLL-failing inputs pay LL; matches ANTLR best practice.
- **[Risk] antlr4 4.9.3 JS Bail API naming differs** → Verify `antlr4.error.BailErrorStrategy` and cancellation exception type in this dependency (already confirmed throwable in spike).

## Migration Plan

- Drop-in fix; no caller migration.
- Rollback: revert `parse-pipeline.js` if regressions appear.

## Open Questions

- None blocking; optional later: flatten Java name rules for fewer SLL bailouts (out of scope).
