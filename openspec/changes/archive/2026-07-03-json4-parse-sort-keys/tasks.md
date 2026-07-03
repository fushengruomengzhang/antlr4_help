## 1. Parse options and visitor

- [x] 1.1 在 `value-visitor.js` 定义 `ParseOptions` typedef（`sortKeys?: boolean`）与 `resolveParseOptions(options?)`（默认 `sortKeys: false`；非 boolean 抛 `TypeError`）
- [x] 1.2 扩展 `parse(input, options?)`：resolve options 后传入 `visitValue`
- [x] 1.3 `visitValue` / `visitArr` 向下传递 options（array 路径不排序）
- [x] 1.4 `visitObj`：收集 `{ key, value, index }` pairs，递归 visit value；`sortKeys: true` 时 `pairs.sort((a,b) => a.key.localeCompare(b.key) || a.index - b.index)` 后按序写入 `Object.create(null)`

## 2. Public API documentation

- [x] 2.1 更新 `src/parser/json/index.js`：`JSON4.parse` 签名、options 表、`sortKeys` 语义（只排 object key、默认 false、与 JSON5.format 算法一致）

## 3. Tests and verification

- [x] 3.1 `test/run.mjs`：默认 parse 保持源码 key 顺序
- [x] 3.2 `test/run.mjs`：`sortKeys: true` 顶层与嵌套 object key 排序
- [x] 3.3 `test/run.mjs`：`sortKeys: true` 时 array 元素顺序不变
- [x] 3.4 `test/run.mjs`：`sortKeys` 非 boolean 抛 `TypeError`
- [x] 3.5 `npm test` 全绿
