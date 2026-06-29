## 1. Grammar 与生成

- [x] 1.1 重构 `Json5Lexer.g4`：`'''`/`"""` 模式拆分 OPEN/FIRST/BODY/CLOSE；开引号同行 `//`、`/* */` → HIDDEN
- [x] 1.2 实现 FIRST/BODY 模式 EOF 与未闭合错误；禁止 delimiter 混关
- [x] 1.3 更新 `Json5Parser.g4`：`tripleSingleString` / `tripleDoubleString` 结构规则
- [x] 1.4 `npm run generate` 并提交 `src/grammars/json5/` 生成物

## 2. 运行时

- [x] 2.1 更新 `value-visitor.js`：解析三引号结构，BODY-only decode
- [x] 2.2 更新 `format-emitter.js`：`emitTripleString`（OPEN + hiddenRight + BODY + CLOSE）；pretty/compact 均保留 delimiter
- [x] 2.3 移除 pretty 路径 `'''`→`"""` 转换

## 3. 测试与 golden

- [x] 3.1 新增 cases：`triple-opener-line`、`triple-opener-block`、`triple-unclosed`、`triple-mismatch`
- [x] 3.2 更新 `golden/test.json5.format.compact.text`（含 `// 三引号注释` 行）
- [x] 3.3 `test/run.mjs` 增加 parse assert 与 expectError 用例
- [x] 3.4 确认 `test.json5.parse.json` 中 `names` 不含开引号行注释

## 4. 验证

- [x] 4.1 `npm test` 全绿
- [x] 4.2 `openspec validate --all`
