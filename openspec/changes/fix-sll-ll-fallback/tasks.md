## 1. Pipeline fix

- [x] 1.1 Update `parseWithPrediction` / `runParsePipeline` to use SLL + `BailErrorStrategy`, then on bail reset stream/parser, clear listeners, retry with LL + default error strategy
- [x] 1.2 Ensure successful LL retry does not surface stale SLL diagnostics via `throwIfErrors`

## 2. Regression tests

- [x] 2.1 Add tests for two-segment `import foo.Bar;` and `package a.b;` via `JAVA8.firstClassName`
- [x] 2.2 Add test for Lombok-style `import lombok.Data;` (and related two-segment lombok imports) via `JAVA8.signatures`
- [x] 2.3 Add test that truly invalid Java still throws `ParseError` with `language: 'java8'`

## 3. Verify

- [x] 3.1 Run `npm test` and confirm existing suites still pass
- [x] 3.2 Run `openspec validate --change fix-sll-ll-fallback` (or `--all`) to confirm artifacts remain valid
