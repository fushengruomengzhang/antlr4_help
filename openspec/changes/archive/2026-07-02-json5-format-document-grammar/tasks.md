## 1. Grammar

- [x] 1.1 Lexer：`LINE_COMMENT` / `BLOCK_COMMENT` 移出 HIDDEN（三引号 mode 内保持 HIDDEN）
- [x] 1.2 Parser：document grammar（layout、objectBody、member、suffixPart）
- [x] 1.3 `npm run generate` 并验证 g4 无冲突

## 2. Build pipeline

- [x] 2.1 重写 `build-document.js`：parse tree visitor，layout → AST slot
- [x] 2.2 WS-only helper（HIDDEN 仅补空白，不分配 comment）
- [x] 2.3 删除 `token-helpers.js` 考古逻辑或替换为 ws-only 工具

## 3. Transform & Emit

- [x] 3.1 简化 `transform.js`：member-unit sort
- [x] 3.2 调整 `emit.js`：对齐 legacy compact（TextBuf、prefix/suffix 归属）

## 4. 测试与对照

- [x] 4.1 更新/运行 `test/json5-format-standalone.mjs`
- [x] 4.2 运行 `test/json5-format-out.mjs` + legacy 全量对照
- [x] 4.3 修复对照 bug 直至 valueEqual 100%、inlineDup 0、parseFail 0
