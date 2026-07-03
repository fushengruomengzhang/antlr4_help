## Context

三元锚点管线（`json5-format-triplet-anchor`）已落地，但 emit 阶段引入 `openLineComments`（按源行扫描）偏离了「仅用 Triplet 区间切片」的设计，导致同行多个 `{` 场景下注释误归属。同时 `emitEntryEnd` 遗漏末项无逗号行尾注释，pretty 模式退化为 compact 同行布局。

## Goals / Non-Goals

**Goals:**
- `fixture.default` / `fixture.compact` 与 git HEAD expected 字节一致（修代码，不改 expected）
- `fixture.sort-compact` 反映 sortKeys 选项 A：prefix 注释跟 key 锚点，排序后出现在该 key 旁
- 保留三元锚点性能收益（buildAst 不做注释字符串预处理）
- 禁止 gap 考古（不提升/合并无关 prefix 到输出首 key 前）

**Non-Goals:**
- 不改公共 API
- 不修改 `out/cases/*` expected
- 不恢复旧 `token-helpers` 考古逻辑

## Decisions

### 1. 移除 `openLineComments`

openRight / openInline 统一使用 `suffixComments(openTriplet, sameLineOnly=true)`，区间 `(open.current, open.next)`。

`open.next` 在 ast-builder 中保持语义边界赋值；对 `{ // head` 需确保 `open.next` 覆盖同行末 token（非仅 `streamNextToken` 若过短则用同行最后一个 token index）。

### 2. 末项行尾注释

```javascript
// emitEntryEnd
if (!isLast) return inline ? ', ' + inline : ',';
if (inline) return (endHasComma ? ', ' : ' ') + inline;
return '';
```

### 3. pretty vs compact 排版分离

| 模式 | prefix | value | inline（同行） | inline（换行） |
|------|--------|-------|--------------|--------------|
| compact | 独立行+缩进 | 同行 key:value | `, // x` 或 ` // x` | 少见 |
| pretty | 独立行+缩进 | 独立行，尾逗号 | 不拆到下一行 | 下一行+缩进（`afterValue` 语义） |

pretty 非 sort 路径：区间 `(end.prev, end.current)` 的非同行注释 → 下一行；同行 suffix → 跟 value/逗号。

### 4. sortKeys prefix 顺序 — 选项 A

每个 entry 的 prefix 仅来自 `key` Triplet 区间 A。sort 后 entry 整体移动，prefix 随 key 出现在排序位置。**不**将靠前源序 prefix 提升到容器顶部。

`fixture.sort-compact.text` 允许更新以反映此语义（如 `// 字符串` 出现在 key `1` 前而非 `_private` 前）。

### 5. expected 更新策略

```
fixture.default.text     → 恢复 HEAD，修代码匹配，不得更新
fixture.compact.text     → 恢复 HEAD，修代码匹配，不得更新
fixture.sort-compact     → 修代码后，仅 prefix 顺序按 A 更新
```

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| `{ // head` 回归 | 专项 case `sort-compact-opening` 已通过，修后复跑 |
| pretty 缩进空格数 | 以 HEAD expected 字节为准 |
| sort expected 争议 | 已用户确认选项 A |

## Migration Plan

1. `git checkout HEAD -- test/resources/expected/json5/fixture.default.text fixture.compact.text`
2. 修 token-slice + emit
3. 验证 default/compact 全绿且 expected 无 diff
4. 生成并审阅 sort-compact 新 expected，仅接受 prefix 顺序差异
5. `npm test` + `bench-json5.mjs`
