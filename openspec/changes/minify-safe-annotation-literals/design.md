## Context

Annotation attribute values are extracted in `src/parser/java8/annotation-parser.js` → `findLiteralInExpression`. The walker currently classifies AST nodes with `node.constructor?.name` string compares (`LiteralContext`, `includes('MethodInvocation')`, etc.). Vite production builds minify with esbuild, which renames those classes; string matches fail and annotation attrs become `{}` while Node unbundled runs stay correct.

Repo audit: this is the **only** `constructor.name`-based AST dispatch under `src/parser/`. `peek-first-class-name.js` already uses `instanceof Java8Parser.*Context`.

## Goals / Non-Goals

**Goals:**

- Make annotation literal extraction correct after class-name minification (Vite/esbuild/terser)
- Preserve existing semantics for string/boolean/number/null literals and for blocking method calls / `new` / lambda / ternary
- Align with the existing `instanceof` pattern used by peek

**Non-Goals:**

- Resolving compile-time constant refs or enum constants in annotations
- Changing `API.java8ToApiSchema` field mapping (`hidden` / `notes` still unused there)
- Renaming `PeekFirstClassNameComplete`’s `error.name` payload field
- Adding Vite as a project dependency (minify smoke may use one-shot `npx esbuild` or stay optional)

## Decisions

### 1. Use `instanceof Java8Parser.*Context`, not `ruleIndex` alone

**Choice:** Import `Java8Parser` and replace name checks with `instanceof` against the concrete context classes exported on the parser (including `_lf_primary` / `_lfno_primary` variants for method invocation and class instance creation).

**Why not** `ruleIndex` Set only? Also minify-safe, but `instanceof` matches peek and keeps intent readable.

**Why not** consumer-side `keepNames`? Fixes one app; library must be correct for all bundlers.

### 2. Explicit block list (no broad `includes('Lambda')`)

**Choice:** Block only:

- `MethodInvocationContext`, `MethodInvocation_lf_primaryContext`, `MethodInvocation_lfno_primaryContext`
- `ClassInstanceCreationExpressionContext`, `…_lf_primary`, `…_lfno_primary`
- `LambdaExpressionContext`
- `ConditionalExpressionContext` when `QUESTION()` is present

**Why:** Old `includes('Lambda')` also matched parameters/body contexts; narrowing to `LambdaExpression` is enough because those only appear under a lambda subtree that is already blocked at the expression root.

### 3. Keep `parseLiteral` unchanged

**Choice:** Once a `LiteralContext` is identified via `instanceof`, existing token helpers (`StringLiteral`, `BooleanLiteral`, …) stay as-is.

### 4. Tests: behavioral + optional minify smoke

**Choice:** Required: assert `@ApiModelProperty(value=…, hidden=true)` (and single-element form) yield non-empty attrs via `JAVA8.signatures`. Optional/nice: esbuild `bundle --minify` of a tiny harness that imports signatures — skip if adding deps is undesirable; a pure logic rewrite without smoke still fixes Vite when consumers pull the fixed source.

**Preference for this change:** Add an in-repo smoke script under `test/` that shells `npx esbuild` (no package.json dependency) if network/CI allows; otherwise document and rely on instanceof + unit assertions. Prefer implementing the smoke if `npx esbuild` works in the environment used for `npm test`; if not, keep the unit assertions and a manual script.

Simpler decision for tasks: **must** have unit regression; **should** add `test/minify-annotation-smoke.mjs` runnable via npm script that uses `npx esbuild` — failure of npx in CI can be noted, but local Vite repro is covered.

Actually keep tasks practical: unit test in `test/run.mjs` is enough for apply; add a small dedicated smoke file that uses dynamic import after esbuild if easy. Looking at package.json - no esbuild. I'll put in tasks: (1) unit assert in run.mjs (2) optional smoke with npx - implement unit for sure, try smoke without adding dependency.

## Risks / Trade-offs

- **[Risk] Miss an lf Context variant** → Mitigation: enumerate against `Java8Parser.js` exports used by the old `includes` prefixes.
- **[Risk] Circular import `annotation-parser` ↔ grammar** → Mitigation: same import graph as peek (`Java8Parser` from grammars); no cycle through signature-visitor.
- **[Risk] Slight semantic narrowing on Lambda** → Acceptable; annotation element values cannot be lambdas in Java.

## Migration Plan

- Drop-in; no caller changes.
- Rollback: revert `annotation-parser.js` (+ tests).

## Open Questions

- None blocking.
