## 新增需求

### Requirement: JSON4.parse 接受可选 sortKeys 参数

`JSON4.parse` SHALL 接受可选第二参数 `options`，形如 `{ sortKeys?: boolean }`。当 `options` 省略或 `sortKeys` 为 `false` 时，parse 行为 SHALL 与变更前实现一致（保持源码 key 与 array 元素顺序）。

#### Scenario: 默认 parse 保持源码 key 顺序

- **WHEN** 调用 `JSON4.parse('{"b":1,"a":2}')` 且未传 options
- **THEN** 返回 object 的 key 插入顺序 SHALL 为 `b` 然后 `a`
- **AND** `result.b` SHALL 为 `1` 且 `result.a` SHALL 为 `2`

#### Scenario: sortKeys 为 false 时保持源码 key 顺序

- **WHEN** 调用 `JSON4.parse('{"b":1,"a":2}', { sortKeys: false })`
- **THEN** 返回 object 的 key 插入顺序 SHALL 为 `b` 然后 `a`

#### Scenario: 非 boolean 的 sortKeys 被拒绝

- **WHEN** 调用 `JSON4.parse('{}', { sortKeys: 1 })`
- **THEN** 实现 SHALL throw `TypeError`

---

### Requirement: sortKeys 为 true 时按 locale 稳定排序 object key

当 `sortKeys: true` 时，实现 SHALL 递归排序 plain object 的 key，使用 `keyA.localeCompare(keyB)`，并以源码 pair 索引做稳定 tie-break（`compareResult || originalIndex`）。实现 SHALL 用 `Object.create(null)` rebuild object 并按序插入 key。Array 元素 SHALL NOT 重排。

比较算法 SHALL 与 `JSON5.format` 的 `sortKeys: true` object key 排序一致（`localeCompare`，无显式 locale 参数）。

#### Scenario: 顶层 key 已排序

- **WHEN** 调用 `JSON4.parse('{"b":2,"a":1}', { sortKeys: true })`
- **THEN** `Object.keys(result)` SHALL 等于 `['a', 'b']`
- **AND** `result.a` SHALL 为 `1` 且 `result.b` SHALL 为 `2`

#### Scenario: 嵌套 object 递归排序

- **WHEN** 调用 `JSON4.parse('{"z":{"y":1,"x":2}}', { sortKeys: true })`
- **THEN** 顶层 `Object.keys(result)` SHALL 等于 `['z']`
- **AND** `Object.keys(result.z)` SHALL 等于 `['x', 'y']`

#### Scenario: array 元素顺序不变

- **WHEN** 调用 `JSON4.parse('[3,1,2]', { sortKeys: true })`
- **THEN** 返回 array SHALL 深度等于 `[3, 1, 2]`

#### Scenario: 已排序 object 内的 array 顺序不变

- **WHEN** 调用 `JSON4.parse('{"b":[3,1],"a":0}', { sortKeys: true })`
- **THEN** `Object.keys(result)` SHALL 等于 `['a', 'b']`
- **AND** `result.b` SHALL 深度等于 `[3, 1]`

#### Scenario: localeCompare 相等时稳定排序保持源码顺序

- **WHEN** 两个 object key 在 `localeCompare` 下相等（相同字符串值）
- **THEN** 输出 object 中的相对顺序 SHALL 与源码文本中的相对顺序一致

#### Scenario: Unicode key 使用 localeCompare

- **WHEN** 对含 Unicode 字符串 key 的输入调用 `JSON4.parse` 且 `sortKeys: true`
- **THEN** key 顺序 SHALL 遵循 `String.prototype.localeCompare` 于解码后的 key 字符串

---

### Requirement: JSON4 模块文档说明 parse 选项

`src/parser/json/index.js` 模块文档 SHALL 描述可选 `options` 参数、`sortKeys` 字段（默认 `false`），以及启用 `sortKeys` 时不排序 array 元素。

#### Scenario: 公开 API 文档列出 sortKeys

- **WHEN** 消费者阅读 `src/parser/json/index.js` 中 `JSON4.parse` 的 JSDoc
- **THEN** 其 SHALL 文档化 `options.sortKeys` 为默认 `false` 的可选 boolean
- **AND** SHALL 说明仅排序 object key，不排序 array 元素
