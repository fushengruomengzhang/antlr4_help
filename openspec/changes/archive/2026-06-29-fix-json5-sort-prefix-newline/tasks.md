## 1. format-emitter 修复

- [x] 1.1 `excludedNextMemberPrefixIndices`：存在 pure prefix comment 时排除整段 `hiddenLeft(sourceNextKey)` token（含 comment 后 whitespace/newline）
- [x] 1.2 `hiddenLeftForSortedMember`：移除 `hasTrailingInlineComment` 整批删 whitespace 逻辑；按 token 过滤上一 member 行尾 inline 注释，保留 prefix 换行
- [x] 1.3 验证 pretty + sortKeys 路径共用同一 helper，无粘连回归

## 2. 测试

- [x] 2.1 新增 `cases/json5.sort-prefix-newline.text`（上一 member 行尾 inline + 空行 + prefix）
- [x] 2.2 `test/run.mjs` 注册 assert（MUST NOT 含 `下划线"_private"`）
- [x] 2.3 确认 sort-prefix-comment、sort-inline-comment、sort-compact-* 无回归
- [x] 2.4 更新 `test/resources/out/test.json5.format.sorted.text`（prefix 与 key 分行）

## 3. 验证

- [x] 3.1 `npm test` 通过
- [x] 3.2 `openspec validate --all` 通过
