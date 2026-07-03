## 1. Restore golden expected

- [x] 1.1 `git checkout HEAD -- test/resources/expected/json5/fixture.default.text test/resources/expected/json5/fixture.compact.text`
- [x] 1.2 确认 `fixture.sort-compact.text` 暂用 HEAD 版本作为对比起点

## 2. Fix emit / token-slice bugs

- [x] 2.1 移除 `openLineComments`；openRight 仅用 `suffixComments(open, sameLineOnly)`
- [x] 2.2 修复 `emitEntryEnd`：末项无逗号时仍输出行尾 inline
- [x] 2.3 分离 pretty 排版：value 与换行行尾注释分行（对齐 default expected）
- [x] 2.4 三引号 emit 输出 `open` suffix 注释
- [x] 2.5 compact 空 `{}`/`[]` 保持单行，不错误展开

## 3. Verify frozen expected

- [x] 3.1 `npm test` 通过且 `fixture.default` / `fixture.compact` 与 HEAD expected 字节一致
- [x] 3.2 `git diff test/resources/expected/json5/fixture.default.text fixture.compact.text` 无变更

## 4. sortKeys option A — update sort-compact expected

- [x] 4.1 修完 bug 后生成 sort+compact 输出，确认差异仅为 prefix 锚点顺序
- [x] 4.2 更新 `fixture.sort-compact.text`（仅此文件）
- [x] 4.3 全量 `npm test` 通过

## 5. Performance check

- [x] 5.1 `node scripts/bench-json5.mjs` — buildAst 仍优于 triplet 重构前基线
