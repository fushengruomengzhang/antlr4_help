## Context

`json5.format` 通过 ANTLR HIDDEN channel 保留注释，由 `FormatEmitter` 在 CST 锚点 emit。当前实现有两处缺陷：

1. **`formatDocument`** 仅调用 `formatValue(root.value())`，忽略根 value 之前（`hiddenLeft(value.start)`）与之后（`hiddenRight(value.stop)`）的 HIDDEN token。
2. **`formatObject`/`formatArray`** 对 `ctx.LBRACE()`/`RBRACE()`/`LBRACK()`/`RBRACK()` 调用 `hiddenLeft`/`hiddenRight`，但这些访问器返回 `TerminalNode`，`tokenIndex` 在 `.symbol` 上；`hiddenLeft`/`hiddenRight` 在 `tokenIndex == null` 时静默返回 `[]`。

非空 object 中 `{` 后至首个 member 的注释目前由 `hiddenLeft(firstKey)` 偶然兜住；空容器、member 与 `}` 之间的注释、以及文档级首尾注释则会丢失。

## Goals / Non-Goals

**Goals:**

- 修复上述两类缺陷，使 spec 中所有注释锚定场景在实现上可测且通过
- `test/resources/test.json5.text` format 后注释条数与输入一致（117 条）
- 保持 `sortKeys: true` 时 member 绑定注释随 member 移动的现有语义

**Non-Goals:**

- 不改变 grammar、lexer 或 `json5.parse` 行为
- 不重构整个 formatter（如 CST printer 或 comment AST）
- 不处理「注释在字符串字面量内」的误识别（lexer 已正确区分）

## Decisions

### 1. 文档级注释在 `formatDocument` 处理

在 `formatValue` 前后分别 emit：

```
hiddenLeft(valueCtx.start) + formatValue(...) + hiddenRight(endToken(valueCtx))
```

`endToken` 已有实现（`ctx.stop ?? ctx.start`）。根 value 为 object/array/primitive 均适用。

**Rationale**：`json5 : value EOF` 是唯一文档边界；集中处理避免各 `formatValue` 分支重复逻辑。

### 2. Bracket 锚点使用 `ctx.start` / `ctx.stop`

将 `formatObject`/`formatArray` 中的 `lbrace = ctx.LBRACE()` 等改为 `ctx.start`（开括号 token）、`ctx.stop`（闭括号 token）。二者为 `ParserRuleContext` 上的 `CommonToken`，与 `hiddenLeft`/`hiddenRight` 兼容。

可选辅助：`toToken(node) => node?.symbol ?? node`，但 object/array context 的 start/stop 已足够。

**Alternative**：修改 `hiddenLeft`/`hiddenRight` 内部解包 TerminalNode — 可行，但 bracket 处直接用 `ctx.start`/`ctx.stop` 更明确，且与 `endToken` 一致。

### 3. 非空容器 opening 注释：不 emit `hiddenRight(ctx.start)`

对 **有 member/元素** 的 object/array，**不**在 `{`/`[` 后 emit `hiddenRight(start)`，继续由首个子项的 `hiddenLeft(child.start)` 吸收 opening 间隙中的注释。

**Rationale**：`hiddenRight({)` 与 `hiddenLeft(firstKey)` 覆盖同一 HIDDEN 区间；两者都 emit 会重复。且 spec 要求 `sortKeys` 时 `// about b` 随 member `b` 移动，注释必须锚定在 member 的 key token 左侧，而非容器 opening。

对 **空** object/array（`members.length === 0` / `values.length === 0`），在 `{`/`[` 与 `}`/`]` 之间无子项，须 emit `hiddenRight(start)` 和/或 `hiddenLeft(stop)`（同一区间，择一或合并去重 — 实现时只 emit 一侧即可，推荐 `hiddenRight(start)` + `hiddenLeft(stop)` 若区间不重叠；空容器通常注释只在中间一侧，两侧查询结果相同，emit 一次）。

### 4. 非空容器 closing 前注释：修复 `hiddenLeft(ctx.stop)`

在闭合 `}`/`]` 前 emit `hiddenLeft(ctx.stop)`（使用 CommonToken）。这与父级 `hiddenRight(nestedValue.stop)` 不冲突：父级捕获 **嵌套 value 闭括号之后** 的注释（如 `{}, // inline`），`hiddenLeft(stop)` 捕获 **闭括号之前、最后子项之后** 的注释。

### 5. 测试策略

- 在 `test/run.mjs` 或独立脚本中，对 `test.json5.text` 比较输入/输出注释计数（或逐条包含断言）
- 增加小 fixture 覆盖：文档首尾、空容器、member 与 `}` 之间、`sortKeys` + member 注释

## Risks / Trade-offs

- **[Risk] `trimEnd()` 剥掉尾部注释后的换行** → `formatDocument` 在 emit 文档尾注释后再决定是否 trim；仅 trim 纯空白，不剥注释内容
- **[Risk] 空容器双路径 emit 重复** → 空容器只 emit `hiddenRight(start)` 或 `hiddenLeft(stop)` 之一（实测 ANTLR 对同一区间两侧查询结果相同，选一侧即可）
- **[Risk] 回归 sortKeys 注释锚定** → 保持非空 opening 不走 `hiddenRight(start)`；现有 scenario `{ // about b\n b: 1, a: 2 }` 必须仍通过

## Migration Plan

1. 修改 `format-emitter.js`
2. 运行 `node test/run.mjs` 更新 `test/resources/out/test.json5.format*.text`（若采用快照对比）
3. 无需 API 或消费者迁移；输出更完整属 bug 修复

## Open Questions

（无 — 探索阶段已确认根因与修复边界）
