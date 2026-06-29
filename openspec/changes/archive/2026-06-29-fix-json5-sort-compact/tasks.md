## 1. Compact + sortKeys 实现修复

- [x] 1.1 `formatObjectCompact`：`sortKeys` 时改用 `hiddenLeft(key)` + `hiddenRight(valStop)` + 程序逗号，不用 `spanBetween`
- [x] 1.2 opening 与首个 member `hiddenLeft` 去重（sortKeys 时跳过 opening hidden，由各 member `hiddenLeft` 承担）
- [x] 1.3 `formatArrayCompact`：若未来 array sort 不适用则跳过；确认 array 路径无 sortKeys 问题
- [x] 1.4 保留 `sortKeys: false` 时现有 `spanBetween` compact 逻辑

## 2. 验证

- [x] 2.1 小用例：`{ b: 1, // about b\n a: 2 }` + sort+compact 无重复、注释锚定
- [x] 2.2 `test.json5.text` + sort+compact：注释条数仍为 117
- [x] 2.3 compact-only、pretty+sortKeys、default format 无回归

## 3. 集成测试与文档

- [x] 3.1 `test/run.mjs` sorted 用例改为 `{ sortKeys: true, compact: true }`
- [x] 3.2 更新 `out/test.json5.format.sorted.text` 快照
- [x] 3.3 `openspec validate --all`
