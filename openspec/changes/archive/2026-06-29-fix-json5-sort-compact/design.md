## Context

Compact 布局用 `spanBetween(fromTok, toTok)` 收集 value 与下一项之间的逗号、换行、行尾注释。该函数按 **token 索引递增** 遍历，隐含 emit 顺序与源码一致。

sortKeys 将 members 按 canonical key 重排后 emit，`nextMember.key().start` 的 tokenIndex 可能 **小于** 当前 `valStop.tokenIndex`，导致：

1. `spanBetween` 返回空（反向区间）
2. 或 suffix 吞掉其他 member 的 key/value（正向但跨 member）

pretty 模式不受此影响，因使用 `hiddenLeft(key)` + `hiddenRight(valStop)`，与 emit 顺序无关。

## Goals / Non-Goals

**Goals:**

- `sortKeys + compact` 输出无重复 member、注释条数与输入一致
- spec scenario `{ // about b\n b: 1, a: 2 }` + `{ compact: true, sortKeys: true }` 通过
- `test.json5.text` + `{ sortKeys: true, compact: true }` 可生成合理 sorted 快照
- `sortKeys: false` compact 行为不变（仍用 spanBetween）

**Non-Goals:**

- 不让 `sortKeys` 隐式开启 `compact`
- 不改变 pretty+sortKeys 路径
- 不新增第四条 pretty-sorted 集成用例

## Decisions

### 1. sortKeys 时 compact 改用 hidden 锚定

在 `formatObjectCompact` / `formatArrayCompact` 中分支：

```
if (sortKeys) {
  // hiddenLeft(key) + value + hiddenRight(valStop) + programmatic ','
} else {
  // existing spanBetween suffix
}
```

**Rationale**：与 pretty 模式同源，sort 安全；compact 布局（opening 同行、beginMemberLine、emitSourceValue）保留。

### 2. opening 去重保留

非空容器仍 emit `hiddenRight(openTok)`；sortKeys 分支下首个 member 的 `hiddenLeft(key)` 过滤 opening 已 emit 的 token index（`tokenIndices` 集合）。

### 3. 逗号处理

sortKeys+compact 分支：若 `hiddenRight(valStop)` 已含 `,` 则不再插入；否则非最后一项 append `,`。最后一项 `stripTrailingCommaSuffix` 逻辑仍适用。

### 4. 嵌套 object/array

`formatValue` 递归进入子 object/array 时，子层 `formatObjectCompact` 同样受 sortKeys 分支保护——无需单独处理，因每层独立调用。

### 5. 集成测试（方案 A）

```javascript
json5.format(json5Input, { sortKeys: true, compact: true })
```

输出仍写入 `test.json5.format.sorted.text`；语义变为「紧凑 + 排序」。

## Risks / Trade-offs

- **[Risk] sort+compact 行尾注释不在同一行** → hiddenRight(valStop) 应覆盖 COMMA 后注释；单测验证
- **[Risk] 与无 sort 的 compact 布局微差** → 可接受；sort 场景优先正确性
- **[Risk] 快照大幅变化** → 修 bug 后重新生成 sorted.text

## Migration Plan

1. 实现 sortKeys 分支
2. 更新 run.mjs 与 sorted 快照
3. 验证 compact-only、pretty+sort、default format 无回归

## Open Questions

（无）
