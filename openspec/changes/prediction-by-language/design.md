## Context

`fix-sll-ll-fallback` made `runParsePipeline` use SLL+Bail then LL on cancellation. That restores `import foo.Bar;` / Lombok imports but leaves a shared double-parse path that is opaque and over-general for JSON. Call sites already pass `language` (`java8` | `json5` | `json`).

## Goals / Non-Goals

**Goals:**

- Map prediction by language: `java8` → LL; `json5` / `json` → SLL
- Single parse per invocation (no Bail, no retry catch)
- Preserve acceptance behavior for two-segment Java imports / Lombok / invalid `ParseError`
- Align `peekFirstClassName` documentation with java8=LL (implementation already default/LL-like)

**Non-Goals:**

- Grammar rewrites for SLL-friendly names
- Public API signature changes
- Always-LL for JSON
- Keeping Bail as a JSON safety net

## Decisions

### 1. Implicit mapping from `language` (no new public option)

**Choice:** Inside `runParsePipeline`, derive mode from `language === 'java8' ? LL : SLL`. Call sites unchanged.

**Why not** explicit `prediction: 'll'|'sll'`? Extra surface for a learning library; language already encodes the policy. Can add an override later if needed.

### 2. Retire Bail→LL entirely

**Choice:** Delete `BailErrorStrategy`, catch/retry, and `CollectingErrorListener.clear()` usage tied to retry. One prediction mode, default error strategy, then `throwIfErrors`.

**Why not** keep Bail for JSON? No known JSON SLL failure in this repo; retaining Bail reintroduces the disliked recipe.

### 3. Spec supersession of `fix-sll-ll-fallback`

**Choice:** Delta `parse-pipeline` removes SLL+Bail retry requirements and adds language-split requirements. Same external scenarios (two-segment import, Lombok, invalid still errors).

## Risks / Trade-offs

- **[Risk] Unknown JSON SLL edge case** → Mitigation: existing JSON5/JSON4 tests; if found later, either LL for that language or a narrow fix—not restore global Bail by default.
- **[Risk] Two active changes conflict on archive** → Mitigation: archive/sync order documented; this change REMOVES bail requirements and ADDS language-split; prefer applying this after or instead of treating bail as final.
- **[Risk] Slightly slower java8** → Acceptable; correctness-first for Model parsing.

## Migration Plan

- Drop-in for callers.
- Rollback: restore Bail path from `fix-sll-ll-fallback` commit if needed.

## Open Questions

- None blocking. Optional later: explicit `prediction` override for experiments.
