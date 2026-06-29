## 1. format-emitter opening 与 suffix

- [x] 1.1 sort+compact：恢复 `emitHiddenCompact(hiddenRight(openTok))`，维护 `emittedHiddenIndices` 去重
- [x] 1.2 `hiddenLeftForSortedMember` 排除容器头区间及已 emit token
- [x] 1.3 `memberSuffixForSortedMember` compact 路径 suffix 规范化（`\n{2,}` → `\n`，trim 尾随空行）
- [x] 1.4 确认嵌套 object 递归路径 inherit 上述行为

## 2. 测试

- [x] 2.1 新增 `cases/json5.sort-compact-opening.text`、`cases/json5.sort-compact-no-blank.text`
- [x] 2.2 `test/run.mjs` 注册两 case 与 assert
- [x] 2.3 确认现有 sort-compact、sort-inline-comment case 无回归
- [x] 2.4 更新 `test/resources/out/test.json5.format.sorted.text`（若布局变化）

## 3. 验证

- [x] 3.1 `npm test` 通过
- [x] 3.2 `openspec validate --all` 通过
