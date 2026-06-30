## Context

当前 `src/index.js`（~244 行）承担三项职责：长篇 API 文档、深层 import 组装、`ParseError` 从 `core/` 直接导出。各产品线（json5/json/java8/api）仅有散落的实现文件，无统一 public barrel。`perf-unified-core-utilities` 已将 `core/` 确立为内部共享工具层，与「core 不对外」原则一致。

约束：
- 对外 `import from 'antlr4_help'` 形状不变
- `npm test` 全绿
- 不引入 `package.json` subpath exports（留后续 change）

## Goals / Non-Goals

**Goals:**

- 各产品线 `index.js` 作为唯一 public barrel，含命名空间对象与用法 JSDoc
- `src/index.js` 瘦身为 re-export 层（目标 ~20 行）
- `ParseError` 公开路径为 `src/parser/parse-error.js`
- `core/` 无 `index.js`，不被顶层 import

**Non-Goals:**

- `package.json` `exports` 子路径（lazy load 前置，另开 change）
- 变更对外 API 行为或函数签名
- 将内部 helper（`buildClassMap`、`visitValue` 等）新增为 public export
- README 大改（可顺带更新 import 说明一句）

## Decisions

### 1. 各 package `index.js` 结构

每个 barrel 导出命名空间常量 + 该包专属 re-export：

```javascript
// json5/index.js — 示例
/** @module json5 ... 长篇 JSDoc ... */
export { DEFAULT_FORMAT_OPTIONS } from './format.js';
export const JSON5 = { validate, parse, format };
```

| 文件 | export | JSDoc 来源（自 index.js 迁移） |
|------|--------|-------------------------------|
| `json5/index.js` | `JSON5`, `DEFAULT_FORMAT_OPTIONS` | JSON5 三节 + FormatOptions |
| `json/index.js` | `JSON4` | JSON4.parse + 命名说明 |
| `java8/index.js` | `JAVA8` | firstClassName / peek / signatures |
| `api/index.js` | `API` | snowflakeId / java8ToApiSchema |

### 2. ParseError 路径

- 新建 `src/parser/parse-error.js`：`export { ParseError } from './core/parse-error.js';`
- 或 git mv 实现至 `parser/parse-error.js`，`core/parse-error.js` 改为 re-export — **采用 re-export facade**，避免大量改 import

`src/index.js`：`export { ParseError } from './parser/parse-error.js';`

### 3. 瘦 `src/index.js`

```javascript
/**
 * antlr4_help 统一入口 — 聚合各产品线 public export。
 * @module antlr4_help
 */
export { ParseError } from './parser/parse-error.js';
export { JSON5, DEFAULT_FORMAT_OPTIONS } from './parser/json5/index.js';
export { JSON4 } from './parser/json/index.js';
export { JAVA8 } from './parser/java8/index.js';
export { API } from './parser/api/index.js';
```

### 4. 文档迁移规则

- 表格、Scenario 级说明 → 各 package `@module` 或命名空间 `@typedef` / 方法 JSDoc
- `java8ToApiSchema` 默认 `rootClass` 文档改为「首个输入文件首个顶层类型名」（与 v2.5.5 实现一致，不再写 `firstClassName`）
- `index.js` 保留 `@module antlr4_help` 一句 + 指向各 package 的 `@see`

### 5. 内部 import 不变

实现文件（`validate.js`、`parse.js` 等）继续 import `core/*`；仅 public 边界移至 package `index.js`。

### 6. 验收

- `npm test` 100%
- `openspec validate --all`
- `src/index.js` 无深层 import、无 JSON5 分节文档
- IDE 打开 `json5/index.js` 可见完整 JSON5 API 文档

## Risks / Trade-offs

- **[Risk] JSDoc 迁移遗漏** → 对照旧 index.js 逐节 checklist
- **[Risk] 循环 import** → barrel 只 import 叶子实现，实现不 import barrel
- **[Trade-off] parse-error facade 多一层** — 换公开路径清晰，可接受

## Migration Plan

1. 新建 `parser/parse-error.js` facade
2. 创建 4 个 package `index.js`，迁移 JSDoc + 组装命名空间
3. 重写瘦 `src/index.js`
4. `npm test` + validate

## Open Questions

（无）
