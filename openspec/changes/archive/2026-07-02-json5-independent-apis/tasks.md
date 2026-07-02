## 1. Format 目录迁移

- [x] 1.1 创建 `src/parser/json5/format/` 目录
- [x] 1.2 将 `ast-types.js`、`token-helpers.js`、`ast-builder.js`、`ast-transform.js`、`ast-emitter.js`、`format-options.js` 移入 `format/`
- [x] 1.3 新建 `format/decode.js`，从 `value-visitor.js` 迁出 format 所需函数（`decodeJson5String`、`decodeTripleBody`、`tripleStringBodyText`、`keySourceText`、`keyToString`、`encodeDoubleQuotedString` 等）
- [x] 1.4 更新 `format/` 内所有 import 路径（`ast-builder`、`ast-emitter` 改引 `./decode.js` 而非 `value-visitor.js`）

## 2. Format 入口

- [x] 2.1 新建 `format.js`：实现 `parseToAst`（`runParsePipeline` + `buildDocumentAst`）与 `formatAst`（`transformAst` + `emitDocument`）
- [x] 2.2 在 `format.js` 导出 `format`、`DEFAULT_FORMAT_OPTIONS`（及内部需要的 `normalizeFormatOptions` 若仍被测试引用）
- [x] 2.3 确认 `format.js` 不 import `parse.js` 或 `validate.js`

## 3. Parse 与 Validate 入口

- [x] 3.1 新建 `validate.js`：仅 `runParsePipeline({ fillTokens: false })`
- [x] 3.2 新建 `parse.js`：CST visitor + 独立 decode 逻辑（从 `value-visitor.js` 迁出，不 import `format/`）
- [x] 3.3 确认 `parse.js` 与 `validate.js` 互不 import，且均不 import `format/`

## 4. 门面与清理

- [x] 4.1 更新 `index.js`：从 `validate.js`、`parse.js`、`format.js` 聚合导出
- [x] 4.2 删除 `value-visitor.js`、`format-emitter.js`
- [x] 4.3 全库搜索并修复对旧路径的 import（含 `test/`、`scripts/`）

## 5. 验证

- [x] 5.1 更新测试文件 import 路径（如 `test/json5-ast-builder.mjs` 指向 `format/`）
- [x] 5.2 添加 parse/format 一致性 smoke：同一合法 input，`JSON5.parse` 与 `JSON5.parse(JSON5.format(input))` 值相等（或等价场景）
- [x] 5.3 运行 `npm test` 通过
- [x] 5.4 运行 `openspec validate --all` 通过
