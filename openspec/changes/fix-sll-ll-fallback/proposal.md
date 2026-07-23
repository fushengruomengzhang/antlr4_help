## Why

Java sources with two-segment qualified names (e.g. `import lombok.Data;`, `package a.b;`) fail under the shared parse pipeline even though the Java8 grammar accepts them in LL mode. The pipeline intends SLL-then-LL fallback but only retries when SLL throws; with the default error strategy SLL records a recoverable error and never falls back—blocking real-world Lombok and short package/import forms.

## What Changes

- Fix `runParsePipeline` / `parseWithPrediction` to use the classic ANTLR pattern: **SLL + BailErrorStrategy**, and on cancellation **reset and retry with LL + default error strategy**
- Clear collected lexer/parser errors from a failed SLL attempt before the LL retry so stale SLL diagnostics do not surface as `ParseError`
- Keep public JAVA8 / JSON5 / JSON4 APIs unchanged (same entrypoints and `ParseError` shape)
- Add regression coverage for two-segment `import` / `package` (and a Lombok-style Java fixture path)

## Capabilities

### New Capabilities

- `parse-pipeline`: Shared ANTLR parse pipeline prediction fallback (SLL→LL) behavior for all languages that use `runParsePipeline`

### Modified Capabilities

- (none — no existing `openspec/specs/` requirements yet; this introduces the pipeline capability)

## Impact

- **Code**: `src/parser/core/parse-pipeline.js` (primary); any language using `runParsePipeline` (java8, json5, json) benefits automatically
- **APIs**: No signature changes; previously failing valid Java inputs become parseable
- **Grammars**: No `.g4` changes required
- **Tests**: New cases under `test/` for 2-segment names / Lombok-style imports
