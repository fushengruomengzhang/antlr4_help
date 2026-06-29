## Why

`JAVA8.firstClassName()` 走完整 `compilationUnit` parse，大文件的 class body 会被全部 lex/parse 并建树，单独调用时很慢。业务上常只需「第一个顶层类型名」，不必验证 body 或扫到 EOF。

## What Changes

- **保留** `JAVA8.firstClassName()`：行为不变，完整 parse，body 语法非法时仍抛 `ParseError`
- **新增** `JAVA8.peekFirstClassName(input)`：parse 至首个顶层类型 header 后在 body 入口 early exit，不 lex/parse body；返回值规则与 `firstClassName` 相同（`string | null`）
- body 有语法错误时 `peekFirstClassName` **仍可能**返回类名；package/import/类型 header 非法时仍抛 `ParseError`
- 在 `src/index.js` 导出并补充 JSDoc；集成测试覆盖两 API 语义差异
- **不修改** `API.java8ToApiSchema` 及 `signatures()`

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `java8-api`：新增 `peekFirstClassName` requirement；细化 `Java8 完整文件输入` 仅约束 strict API
- `integration-tests`：新增 peek vs firstClassName 对比用例（含 body 非法 fixture）

## Impact

- **新增**：`src/parser/java8/peek-first-class-name.js`（及可选 listener/helper）
- **修改**：`src/index.js`（export + JSDoc）、`test/run.mjs`、fixture
- **不变**：`first-class-name.js`、`signatures.js`、`java8-to-api-schema.js`
- **兼容性**：非 BREAKING；新增公开 API
