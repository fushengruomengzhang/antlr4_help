## 1. format-emitter suffix 修复

- [x] 1.1 `memberSuffixForSortedMember`：从 `spanBetween(valStop, sourceNextKey)` 排除 `hiddenLeft(sourceNextKey)` token
- [x] 1.2 验证/简化 `hiddenLeftForSortedMember`（prefix 完整保留 + emittedHiddenIndices 去重）
- [x] 1.3 pretty + sortKeys 路径共用同一 suffix 排除逻辑

## 2. 测试

- [x] 2.1 新增 `cases/json5.sort-prefix-comment.text`、`cases/json5.sort-prefix-unicode.text`
- [x] 2.2 `test/run.mjs` 注册两 case 与 assert
- [x] 2.3 确认 sort-inline-comment、sort-compact-opening、sort-compact-no-blank 无回归
- [x] 2.4 更新 `test/resources/out/test.json5.format.sorted.text`（注释归位）

## 3. 验证

- [x] 3.1 `npm test` 通过
- [x] 3.2 `openspec validate --all` 通过
