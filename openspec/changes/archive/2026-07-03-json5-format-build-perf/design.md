## Context

format 管线：`format.js` → `runParsePipeline(fillTokens: true)` → `buildAndTransformDocumentAst` → `emitDocument`。

bench 分段（2000 flat keys compact）：

| 阶段 | 耗时 | 占比 |
|------|------|------|
| parse+fill | ~1.47ms | ~51% |
| buildDocumentAst | ~0.86ms | ~30% |
| emit | ~0.50ms | ~17% |
| transform | ~0.03ms | ~1% |

用户约束：**只优化 JSON5 format**；**输出 = 现有运行结果**（test expected 为契约）；Tier 1 优先，不动 parse 管线。

当前 build 热点：`ast-builder-transform.js` 的 `buildObject` / `buildArray` 循环内，每个 member 调用 `streamNextToken`、`findCommaToken`；container 级调用 `openLineEndToken`。三者均在 `token-slice.js` 内对 `tokenStream.tokens` 做区间线性扫描，且各自调用 `tokenStream.fill()`（入口已 fill，属冗余）。

## Goals / Non-Goals

**Goals:**

- Tier 1：预索引 + 去冗余 fill + transform 少分配
- 大 flat object 场景 `buildDocumentAst`  measurable 下降（目标 20%+，以 bench 为准）
- `npm test` 零 expected 变更

**Non-Goals:**

- parse/validate/core 管线优化（Tier 2+）
- emit 四路径合并、新 format 选项、API 变更
- 改输出语义或更新 expected 文件

## Decisions

### 1. `TokenIndex` 结构与归属

在 `token-slice.js` 新增 `buildTokenIndex(tokenStream)`，返回只读索引对象：

```
TokenIndex
├── tokens          // 已 fill 的 token 数组引用
├── nextDefault[]   // idx → 下一个 DEFAULT channel 且非 EOF 的 tokenIndex（无则 -1）
├── lineLast[]      // tokenIndex → 同行最后一个 token 的 tokenIndex（供 openLineEnd 等价）
└── (可选) comma 查询仍用 nextDefault + 区间约束，或 commaAt(from,to) 辅助
```

**归属 `token-slice.js`**：与 `findCommaToken` 等同级，不放到 `core/`。

**构建时机**：`buildDocumentAst` 开头调用一次；通过参数 `{ tokenStream, index }` 传入 `buildObject` / `buildArray` / `buildValue` 私有函数，避免模块级可变状态。

**备选（未采纳）**：在 `format.js` 构建 index — 索引是 AST build 关注点，放 token-slice 更内聚。

### 2. 查找函数改写策略

保留现有 export 函数签名供 test 直接调用时行为不变；内部实现改为：

| 函数 | 优化后 |
|------|--------|
| `streamNextToken(stream, token, index?)` | `index.nextDefault[token.tokenIndex]` → `tokens[i]` |
| `findCommaToken(stream, from, to, index?)` | 从 `from+1` 用 nextDefault 跳或短 scan（区间通常极短）；逻辑必须与现实现一致 |
| `openLineEndToken(stream, open, fallback, index?)` | 用 `lineLast` + fallback 比较，等价现 `lastOnLine.tokenIndex >= fallback.tokenIndex` 分支 |

`buildDocumentAst` 路径**始终传入 index**；无 index 时 fallback 到现线性实现（bench/test 分段兼容）。

**去掉 build 路径上的 `tokenStream.fill()`**；`CommentSlicer.ensureFilled()` 保留（emit 阶段独立入口）。

### 3. transform 少拷贝

`transformObject` / `transformArray`：

- 先递归 `transformValue` 各 entry.value（可 in-place 写回 `entry.value`）
- `sortKeys`：对 `entries` 数组 in-place sort（已有 `ord` tie-break），避免 `{ ...entry }` 和 `{ ...node, entries }` 整树拷贝
- 不暴露 `transformDocumentAst` 行为变化

### 4. 验证策略

1. `npm test` 全绿，不碰 `test/resources/expected/`
2. `node scripts/bench-json5.mjs` — 对比 `buildDocumentAst` 与 e2e（2000 keys compact / sort+compact）
3. 现有 AST/triplet 单测（`test/run.mjs` 内 buildDocumentAst cases）仍通过

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 预索引与线性扫描边界不等价（HIDDEN channel、同行 comment） | 全量 test + 保留无 index fallback；重点回归 sort/comment case |
| `lineLast` 构建遗漏 EOF/空行 | 对照 `openLineEndToken` 逐 case 验证 |
| 内存：index 数组与 tokens 同长 | 仅 build 阶段存活，GC 可接受；flat 2k key 场景 tokens 量有限 |
| 优化后 fixture 仍 parse 主导 | 预期内；本 change 不追求 fixture e2e 大幅提速 |

## Migration Plan

1. 实现 `buildTokenIndex` + 改写查找函数（双路径：有/无 index）
2. `buildDocumentAst` 接入 index
3. transform 少拷贝
4. 移除 build 路径冗余 fill
5. test + bench
6. archive change

无 rollback 特殊步骤 — 输出一致则随时可 revert。

## Open Questions

（无 — Tier 1 范围已收敛）
