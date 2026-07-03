## Context

`JSON5.format` 现有实现在 `buildDocumentAst` 阶段通过 `TokenStreamHelper` 将注释预填入 `before` / `suffixSort` / `openRight` 等槽位，emit 仅拼接字符串。该模式在 `sortKeys` 场景需要 gap 考古式启发式（`purePrefixHiddenTokens`、`excludedNextMemberPrefixIndices`），维护成本高且 build 阶段是性能热点。

## Goals / Non-Goals

**Goals:**
- AST 只记录结构与语义锚点的 `AnchorTriplet`（prev / current / next）
- emit 阶段按 token 索引区间切片提取注释原文
- sortKeys 只重排 entries，不改 Triplet
- 保留注释文本；纯空白由 formatter 按 compact/pretty 规则重写
- 全部现有 format 测试通过；buildAst 性能不劣于基线

**Non-Goals:**
- 不改 `JSON5.parse` / `JSON5.validate`
- 不改公共 `FormatOptions` API
- 不保留旧注释槽位字段

## Decisions

### 1. 三元锚点语义赋值（非机械 idx±1）

每个语义 token 的 `prev` / `next` 在 build 时按**注释区间边界**赋值，而非简单取 token 流 `idx-1` / `idx+1`：

| 锚点 | prev | current | next |
|------|------|---------|------|
| object `open` | 哨兵_start | `{` | 开括号后第一个 token |
| entry `key` | `{` 或上一 entry 的 `end.current` | key token | `:` |
| entry `end` | value 末 token | `,`（无则=value 末） | 下一 key 或 `}` |
| object `close` | 末 entry `end.current` | `}` | 哨兵_end |

**理由**：机械 idx±1 无法覆盖 key 前的多行 prefix 注释；语义边界保证区间 `(prev, current)` 包含完整 prefix 区间。

### 2. 注释切片规则

```
prefix(interval A) = HIDDEN tokens where prev.idx < i < current.idx AND isComment(t)
suffix(interval B) = HIDDEN tokens where current.idx < i < next.idx AND isComment(t)
                     AND (sameLineOnly ? t.line == current.line : true)
```

- 只输出注释 token 的 `.text`（保留原文）
- 纯 ws HIDDEN 丢弃，由 formatter 插入 `\n`、缩进、`, ` 等

### 3. 禁止 gap 考古

- 不允许在 emit 时扫描「输出间隙」或跨 entry 启发式区间
- 不允许 `purePrefixHiddenTokens` / `excludedNextMemberPrefixIndices` 类逻辑
- sort 后每个 entry 的 prefix/suffix 仅来自其自身 Triplet 区间

### 4. 哨兵

```
哨兵_start: tokenIndex = -1, start = 0, stop = 0
哨兵_end:   tokenIndex = input.length, start = len, stop = len
```

### 5. emit 接收 tokenStream

`format.js` 将 `tokenStream` 传入 `emitDocument(doc, tokenStream, options)`；`CommentSlicer` 在 emit 时实例化。

### 6. transform 职责最小化

仅 `sortKeys` 稳定排序 + 递归子树；不在 transform 修改 Triplet 或剥离尾逗号（emit 处理）。

## Module Layout

```
format/
  types.js          TokenCoord, AnchorTriplet, AstNode（无注释字符串）
  token-slice.js    CommentSlicer, coord helpers, sentinel
  ast-builder.js    纯结构 + Triplet
  ast-transform.js  仅 sort
  emit.js           formatter + CommentSlicer 回填
  format-options.js 不变
```

## Performance Baseline（优化前）

| 场景 | 基线 |
|------|------|
| format default (fixture) | 0.742 ms/op |
| buildDocumentAst (2000 keys) | 1.522 ms/op |
| format e2e (2000 keys sort+compact) | 4.232 ms/op |

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 与旧 spec「build 阶段赋值注释」矛盾 | 更新 delta spec；行为以测试为准 |
| pretty 模式布局回归 | 全量测试 + fixture.default 字节对比 |
| 块注释跨行 | 整个 BlockComment token 归入所在区间 |

## Migration Plan

1. 实现新模块并替换 format 管线内部实现
2. 更新 `json5 ast-builder slots` 测试为 Triplet 区间断言
3. 删除 `token-helpers.js` 中考古逻辑（或整文件替换为 `token-slice.js`）
4. 跑 `npm test` + `node scripts/bench-json5.mjs`

## Open Questions

- 无（方案已在 explore 阶段确定）
