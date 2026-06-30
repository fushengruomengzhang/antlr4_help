## Why

`add-json5-format-grammar`（方案 A：双 grammar + CST trivia）经 bench 验证 format parse 从 ~0.6 ms 升至 ~7 ms（约 12×），sort+compact 500 keys 从 ~2 ms 升至 ~42 ms；瓶颈在 `Json5FormatParser` 对大量 DEFAULT trivia token 的 rule 匹配，而非 emit。主要调用场景（80%+）为 `format({ sortKeys: true, compact: true })`，需保持与 `JSON5.parse` 同量级的单 grammar 性能，同时简化注释/空白锚定逻辑。方案 B：保留现有 `Json5Lexer`/`Json5Parser`（HIDDEN），parse 后 **一次 O(n) 扫描** 构建注释锚点索引，供 `FormatEmitter` 查表 emit，替代分散的 `hiddenLeftForSortedMember`、`isNextMemberPurePrefix`、`spanBetween` 等启发式。

## What Changes

- **还原并废弃** `add-json5-format-grammar` 未提交实现：删除 `src/grammars/json5/format/`、`format-cst-emitter.js`；恢复 `format-emitter.js`、`format.js`（`Json5Lexer` + `Json5Parser` + `fillTokens: true`）；恢复 `scripts/generate.sh`
- 新增 `src/parser/json5/comment-anchor-index.js`：`buildCommentAnchorIndex(tree, tokenStream)`，单次扫描 HIDDEN token 流，按 parse tree 锚点分类 trivia（member prefix/suffix、容器 open/close、doc、三引号 opener 等）
- 重构 `FormatEmitter`：sort 与 non-sort 路径通过索引获取 prefix/suffix/open/close trivia，删除或大幅简化 `isNextMemberPurePrefix`、`purePrefixHiddenTokens`、`hiddenLeftForSortedMember` 中的重复区间扫描
- 可选过渡：`shadowAssertIndexMatchesLegacy` 对照旧 heuristic 分类，全 case 一致后移除 shadow
- `Json5Lexer.g4` / `Json5Parser.g4`、`parse.js` / `validate.js` **零改动**
- 对外 API（`JSON5.format` 签名与选项）**不变**；format 输出 MUST 与现有 golden **byte-equal**

## Capabilities

### New Capabilities

- `json5-comment-anchor-index`: Format 注释/空白锚点索引模块（构建 API、锚点分类规则、与 member/container/doc 的绑定语义）

### Modified Capabilities

- `json5-api`: 将 sort+compact 注释锚定 requirement 从实现细节（`hiddenLeft`、`spanBetween`、`isNextMemberPurePrefix`）改为锚点索引语义表述；对外 format 行为不变
- `integration-tests`: 补充索引 shadow 断言或等价回归要求（实现阶段可选，验收仍依赖 byte-equal golden）

## Impact

- **删除**：`src/grammars/json5/format/`（g4 + 生成 JS）、`src/parser/json5/format-cst-emitter.js`
- **恢复**：`src/parser/json5/format-emitter.js`（自 git HEAD）
- **新增**：`src/parser/json5/comment-anchor-index.js`
- **修改**：`src/parser/json5/format-emitter.js`（接入索引）、`src/parser/json5/format.js`（若需传入 index）
- **不变**：`JSON5.parse`、`JSON5.validate`、公开 API、`src/index.js` 导出形态
- **风险**：索引归属规则与多轮 sort comment bugfix 语义对齐；还原 A 后需确认 baseline 测试全绿再改 B
- **验收**：`npm test` 全通过；`node scripts/bench-json5.mjs` format ~0.6 ms/fixture 量级（parse bench 不变）；sort+compact 500 keys 不劣于还原前 baseline
