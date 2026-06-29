## 1. format-emitter member 后缀

- [x] 1.1 `formatObjectCompact` sort 分支：后缀改用 `spanBetween(valStop, sourceNextKey)`，末项 `stripTrailingCommaSuffix`；prefix 仍 `hiddenLeft(key)`
- [x] 1.2 `formatObjectPretty` sort 分支：同上，移除「hiddenRight 后再 append 逗号」
- [x] 1.3 确认 array compact/pretty 路径后缀语义一致（源码顺序 `spanBetween` 或等价修复）
- [x] 1.4 可选：suffix 规范化 helper，将 ` // comment ,` 重排为 `, // comment`

## 2. 测试与快照

- [x] 2.1 新增 `test/resources/cases/json5.sort-inline-comment.text`
- [x] 2.2 `test/run.mjs` 注册 case，assert 输出含 `"age": 18, // 年龄`
- [x] 2.3 重新生成 `test/resources/out/test.json5.format.sorted.text`
- [x] 2.4 验证 compact-only、sort+compact 小 fixture、default format 无回归

## 3. 验证

- [x] 3.1 `npm test` 通过
- [x] 3.2 `openspec validate --all` 通过
