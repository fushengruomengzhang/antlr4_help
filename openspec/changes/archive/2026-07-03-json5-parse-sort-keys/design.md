## Context

`JSON5.parse`（`src/parser/json5/parse.js`）经 CST visitor 将 JSON5 文本转为 JS 值。object 使用 `{}`，key 由 `keyToString(member.key())` 解码，插入顺序等于源码 member 顺序。

`JSON5.format` 已在 transform 阶段实现 `sortKeys: true`（`sortKey.localeCompare || ord`）。`json4-parse-sort-keys` 为 JSON4 提供了相同模式的 parse 层选项；本次为 JSON5 对齐。

## Goals / Non-Goals

**Goals:**

- `JSON5.parse(input, options?)` 支持 `sortKeys?: boolean`，默认 `false`
- `sortKeys: true` 时递归对所有 object 按 key 稳定 locale 排序
- 算法与 `JSON5.format` / `JSON4.parse` sortKeys 一致
- 向后兼容；补充测试与文档

**Non-Goals:**

- 不排序 array 元素
- 不支持自定义 compare 或 `sortKeys: 'numeric'`
- 不把 `{}` 改为 `Object.create(null)`（避免无 sortKeys 时的行为漂移）
- 不修改 format/validate；不抽取 shared core 工具（优先最小 diff）
- 不修改 ANTLR grammar

## Decisions

### 1. visit 阶段排序（非 parse 后 post-pass）

```
parse(input, options)
  └─ visitValue(ctx, options)
       visitObject: collect pairs → recurse values → sort → insert into {}
       visitArray: recurse only
```

### 2. visitObject 流程

1. 遍历 CST `member()`，收集 `{ key: keyToString(...), value, index }`
2. `value` 经 `visitValue` 递归（子 object 已排好）
3. 若 `sortKeys`：`pairs.sort((a,b) => a.key.localeCompare(b.key) || a.index - b.index)`
4. 按序写入 `{}`（保持现有 object 容器类型）

### 3. API

```javascript
/** @typedef {object} ParseOptions
 *  @property {boolean} [sortKeys]
 */
parse(input: string, options?: ParseOptions): unknown
```

- `resolveParseOptions`：`sortKeys ?? false`；非 boolean 抛 `TypeError`
- 不 export `DEFAULT_PARSE_OPTIONS`（单选项 YAGNI）

### 4. key 比较

使用 `keyToString` 解码后的字符串 + 无参 `localeCompare`，与 format AST `sortKey` 一致。JSON5 无引号 key、数字 key、字符串 key 均经同一函数。

### 5. json5-module-layout 更新

原 spec「`JSON5.parse` 签名 SHALL NOT change」改为允许可选 `options` 第二参数（向后兼容扩展）。

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 与 format sortKeys 漂移 | spec 要求相同算法；可加 parse/format key 顺序对齐测试 |
| `{}` vs `Object.create(null)` 与 JSON4 不一致 | 文档说明；JSON5 历史行为保留 |
| 重复 key member | 保持现有后写覆盖；排序在全部 member 收集后执行 |

## Migration Plan

1. `parse.js` 实现 options + visitObject 排序
2. 更新 `index.js` JSDoc
3. `test/run.mjs` cases
4. `npm test` 全绿

## Open Questions

（无）
