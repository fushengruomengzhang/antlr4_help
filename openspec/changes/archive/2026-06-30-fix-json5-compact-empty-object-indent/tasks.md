## 1. format-emitter 修复

- [x] 1.1 在 `format-emitter.js` 抽取 `emitCompactEmptyContainer`（或等价 helper）：拆分 openingHidden 为 inline / layout，layout 丢弃，闭合用 `beginCloseLine` + `indentUnit(depth)`
- [x] 1.2 `formatObjectCompact` 空 object 分支改用 helper
- [x] 1.3 `formatArrayCompact` 空 array 分支改用 helper

## 2. 测试

- [x] 2.1 新增 `test/resources/cases/json5.compact-empty-object-indent.text` 与 golden `test/resources/golden/json5.compact-empty-object-indent.text`
- [x] 2.2 在 `test/run.mjs` 注册 case（`compact: true`, `indent.size: 4`）
- [x] 2.3 `npm test` 全绿；现有 compact/sortKeys cases 无回归

## 3. 验证

- [x] 3.1 对 `test/resources/source.json5` spot-check：`JSON5.format(..., { compact: true, indent: { type: 'space', size: 4 } })` 中空 `user` 对象 `},` 与 member 行对齐
- [x] 3.2 `openspec validate --all` 通过
