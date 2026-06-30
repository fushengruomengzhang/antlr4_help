## 1. 还原方案 A（baseline）

- [x] 1.1 删除 `src/grammars/json5/format/` 目录（g4 与生成 JS）
- [x] 1.2 删除 `src/parser/json5/format-cst-emitter.js`
- [x] 1.3 `git restore` 恢复 `src/parser/json5/format-emitter.js`、`src/parser/json5/format.js`、`scripts/generate.sh`
- [x] 1.4 运行 `npm test`，确认全部 case 与 golden byte-equal（baseline 绿）

## 2. 注释锚点索引模块

- [x] 2.1 新增 `src/parser/json5/comment-anchor-index.js`，导出 `buildCommentAnchorIndex(tree, tokenStream)`
- [x] 2.2 实现 tree walk：收集 doc、container open/close、member key/value 边界、三引号 opener 锚点
- [x] 2.3 实现单次 HIDDEN token 扫描与 slot 分类（MEMBER_PREFIX/SUFFIX、OPEN_AFTER、CLOSE_BEFORE 等）
- [x] 2.4 从现有 `isNextMemberPurePrefix` 语义搬迁 pure prefix 判定，保证与 legacy 分类一致
- [x] 2.5 导出 `shadowAssertMatchesLegacy`（dev 用，可选）对比 index 与 legacy emitter 分类

## 3. FormatEmitter 接入索引

- [x] 3.1 `format.js`：parse 后构建 index，传入 `FormatEmitter`
- [x] 3.2 sort+compact 路径：`hiddenLeftForSortedMember` / `memberSuffixForSortedMember` 改用 index 查询
- [x] 3.3 sort+pretty 与其它 sort 路径接入 index prefix/suffix
- [x] 3.4 container/doc trivia 改用 index 槽位（doc before/after、object openAfter）
- [x] 3.5 删除 `isNextMemberPurePrefix`、`purePrefixHiddenTokens`、`excludedNextMemberPrefixIndices` 及不再使用的 span 热路径

## 4. 验证与收尾

- [x] 4.1 对 `test/resources/cases/json5.sort-*` 运行 shadow 或全量 `npm test`，确认 byte-equal
- [x] 4.2 运行 `node scripts/bench-json5.mjs`，记录 format fixture 与 500 keys sort+compact 耗时（对比方案 A ~7ms / baseline ~0.6–2ms）
- [x] 4.3 移除或隔离 shadow 断言代码（不进入默认 test 路径）
- [x] 4.4 运行 `openspec validate --all` 通过
