## Context

`JSON4.parse`（`src/parser/json/value-visitor.js`）当前签名 `parse(input: string)`，经 ANTLR CST visitor 将 JSON 文本转为 JS 值。object 使用 `Object.create(null)`，key 插入顺序等于源码 pair 顺序；array 保持源码元素顺序。

`JSON5.format` 已在 transform 阶段实现 `sortKeys: true`：对每个 object 的 entries 按 `sortKey.localeCompare` 稳定排序（`|| originalIndex`），**不排序 array**。本次在 JSON4 parse 值构建阶段引入同名选项，使「规范化 object key 顺序」在 parse 输出层可用，无需调用方后处理。

## Goals / Non-Goals

**Goals:**

- `JSON4.parse(input, options?)` 支持 `sortKeys?: boolean`，默认 `false`
- `sortKeys: true` 时递归对所有 object 按 key 做 locale-aware 稳定排序
- 排序算法与 `JSON5.format` `sortKeys` 一致
- 省略 options 时行为与现实现完全一致（向后兼容）
- 补充测试与模块文档

**Non-Goals:**

- 不排序 array 元素
- 不支持自定义 compare 函数或 `sortKeys: 'numeric'` 等扩展形态
- 不修改 `JSON5.parse`（可未来对齐，本次不在范围）
- 不修改 ANTLR grammar / 生成代码
- 不抽取共享 `core/` 工具（除非实现时发现明显重复且零行为风险；优先最小 diff）

## Decisions

### 1. Options 在 visit 阶段注入，而非 parse 后 post-pass

```
parse(input, options)
  └─ visitValue(ctx, options)
       visitObj: collect pairs → recurse values → sort pairs by key → insert
       visitArr: recurse only (no sort)
```

**理由**：object 本就需在 visit 时按序插入以保留 `Object.create(null)` 语义；在 visit 内排序与现有 pipeline 一致，避免二次遍历整棵树。

**备选**：`parse` 完成后 `sortTree(result)` — 更简单但多一次遍历，且与 visit 逻辑重复。

### 2. visitObj 排序流程

1. 遍历 CST `pair()`，收集 `{ key, value, index }`（`value` 经 `visitValue` 递归，子 object 已排好）
2. 若 `options.sortKeys`：
   ```javascript
   pairs.sort((a, b) => a.key.localeCompare(b.key) || a.index - b.index);
   ```
3. 按排序后顺序写入 `Object.create(null)`

与 `ast-builder-transform.js` `transformObject` 的 index tie-break 等价。

### 3. API 形状

```javascript
/** @typedef {object} ParseOptions
 *  @property {boolean} [sortKeys]
 */

parse(input: string, options?: ParseOptions): unknown
```

- `sortKeys` 默认 `false`（`options?.sortKeys ?? false`）
- 不 export `DEFAULT_PARSE_OPTIONS`（JSON4 仅一个选项，YAGNI）
- `JSON4.parse` 对象方法包装同一 `parse` 函数

### 4. localeCompare 语义

使用无参 `String.prototype.localeCompare`（运行时默认 locale），与 JSON5 format 一致。数字字符串 key（如 `"10"` vs `"2"`）按字典序，非数值序——在 `index.js` JSDoc 中说明。

### 5. 错误与边界

- `sortKeys` 非 boolean 时：`?? false` 仅处理 `undefined`；若显式传非 boolean，按 JS 真值处理或严格校验——**决策：仅接受 boolean，非 boolean 抛 `TypeError`**，避免 `sortKeys: 1` 等隐式启用。
- 重复 key：保持现有「后写覆盖」语义；排序在全部 pair 收集后执行，相等 compare 时稳定保留源码相对顺序。

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 与 JSON5.format sortKeys 语义漂移 | spec 明确要求相同 `localeCompare \|\| index` 算法；测试含中文/英文 key |
| `sortKeys: true` 额外分配 pairs 数组 | 仅 object 节点、仅当选项开启；可接受，JSON4 非热路径 format 级优化 |
| 用户期望 array 也排序 | proposal/spec 明确 non-goal；命名 `sortKeys` 与 JSON5 一致降低误解 |
| `localeCompare` 依赖运行时 locale | 与 JSON5 相同约束；测试用确定性 ASCII key 为主，Unicode case 为辅 |

## Migration Plan

1. 扩展 `value-visitor.js`：`parse` / `visitValue` / `visitObj` / `visitArr` 传递 `ParseOptions`
2. 实现 `visitObj` 稳定排序分支
3. 更新 `src/parser/json/index.js` JSDoc
4. 添加 `test/run.mjs` cases（默认不变、sortKeys 顶层/嵌套、array 不变、Unicode key）
5. `npm test` 全绿

无部署/回滚特殊步骤；行为变更仅 opt-in。

## Open Questions

（无 — explore 阶段已确认：布尔 `sortKeys`、只排 object key、算法对齐 JSON5.format）
