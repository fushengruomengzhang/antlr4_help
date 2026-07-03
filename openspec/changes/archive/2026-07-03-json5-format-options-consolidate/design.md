## Context

当前 `src/parser/json5/format/format-options.js` 定义 `FormatOptions`、`DEFAULT_FORMAT_OPTIONS` 与 `normalizeFormatOptions`。`format.js` 将原始 `options` 透传给 `transformDocumentAst` 与 `emitDocument`，二者各自再次 normalize——重复且边界模糊。

用户决策：
- **`indent` 保持 object 形态** `{ type, size }`，本次不推进 string 硬切
- **`normalizeFormatOptions` 不对外 export**

## Goals / Non-Goals

**Goals:**
- 删除 `format/format-options.js`
- 选项默认值与解析逻辑归属 `format.js`（公共门面）
- `format()` 入口唯一一次 resolve，内部管线接收 **ResolvedFormatOptions**
- 继续 export `DEFAULT_FORMAT_OPTIONS`；`JSON5.format` 行为不变

**Non-Goals:**
- 不改 `indent` 字段形状（不改为 string）
- 不改 `sortKeys` / `compact` 语义
- 不修改 format 输出或测试 expected
- 不处理主 spec 中 `indent` string 与实现 object 的历史漂移（另开 change）

## Decisions

### 1. 类型分层

```javascript
/** 公共入参（partial） */
FormatOptions { indent?, sortKeys?, compact? }

/** 内部 resolved（format.js 产出，下游专用） */
ResolvedFormatOptions { indent: IndentConfig, sortKeys: boolean, compact: boolean }
```

`resolveFormatOptions(options?)` 为 `format.js` 内部函数（不 export），逻辑与现 `normalizeFormatOptions` 相同。

### 2. 数据流

```
JSON5.format(input, userOptions?)
        │
        ▼
format.js: resolved = resolveFormatOptions(userOptions)   ← 唯一 resolve
        │
        ├── transformDocumentAst(ast, resolved)
        └── emitDocument(ast, tokenStream, resolved, input)
```

`ast-transform.js` / `emit.js` 构造函数与导出函数签名改为 `ResolvedFormatOptions`，移除内部 `normalizeFormatOptions` 调用。

### 3. 文件归属

| 符号 | 位置 |
|------|------|
| `DEFAULT_FORMAT_OPTIONS` | `format.js` export |
| `resolveFormatOptions` | `format.js` 内部 |
| `FormatOptions` / `ResolvedFormatOptions` typedef | `format.js` JSDoc |
| AST / emit / token-slice | 仍在 `format/` |

### 4. 导出策略

- `format.js`：**删除** `export { normalizeFormatOptions }`
- `index.js`：仅 re-export `DEFAULT_FORMAT_OPTIONS`（已如此）
- 若外部曾 `import { normalizeFormatOptions } from '.../format.js'`，属未文档化用法，本次移除无版本 bump 必要（patch 级内部整理）

### 5. 备选方案（未采纳）

| 方案 | 原因未采纳 |
|------|-----------|
| 保留 `format-options.js` 仅删重复 normalize | 未满足用户「删除文件、上移到 format.js」 |
| `indent` 改 string 并对齐 json5-format-ast spec | 用户明确要求 indent 保持不变 |
| 在 `types.js` 放 Resolved 类型 | 选项是门面关注点，放 `format.js` 更贴切 |

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 内部模块误传 raw options | TypeScript/JSDoc 用 `ResolvedFormatOptions` 标注；`format()` 单点 resolve |
| `json5-module-layout` spec 写「format options 在 format/」 | delta spec 更新该 requirement |
| bench 直接 import `format-options.js` typedef | 改指向 `format.js` |

## Migration Plan

1. 在 `format.js` 内联 options 逻辑
2. 改 `format()` 单点 resolve 并下传
3. 更新 `ast-transform.js`、`emit.js` 签名，删 import
4. 更新 `index.js`、bench JSDoc 路径
5. 删除 `format/format-options.js`
6. `npm test` 全绿

## Open Questions

（无 — 用户已确认 indent 保持 object、不 export normalize）
