## 1. Minify-safe literal walk

- [x] 1.1 Import `Java8Parser` in `annotation-parser.js` and rewrite `findLiteralInExpression` to use `instanceof` for `LiteralContext`, method-invocation lf variants, class-instance-creation lf variants, `LambdaExpressionContext`, and ternary `ConditionalExpressionContext`
- [x] 1.2 Confirm no remaining `constructor.name` / Context string matches under `src/parser/`

## 2. Regression tests

- [x] 2.1 Add `JAVA8.signatures` tests for `@ApiModelProperty(value=…, hidden=true)` and single-element `@ApiModelProperty("…")`
- [x] 2.2 Add test that non-literal `@ApiModelProperty(value = Msg.X)` does not set `value`

## 3. Verify

- [x] 3.1 Run `npm test` and confirm suites pass
- [x] 3.2 Run `openspec validate --change minify-safe-annotation-literals` (or `--all`)
