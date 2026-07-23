## 1. Pipeline

- [x] 1.1 Replace SLL+Bail→LL in `parse-pipeline.js` with language-based mode: `java8` → LL, `json5`/`json` → SLL; single parse; default error strategy only
- [x] 1.2 Remove Bail retry helpers no longer needed (`parseWithPrediction` catch path / `clear()` if unused)

## 2. Docs / peek alignment

- [x] 2.1 Update pipeline comments; optionally note in `peek-first-class-name.js` that java8 policy is LL

## 3. Verify

- [x] 3.1 Run `npm test` (including two-segment import / Lombok / invalid ParseError cases)
- [x] 3.2 Run `openspec validate --changes` (or `--all`)
