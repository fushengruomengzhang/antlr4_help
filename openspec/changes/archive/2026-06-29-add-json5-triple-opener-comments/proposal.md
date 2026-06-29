## Why

当前 `Json5Lexer.g4` 用 `''' .*? '''` / `""" .*? """` 一次性吞掉三引号字符串，导致：(1) 开引号同行上的 `//`、`/* */` 被当作字符串内容进入 `parse`；(2) `format` 无法把这类注释当 HIDDEN 锚定还原；(3) 边界情况（未闭合、引号数量异常）错误信息不清晰或行为诡异（如 `''''text'''` 被解析为合法值）。fixture `test.json5.text` 中 `"names": ''' // 三引号注释` 与 golden 不一致。

## What Changes

- **Lexer 重构**：三引号字符串拆为 OPEN → FIRST（开引号同行注释）→ BODY → CLOSE 模式；`'''` 与 `"""` 对称实现
- **开引号行注释**：同行 `//`、`/* */` 进 HIDDEN，**不进** `parse` 结果；第二行起的 `//`/`/* */` 仍为字符串正文
- **Parser**：`value` 改用 `tripleSingleString` / `tripleDoubleString` 结构规则（OPEN + BODY + CLOSE）
- **Format**：pretty 与 compact 均保留输入 delimiter 形态（`'''` 不强制转 `"""`）；emit OPEN + `hiddenRight(OPEN)` + BODY + CLOSE
- **不成对修复**：未闭合三引号、EOF 在 BODY/FIRST 模式、delimiter 类型不匹配时 MUST 抛出 ParseError（lexer 或 parser 明确失败，禁止静默吞掉）
- **运行时**：更新 `value-visitor.js`、`format-emitter.js`；`npm run generate` 重新生成 Lexer/Parser
- **测试**：新增 `cases/` 小 fixture；更新 `golden/test.json5.format.compact.text`；集成测试 assert parse 不含开引号行注释

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `json5-api`：三引号开引号行注释语义、delimiter 保留、未闭合/不成对错误
- `integration-tests`：三引号相关 cases 与 golden 更新

## Impact

- **Grammar**：`src/grammars/json5/Json5Lexer.g4`、`Json5Parser.g4`
- **生成物**：`src/grammars/json5/Json5Lexer.js`、`Json5Parser.js` 等
- **运行时**：`src/parser/json5/value-visitor.js`、`format-emitter.js`
- **测试**：`test/resources/cases/`、`test/resources/golden/`、`test/run.mjs`
- **Breaking**：`parse` 对含开引号行注释的三引号字符串返回值变化（注释不再在字符串内）
