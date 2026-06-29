## 1. format-emitter 精确排除

- [x] 1.1 新增 helper：从 `hiddenLeft(nextKey)` 切分 pure prefix token（vs 上一 member suffix/inline 部分）
- [x] 1.2 `excludedNextMemberPrefixIndices` 仅排除 pure prefix 子集，不再整段排除
- [x] 1.3 验证 prefix 分行（sort-prefix-newline case）与 inline 保留同时成立

## 2. 测试

- [x] 2.1 新增 `cases/json5.sort-section-inline.text`
- [x] 2.2 `test/run.mjs` 注册 section-inline case assert
- [x] 2.3 `json5 format (sortKeys)` runCase 加 assert（含 `"age": 18, // 年龄`）
- [x] 2.4 确认 sort-inline-comment、sort-prefix-newline、sort-prefix-comment 无回归
- [x] 2.5 更新 `test/resources/out/test.json5.format.sorted.text`

## 3. 验证

- [x] 3.1 `npm test` 通过
- [x] 3.2 `openspec validate --all` 通过
