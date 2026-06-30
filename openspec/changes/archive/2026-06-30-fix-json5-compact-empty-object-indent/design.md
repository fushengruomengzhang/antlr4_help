## Context

`formatObjectCompact` 在 `members.length === 0` 时执行：

```javascript
buf.push(this.emitHiddenCompact(openingHidden), '}');
```

`openingHidden = hiddenRight('{')` 包含 `{` 后所有 HIDDEN token，含 inline 注释与 **源码 layout** `\n  `。后者被原样 emit，导致 `}` 行缩进沿用输入（如 2 空格），而 sibling member 已通过 `beginMemberLine` + `indentUnit(depth+1)` 按 `indent.size: 4` 重算。

复现：`test/resources/source.json5` + `{ compact: true, indent: { type: 'space', size: 4 } }`。

`formatArrayCompact` 空数组分支（643–646 行）逻辑相同。

## Goals / Non-Goals

**Goals:**

- 空 object/array 闭合括号缩进与 `indentUnit(depth)` 一致
- 保留 `{ // head` / `[ // head` inline 头注释
- 不破坏现有 compact + sortKeys 注释锚定测试

**Non-Goals:**

- 改变 non-compact（pretty）空容器行为
- 改变非空容器 compact 路径
- 重写整个 hidden-token 管线

## Decisions

### 1. 拆分 openingHidden：inline vs layout

将 `hiddenRight(openTok)` 分为：

- **inline**：不含 `\n` 的 token（空格 + `//` / `/* */`）→ 紧跟 `{`/`[` emit
- **layout**：含 `\n` 的 whitespace token → **丢弃**，改由 `beginCloseLine` 生成闭合行缩进

**Alternative**：在 `emitHiddenCompact` 内全局 strip `\n` 前缀 — 可能影响非空路径 suffix，不采纳。

### 2. 空容器闭合与 non-empty 对齐

```javascript
buf.push('{');
buf.push(this.emitHiddenCompact(inlineHidden));
if (layoutHidden.length > 0 || inlineHidden.some(hasComment)) {
  buf.beginCloseLine(indentMember, depth);
}
buf.push('}');
```

若源码为 `{}` 无 hidden（单行空对象），可 `{ }` 或 `{}` — 与现有 compact 行为一致即可（无 layout hidden 时不强制换行）。

若 `{ // comment\n  }`（多行空对象），必须输出：

```
{
    // comment
}
```

（缩进按 depth 与 size 4 计算）

### 3. 抽取 shared helper

`emitCompactEmptyContainer(openTok, closeChar, depth, buf, indentMember)` 供 object/array 共用，避免 duplicate fix。

### 4. 测试 fixture

`cases/json5.compact-empty-object-indent.text` — 最小嵌套 case（来自 explore 复现），golden 存期望缩进对齐输出。

## Risks / Trade-offs

- **[Risk] 单行 `{}` 变多行** → 仅当 openingHidden 含换行 layout 时才 `beginCloseLine`；纯 `{}` 保持 `{ }` 或 `{}`
- **[Risk] sortKeys + 空容器** → 空容器无 member，sort 无影响；仍走同一 helper
- **[Trade-off] 不 reformat 空容器内部 comment 后空格** → 仅保证闭合缩进正确

## Migration Plan

1. 实现 helper + 修 object/array 空分支
2. 跑 `npm test`（含新 case）
3. 可选：对 `source.json5` 做 spot-check（大文件，不必全量 golden）

## Open Questions

（无）
