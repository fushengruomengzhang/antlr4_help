## Context

`firstClassName` 当前实现：

```javascript
runParsePipeline({ entryRule: 'compilationUnit' }) → extractFirstClassName(tree)
```

`compilationUnit` 规则要求 parse 全部 `typeDeclaration` 并到达 `EOF`，每个 class 含完整 `classBody`。`extractFirstClassName` 只读第一个 `Identifier`，但 parser 已处理整文件。

探索结论：用户需要 **strict** 与 **fast** 两种契约，不宜改写现有 `firstClassName`。

## Goals / Non-Goals

**Goals:**

- 新增 `peekFirstClassName`：在首个顶层类型 body 入口（`{`）前 cancel parse，停止 lex 后续字符
- 取名规则与 `firstClassName` 一致（class/interface/enum/@interface，跳过顶层 `;`）
- header 或 compilationUnit 前缀非法 → `ParseError`；body 非法 → 仍返回类名
- 保留 `firstClassName` 完全不变

**Non-Goals:**

- 优化或修改 `signatures()`、`API.java8ToApiSchema`
- 修改 `Java8Parser.g4` 或 regen grammar（首版用 listener cancel）
- 纯 token/regex 扫描路径
- 性能 benchmark 纳入 CI

## Decisions

### 1. 新 API 命名：`peekFirstClassName`

**选择**：`JAVA8.peekFirstClassName(input): string | null`

**理由**：与 `firstClassName` 成对；`peek` 暗示不深入 body、非完整 validation。

**备选**：`scanFirstClassName` — 略像 regex 扫描，弃用。

### 2. Early exit：ParseListener + cancel at body entry

**选择**：仍调用 `parser.compilationUnit()`，注册 listener，在以下规则 **enter** 时若已捕获首个类型名则终止 parse：

| 顶层类型 | Cancel hook |
|----------|-------------|
| class | `enterClassBody` |
| enum | `enterEnumBody` |
| interface | `enterInterfaceBody` |
| `@interface` | `enterAnnotationTypeBody` |

在 cancel 前从父 context 读取 `Identifier`（与 `extractFirstClassName` 逻辑对齐）。

**理由**：不改 grammar；parser 在 `{` 处停止拉 token，满足「不处理全部字符串」。

**备选**：新 grammar 入口 `firstTopLevelTypeName` — 更干净但需 regen；留作后续优化。

### 3. Cancel 机制

**选择**：抛出自定义 `FirstClassNameFoundError`（或 antlr4 提供的 cancellation 类型，实现时 spike），在 `first-class-name` 专用 pipeline 中捕获并返回已捕获的 name；**不**当作 `ParseError`。

**理由**：与真实语法错误区分；避免 error listener 误报。

### 4. 不返回 parse tree

**选择**：`peekFirstClassName` 仅返回 `string | null`，不暴露 tree。

**理由**：early exit 后 tree 不完整，无消费方。

### 5. Strict vs peek 错误边界

```
package/import/header 非法  → 两者 ParseError
body 非法                    → firstClassName ParseError
                               peekFirstClassName 返回类名（若 header 已合法）
无顶层类型                   → 两者 null
```

## Risks / Trade-offs

- **[Risk] antlr4 JS cancel API 不完善** → **Mitigation**：实现前 spike；可退化为自定义 Error + try/catch
- **[Risk] 用户误用 peek 当 validator** → **Mitigation**：JSDoc 明确「不验证 body；需 strict 时用 firstClassName」
- **[Risk] extends/implements Clause 含语法错误** → **Mitigation**：header 段错误仍 ParseError；与 firstClassName 在 header 段行为一致

## Migration Plan

1. 实现 `peek-first-class-name.js` + pipeline helper
2. 导出 `JAVA8.peekFirstClassName`
3. 添加 integration fixture + run.mjs case
4. `npm test` 全绿

回滚：删除新文件与 export，无数据迁移。

## Open Questions

（无）
