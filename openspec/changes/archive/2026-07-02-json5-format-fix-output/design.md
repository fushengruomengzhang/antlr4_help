## Context

`json5-format-standalone` 已实现独立 grammar + build/transform/emit 管线。对比 `test/resources/out/`（legacy）与 `test/resources/out/json5format/` 发现 92 项用例 0 字节一致，最显著问题是 HIDDEN token 被多个 AST 槽重复引用。Legacy `format-emitter.js` 使用 `emittedHiddenIndices` 与 `isNextMemberPurePrefix` 去重；新管线在 `build-document.js` 阶段缺少等价机制。

## Goals / Non-Goals

**Goals:**

- 每个 HIDDEN token 在 Document AST 中仅归属一个语义槽
- pretty 三引号输出可被 `JSON5Format` grammar 再解析
- 空对象/数组 compact 输出结构正确
- 注释相关用例与 legacy 输出 value-equal，关键用例 byte-equal

**Non-Goals:**

- 修改 legacy `JSON5.format`
- 修改 `src/grammars/json5-format/` grammar
- 追求全部 92 用例字节级与 legacy 完全一致（indent 等 cosmetic 差异可后续处理）

## Decisions

### 1. Build 阶段 token-index 去重（非 emit 阶段）

在 `DocumentBuilder` 维护 `consumedHiddenIndices: Set<number>`。分配 hidden 到 `openRight`、`right`、`sep`/`before`（via `splitSepBefore`）时立即 mark consumed；`entry.before` 使用 `pendingBefore || takeHiddenLeft(key)`，其中 `takeHiddenLeft` 过滤已 consumed token。

**替代方案:** emit 阶段 dedup — 拒绝，因 AST 语义已错误，transform/sort 会依赖错误槽位。

### 2. 空容器 `closeBefore` 仅用 `hiddenLeft(closeTok)`

`members.length === 0` 时不用 `spanBetween(open, close)`（会包含 `}`/`]` 默认通道），改为 `hiddenText(hiddenLeft(closeTok))`。

### 3. Pretty 三引号保持源引号风格

移除 `emitTripleString` 中将 single-quote close 转为 `"""` 的逻辑；opener 与 closer 均使用源 `quote` 对应 delimiter（与 legacy 一致）。

## Risks / Trade-offs

- [Risk] token-index 去重遗漏边缘 gap → 补充注释用例回归 + `json5-format-out.mjs` 对比
- [Risk] 与 legacy 仍有 whitespace 差异 → 接受 cosmetic 差异，优先 value-equal 与可解析性
