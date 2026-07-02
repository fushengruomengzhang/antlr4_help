## 1. Grammar 与生成

- [x] 1.1 新增 `src/grammars/json5-format/Json5FormatLexer.g4`（独立词法，含三引号 modes）
- [x] 1.2 新增 `src/grammars/json5-format/Json5FormatParser.g4`（json5Format 入口 + value/object/member）
- [x] 1.3 更新 `scripts/generate.sh` 包含 json5-format；运行 `npm run generate`

## 2. json5-format 管线

- [x] 2.1 新增 `src/parser/json5-format/`：`types.js`、`format-options.js`、`token-helpers.js`、`decode.js`
- [x] 2.2 实现 `build-document.js`（document AST + entry 槽位 + 三引号 openRight）
- [x] 2.3 实现 `transform.js`（sortKeys、去尾逗号）
- [x] 2.4 实现 `emit.js`（高效 compact/pretty，无 O(n²) materialize）
- [x] 2.5 实现 `format.js` 与 `index.js` 导出 `JSON5Format`

## 3. 对外集成

- [x] 3.1 `src/index.js` 导出 `JSON5Format` 与 `JSON5_FORMAT_DEFAULT_OPTIONS`
- [x] 3.2 确认 json5-format 无 json5 模块 import

## 4. 测试与性能

- [x] 4.1 新增 `test/json5-format-standalone.mjs`（AST 槽位、三引号、sort 注释、fixture smoke）
- [x] 4.2 扩展 `scripts/bench-json5.mjs` 对比 JSON5Format vs JSON5.format（含 2000 keys）
- [x] 4.3 更新 `package.json` test 脚本；`npm test` 通过
- [x] 4.4 `openspec validate --all` 通过
