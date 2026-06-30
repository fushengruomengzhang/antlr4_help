## Context

JSON4、JSON5、Java8 共用 `runParsePipeline`，但性能基建分散：`format-emitter.js` 内私有 `TextBuf`；`json/string-utils.js` 的 `decodeJsonString` 用 `out +=`；JSON4/JSON5 value visitor 的 `visitArray` 均用 `.map`；`CollectingErrorListener` 在 `parse-pipeline.js` 与 `peek-first-class-name.js` 重复；pipeline 未启用 SLL；`java8ToApiSchema` 默认路径对同一文件 parse 两次（`signatures` + `firstClassName`）。

v2.5.1 已对 JSON5 format emitter 做单语言 P0/P1 优化。本 change 将 **机制层**（字符串拼接、decode、visit、listener、prediction mode）上提到 `src/parser/core/`，三线同受益，并补齐 `bench-all.mjs`。

**Benchmark 基线（本机 Node，2026-06-30，优化前）：**

| 场景 | ms/op |
|------|-------|
| JSON4.parse (fixture) | 0.12 |
| JSON5.parse (fixture) | 0.63 |
| JSON5.format sort+compact (fixture) | 0.76 |
| JSON5.sort+compact (500 keys flat) | 1.99 |
| JAVA8.signatures (test.java.text) | 9.4 |
| JAVA8.peekFirstClassName | 0.23 |
| API.java8ToApiSchema | 19.3 |
| import Java8Parser.js (cold) | ~26ms |

**Benchmark 优化后（本机 Node，2026-06-30，`scripts/bench-all.mjs`）：**

| 场景 | 优化前 ms/op | 优化后 ms/op | 变化 |
|------|-------------|-------------|------|
| JSON4.parse (fixture) | 0.12 | 0.13 | ≈0 |
| JSON5.parse (fixture) | 0.63 | 0.65 | ≈0 |
| JSON5.sort+compact (500 keys) | 1.99 | 2.05 | ≈0 |
| JSON4.parse (2000 keys) | 1.53 | 1.53 | ≈0 |
| JAVA8.signatures | 9.4 | 0.59 | **−94%** |
| API.java8ToApiSchema | 19.3 | 1.70 | **−91%** |

Java8/API 大幅提升主要来自 SLL 预测 + 消除 `java8ToApiSchema` 双 parse。JSON4/JSON5 parse 与 format 在小/中 fixture 上变化在噪声范围内；共享 decode/visit/TextBuf 为大规模 string/array 场景预留优化空间。

## Goals / Non-Goals

**Goals:**

- 抽取 `TextBuf`、`string-decode`、`visit-helpers`、`error-listener` 至 `core/`
- 优化 decode / visitArray / TextBuf 边界 join / formatDocument 拼接
- `runParsePipeline` SLL + LL fallback（JSON4 / JSON5 / Java8）
- `java8ToApiSchema` 消除默认路径双 parse
- 全部 format 模式与 parse 结果 **byte-equal / 语义 equal**（相对优化前）
- `scripts/bench-all.mjs` 可重复跑 before/after
- 方法中文 JSDoc（新增 core 模块及改动入口）

**Non-Goals:**

- JSON5 sort 架构重写（compact-then-reorder）
- Java8 部分 parse / 瘦 grammar
- `JSON4.validate` 新 API
- Java8 lazy import / 子路径导出
- ANTLR 版本升级或 grammar 变更
- 将 bench 纳入 `npm test` CI 门禁
- Java8 注解 `StringLiteral` 改用共享 decode（转义语义与 JSON 有差异，留后续 spike）

## Decisions

### 1. Phase 顺序：抽取 → 优化 → pipeline → 薄层

1. **Phase A**：纯 refactor 移至 `core/`，`npm test` 全绿，bench 无变化
2. **Phase B**：共享层与 format 内优化，`byte-equal` 回归
3. **Phase C**：SLL pipeline
4. **Phase D**：`java8ToApiSchema` + `bench-all.mjs`

**Rationale**：先结构后性能，便于 bisect。**Alternative**：先做 SLL — 与 refactor 混杂，回归困难。

### 2. `string-decode.js` 迁入 core，`json/string-utils.js` re-export

```javascript
// src/parser/json/string-utils.js
export { decodeJsonString, encodeJsonString } from '../core/string-decode.js';
```

**Rationale**：外部仅通过 `JSON4`/`JSON5` 顶层 API 消费，内部 import 路径稳定。**Alternative**：全仓库改 import —  diff 更大，无必要。

### 3. `decodeJsonString` 优化策略

- 扫描 `inner` 无 `\` 时直接 `slice(1, -1)` 返回（无转义快路径）
- 含转义时用 `TextBuf.pushChar` 或 `parts[]` + 单次 `join`
- `encodeJsonString` 保持链式 replace（非热点）

**Rationale**：JSON4/JSON5 parse 共享，长 string 场景受益。

### 4. `visitArrayChildren` 预分配

```javascript
export function visitArrayChildren(nodes, visitFn) {
  const n = nodes.length;
  const arr = new Array(n);
  for (let i = 0; i < n; i++) arr[i] = visitFn(nodes[i]);
  return arr;
}
```

**Rationale**：消除 `.map` 中间数组；JSON4 用 `Object.create(null)` 的 object 路径不变。

### 5. `TextBuf` 边界优化

维护 `linePrefix` 或在 `beginMemberLine` 时仅 materialize 当前行尾，避免每次 `parts.join('')` 扫描全量输出。

`formatDocument` / `emitTripleSingleString` / `emitTripleDoubleString` 改用 `TextBuf` 替代 `out +=`。

**Rationale**：v2.5.1 仅四 container formatter 用 TextBuf；根文档与 triple 仍 `+=`。

### 6. SLL + LL fallback 实现

```javascript
import antlr4 from 'antlr4';
const { PredictionMode } = antlr4.atn;

function parseWithPrediction(parser, tokenStream, entryFn) {
  parser._interp.predictionMode = PredictionMode.SLL;
  try {
    return entryFn();
  } catch {
    tokenStream.seek(0);
    parser.reset();
    parser._interp.predictionMode = PredictionMode.LL;
    return entryFn();
  }
}
```

Lexer errors 在 SLL 尝试前后均检查；Parser errors 以 LL 重试结果为准。

**Rationale**：ANTLR 官方推荐模式。**Alternative**：仅 JSON4/JSON5 启用 — Java8 也应同 pipeline 受益；若 Java8 fallback 率过高再评估分语言开关。

### 7. `java8ToApiSchema` 消除双 parse

未传 `rootClass` 时：

```javascript
rootName = fileModels[0].types[0]?.name ?? undefined;
```

与 `extractFirstClassName` 同序（`compilationUnit.typeDeclaration` 顺序）。**不再**调用 `firstClassName(codes[0])`。

**Rationale**：`signatures` 已完整 parse；`types[0]` 与 `extractFirstClassName` 规则一致（见 explore 验证）。

### 8. `bench-all.mjs` 结构

复用 `bench-json5.mjs` 的 `bench(label, fn)` helper（可抽到 `scripts/bench-lib.mjs` 或内联复制）。覆盖：

- JSON4.parse（fixture + 500/2000 key synthetic）
- JSON5 validate/parse/format 四种模式 + 大 object
- JAVA8 signatures / peekFirstClassName / API.java8ToApiSchema
- 可选 cold import 一行报告

**Rationale**：统一 before/after 对比面。

### 9. 验收

- `npm test` 100% 通过
- 主 fixture JSON5 四种 format byte-equal 抽检
- bench-all 对比；500 key sort+compact 与 JSON4 2000 key 有 measurable 变化或零回归
- `openspec validate --all`

## Risks / Trade-offs

- **[Risk] SLL 路径 Java8 语义差异** → 全量 `npm test` + java8 golden；异常时 fallback LL
- **[Risk] TextBuf 边界改动改变 format 输出** → byte-equal 对比 + sort 注释 cases 全跑
- **[Risk] decode 快路径漏转义** → 现有 string 集成测试 + 含 `\u` `\n` 用例
- **[Risk] `types[0]` 与 `extractFirstClassName` 不一致** → 用 `test.java.text` 断言 root 为 `User`；多文件场景仅首文件
- **[Trade-off] Phase A refactor diff 较大** — 行为不变，便于后续维护

## Migration Plan

1. Phase A：建 core 模块、改 import、删重复 listener/TextBuf
2. Phase B：decode/visit/TextBuf/formatDocument 优化；每步 `npm test`
3. Phase C：SLL pipeline；跑 bench-all
4. Phase D：`java8ToApiSchema` + bench-all.mjs
5. `openspec validate --all`；bump patch 版本

## Open Questions

（无 — explore 阶段已收敛 scope）
