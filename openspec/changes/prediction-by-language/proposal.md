## Why

The shared SLL+Bail→LL fallback fixed two-segment Java imports, but couples every language to a double-parse recipe that is hard to explain and easy to distrust. Java8 needs LL for correctness on short qualified names; JSON/JSON5 do not—and should keep a simple single-pass SLL path without Bail.

## What Changes

- Select ANTLR prediction mode **by language**: `java8` → LL; `json5` / `json` → SLL
- **Retire** SLL+Bail→LL fallback from `runParsePipeline` (no bail, no second parse, no bare catch retry)
- Keep public JAVA8 / JSON5 / JSON4 APIs unchanged; existing two-segment import / Lombok regression tests remain the acceptance gate
- Update `parse-pipeline` requirements to match language-split (superseding `fix-sll-ll-fallback` behavior)

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `parse-pipeline`: Replace universal SLL+Bail→LL fallback with per-language prediction (java8=LL, json*=SLL); remove bail/retry requirements

## Impact

- **Code**: `src/parser/core/parse-pipeline.js` (primary); call sites already pass `language`—no public API break
- **Related change**: Supersedes runtime strategy from active `fix-sll-ll-fallback` (same acceptance scenarios, different mechanism)
- **Tests**: Keep existing java8 two-segment / Lombok cases; no new public surface
- **Grammars**: Unchanged
