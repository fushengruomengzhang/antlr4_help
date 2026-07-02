## Context

`JSON5.format` 当前路径：`runParsePipeline` → `FormatEmitter.formatDocument`，直接在 parse tree + filled token stream 上 emit。`sortKeys: true` 时，`format-emitter.js` 用 ~200 行启发式（`hiddenLeftForSortedMember`、`memberSuffixForSortedMember`、`isNextMemberPurePrefix` 等）在 emit 阶段重新推断注释归属。

g4 结构（`Json5Parser.g4`）：

```
object : LBRACE (member (COMMA member)* COMMA?)?
member : key COLON value
array  : LBRACK (value (COMMA value)* COMMA?)?
```

COMMA 是 object/array 层 sibling，不属于 member/value。注释在 lexer HIDDEN channel。

约束：不新增 public API；`parse()` 仍丢弃注释；现有 format 行为与测试 case 必须保持。

## Goals / Non-Goals

**Goals:**

- 引入 grammar-driven Document AST，build 阶段一次完成注释归类
- `sortKeys` = 对 `ObjectNode.entries[]` 按 key 稳定排序，整 entry（before + member + right + sep）移动
- format 内部三阶段：`buildDocumentAst` → `transformAst` → `emitDocument`
- 删除 emit 阶段 token span 考古逻辑
- pretty / compact 共享同一 `buildDocumentAst`
- 第一版注释槽位存 raw string

**Non-Goals:**

- 不新增 `parseAST` / `formatAST` 等 API
- 不改 g4（除非发现 grammar bug）
- 不 sort array 元素
- 不在本次 refactor 中改 JSON4 / JAVA8 / API
- 第一版不实现 Comment[] 结构化存储（typedef 预留）

## Decisions

### D1: AST 节点与三槽位模型

**决策**：Object/Array 使用 `entries[]`；每条 entry 含 `before`、`right`、`sep`；容器另含 `openRight`、`closeBefore`、`closeRight`；Document 含 `before`、`after`。

**理由**：与 g4 sibling 结构对齐；sort 单元 = entry；前行注释与行尾注释同属一条 entry。

**备选**：Map-by-key — 丢弃顺序、无法表达 duplicate key，否决。

### D2: COMMA 归属 sep / trailingSep（g4 驱动）

**决策**：

- `sep`：若 `object.COMMA(i)` 存在于 `member[i]` 与 `member[i+1]` 之间，则 `sep` = COMMA.text + 其后 hidden 直至下一 key.start；否则 `sep` 为空
- `trailingSep`：末 member 后 g4 可选 `COMMA?` + hidden
- `right`：value.stop 至 COMMA.start 之间 hidden，**不含 COMMA token**
- 非 ASCII 逗号（如 `，`）不是 g4 COMMA，不进 `sep`

**理由**：用户明确要求「是否含逗号要看 g4」；避免 emit 阶段正则猜逗号。

**备选**：sep 与 right 合并 — 丢失 g4 边界，否决。

### D3: 注释存储形态

**决策**：第一版各槽位存 `string`（opaque raw text，含空白）。

**理由**：round-trip 简单；emit 顺序固定为 `before + anchor + right + sep`。

**备选**：`Comment[]` — 留待 LSP 需求时再引入。

### D4: ArrayEntry 与 ObjectEntry 同型

**决策**：`ArrayEntry { before, value, right, sep }`；不 sort。

**理由**：array 无 key，index 为隐式锚点；规则与 object 一致。

### D5: 三引号 opener 注释

**决策**：挂在 `StringNode.openRight`（三引号 opener token 右侧 hidden）。

**理由**：opener 是 string 规则内 token，不应绑到 parent entry.sep。

### D6: duplicate key

**决策**：`entries[]` 保留全部 member；`sortKeys` 稳定排序；`parse()` 仍后者覆盖。

### D7: transform 与 emit 职责

**决策**：

- `transformAst`：`sortKeys`；对容器 `trailingSep` 去尾逗号（format 规则，不 mutate build 语义）
- `emitDocument`：pretty / compact 布局；primitive 字符串规范化（pretty 转双引号等）

**理由**：build 忠实源码；normalize 在 transform/emit。

### D8: 实施节奏（分步）

**决策**：

1. `ast-builder.js` + ast-builder 单测（entry 槽位划分）
2. `ast-transform.js` + `emitDocument` 接入 `format()`
3. 删除旧启发式；全量回归 `npm test`

**理由**：降低一次性替换风险；builder 可独立验证注释归属。

### D9: 文件布局

```
src/parser/json5/
  ast-builder.js      # buildDocumentAst(tree, tokenStream)
  ast-transform.js    # transformAst(ast, options)
  ast-types.js        # JSDoc typedef（可选）
  format-emitter.js   # emitDocument + format() 入口（瘦身）
  value-visitor.js    # parse 不变；builder 复用 keyToString 等
```

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| buildAst 与现有 emit 行为细微差异 | 以现有 `json5.sort-*.text` case 为契约；builder 单测 + 端到端回归 |
| pretty/compact emit 迁移工作量大 | 分步：先 compact+sort 路径，再 pretty |
| `right`/`sep` 边界 case（块注释跨行） | spec 中固定规则；用 `test.json5.text` 与大 fixture 覆盖 |
| 性能回归 | bench-json5.mjs 对比 refactor 前后 |
| raw string 槽位不利于未来 LSP | typedef 预留 Comment[]；槽位名不变 |

## Migration Plan

1. 新增 ast-builder/transform，format 仍走旧路径（feature 未切换）
2. 单测通过后，`format()` 切换至 AST pipeline
3. 删除旧 sort 启发式代码
4. `npm test` 全绿后合并
5. 回滚：恢复 `format()` 调用旧 `FormatEmitter` 即可（git revert）

## Open Questions

（无。用户已确认采纳全部默认决策。）
