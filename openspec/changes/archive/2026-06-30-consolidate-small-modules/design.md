## Context

`refactor-package-public-exports` 后结构为各包 `index.js` + 实现文件，但仍有 ~10 个过小文件：1 行 re-export、15–22 行 pipeline wrapper。全量扁平化（每包单文件）已放弃；本 change 仅合并相邻职责模块。

当前小文件清单：

| 文件 | 行数 | 处置 |
|------|------|------|
| `json/string-utils.js` | 1 | 删除 |
| `json/parse.js` | 18 | → `value-visitor.js` |
| `json5/validate.js`, `parse.js` | 15–18 | → `value-visitor.js` |
| `json5/format.js` | 22 | → `format-emitter.js` |
| `java8/first-class-name.js`, `signatures.js` | 18 | → `signature-visitor.js` |
| `api/snowflake-id.js` | 16 | → `api/index.js` |
| `core/error-listener.js`, `visit-helpers.js`, `parse-error.js` | 17–24 | → `parse-pipeline.js` 或 `parser/parse-error.js` |

## Goals / Non-Goals

**Goals:**

- 删除/合并上表文件；各 `index.js` 改 import 来源
- `ParseError` 类实现在 `src/parser/parse-error.js`（保留公开文档）
- `npm test` 全绿；对外 API 不变

**Non-Goals:**

- 删除 `parser/` 目录或合并为大单文件
- 合并 `peek-first-class-name.js`、`models.js`、`type-parser.js` 等已有体量模块
- 变更对外 export 签名

## Decisions

### 1. ParseError 统一到 `parser/parse-error.js`

将 `core/parse-error.js` 的 class 实现移入 `parser/parse-error.js`（保留现有 JSDoc）。`core/parse-pipeline.js` 与 `error-listener` 逻辑改 import `../parse-error.js`。

**Alternative**：保留 core 实现 + facade — 多一层，不采纳。

### 2. core helper 并入 `parse-pipeline.js`

`CollectingErrorListener`、`throwIfErrors`、`visitArrayChildren` 移入 `parse-pipeline.js` 末尾 export。删除 `error-listener.js`、`visit-helpers.js`。

### 3. JSON4/JSON5 pipeline 入口并入 visitor / emitter

```javascript
// value-visitor.js 末尾
export function parse(input) { ... runParsePipeline + visitValue ... }
export function validate(input) { ... }  // json5 only
```

```javascript
// format-emitter.js 末尾
export function format(input, options) { ... }
export { DEFAULT_FORMAT_OPTIONS, normalizeFormatOptions };
```

各 `index.js` 改为：
```javascript
import { validate, parse } from './value-visitor.js';
import { format, DEFAULT_FORMAT_OPTIONS } from './format-emitter.js';
```

### 4. Java8 共用 helper

在 `signature-visitor.js` 添加：

```javascript
function runCompilationUnit(input, extract) {
  const { tree } = runParsePipeline({ language: 'java8', ... });
  return extract(tree);
}
export function firstClassName(input) {
  return runCompilationUnit(input, extractFirstClassName);
}
export function signatures(input) {
  return runCompilationUnit(input, extractFileModel);
}
```

删除 `first-class-name.js`、`signatures.js`。`api/java8-to-api-schema.js` 改 import `../../java8/signature-visitor.js` 的 `signatures`。

### 5. snowflakeId 内联至 `api/index.js`

`java8-to-api-schema.js` 改从 `../index.js`  import 会循环 — **改从同文件导出函数 import** 或保留 `snowflake-id.js` 仅给 `java8-to-api-schema` 用。

**Decision**：`snowflakeId` 函数定义在 `api/index.js`；`java8-to-api-schema.js` import 自 `./snowflake-id.js` **改为** 从 `../snowflake.js` 不行。

Better: move snowflake to `api/snowflake.js` as single small file? User wanted to merge into index.

For `java8-to-api-schema.js`:
- Option A: define `snowflakeId` in a shared `api/id.js` - still a file
- Option B: inline snowflakeId in both index and java8-to-api-schema - duplicate
- Option C: `java8-to-api-schema.js` imports from `../index.js` - circular if index imports java8-to-api-schema

**Resolution**：将 `snowflakeId` 移入 `api/java8-to-api-schema.js` 顶部并 export；`api/index.js` re-export `snowflakeId` from there. 或单独保留 `snowflake-id.js` 仅当被 index 与 java8-to-api-schema 共用 — 16 行，合并到 `java8-to-api-schema.js` 并 export，index re-export。

```javascript
// api/java8-to-api-schema.js - export snowflakeId at top (or bottom)
// api/index.js
import { snowflakeId, java8ToApiSchema } from './java8/java8-to-api-schema.js';
```

这样删除 `snowflake-id.js`，snowflake 与 schema 转换同目录但 schema 文件略增 — acceptable.

### 6. 删除 string-utils.js

`json/value-visitor.js`、`json5/value-visitor.js` 直引 `../core/string-decode.js`。

## Risks / Trade-offs

- **[Risk] 循环 import** → index 只 import 叶子模块；api index import java8-to-api-schema 不反向
- **[Risk] 文件变长** → value-visitor +30 行、parse-pipeline +40 行，可接受
- **[Trade-off] snowflakeId 移入 java8-to-api-schema.js** — 略混合职责，但避免 api/index 循环依赖

## Migration Plan

1. ParseError 迁移 → 更新 core import
2. 合并 parse-pipeline helpers → 删旧 core 文件
3. json/json5/java8 合并 → 更新 index.js
4. api snowflake 迁移
5. npm test + validate

## Open Questions

（无）
