## Why

`JAVA8.signatures` extracts annotation attribute values by walking the expression tree and matching nodes via `node.constructor.name` (e.g. `LiteralContext`). Vite/esbuild production minify renames those classes, so string matches fail and attributes such as `@ApiModelProperty(value = "…")` become empty `{}` after bundle — while the same source works under plain Node.

## What Changes

- Replace `constructor.name` / string `includes` checks in `findLiteralInExpression` with minify-safe `instanceof Java8Parser.*Context` (same pattern as `peek-first-class-name.js`)
- Cover all relevant `MethodInvocation*` / `ClassInstanceCreationExpression*` lf variants plus `LambdaExpression` and ternary `ConditionalExpression`
- Keep `JAVA8.signatures` / annotation `FileModel` shape unchanged (no public API break)
- Add regression coverage that annotation string/boolean literals still populate attrs; optionally an esbuild minify smoke that proves Vite-like builds keep attrs

## Capabilities

### New Capabilities

- `java8-signatures`: Java8 structured signature extraction, including annotation attribute literal values that remain correct when the library is minified (e.g. Vite production build)

### Modified Capabilities

- (none — no existing `openspec/specs/java8-*` requirements)

## Impact

- **Code**: `src/parser/java8/annotation-parser.js` (primary); import `Java8Parser` like peek path
- **APIs**: No signature changes; Vite/minified consumers get non-empty annotation attrs again
- **Out of scope**: Constant/enum annotation values (`Msg.X`, `AccessMode.READ_ONLY`); API schema mapping of `hidden`/`notes`; peek `Error.name` naming cleanup
- **Tests**: Annotation literal cases under `test/`; optional minify smoke
