## Context

JSON5 对外 API 为 `JSON5.validate`、`JSON5.parse`、`JSON5.format`（及 `DEFAULT_FORMAT_OPTIONS`），签名与行为已在 `index.js` 文档化。

当前内部结构：

```
index.js → value-visitor.js (validate + parse + decode 工具)
         → format-emitter.js → ast-builder / ast-transform / ast-emitter
ast-builder.js、ast-emitter.js → import value-visitor.js
```

上一 change（`json5-ast-format-refactor`）已实现 Document AST 三阶段 format 管线，但模块仍 flat 且与 `value-visitor.js` 交叉依赖。

约束：

- 不新增 public API
- `parse()` 不调用 Document AST builder（沿用 `json5-format-ast` spec）
- format 行为与现有 AST spec 一致
- 可共用 `../core/parse-pipeline.js` 与 grammars

## Goals / Non-Goals

**Goals:**

- 三个 API 各有一个顶层入口文件：`validate.js`、`parse.js`、`format.js`
- `format/` 目录收纳 format 专用实现（AST 构建、transform、emit、token 读取、format 选项与 decode 工具）
- 三 API 文件之间 **无互相 import**；`parse.js` / `validate.js` **不得 import `format/`**
- `format.js` 两阶段编排：解析 → AST，再 format（transform + emit）
- 删除 `value-visitor.js`、`format-emitter.js`
- 对外 API 与文档化行为不变

**Non-Goals:**

- 不改变 `JSON5.parse` 走 CST 而非 AST 的策略
- 不新增 `parseAST` / `formatAST` 等 API
- 不修改 g4 或 `json5-format-ast` 的 AST 语义要求
- 不在本次 change 中重构 JSON / Java8 解析器
- 不在 `format/` 与 `parse.js` 之间抽取共享 json5-decode 模块（接受有限重复以保隔离）

## Decisions

### D1: 目录布局

**决策**：

```
src/parser/json5/
├── index.js
├── validate.js
├── parse.js
├── format.js
└── format/
    ├── format-options.js
    ├── decode.js          # key/string/number 工具，仅 format 链使用
    ├── ast-types.js
    ├── token-helpers.js
    ├── ast-builder.js     # 解析 → Document AST
    ├── ast-transform.js   # format 选项（sortKeys 等）
    └── ast-emitter.js     # 输出文本
```

**理由**：`format/` 明确 format 私有边界；三 API 入口 flat，与 `index.js` 对齐。

**备选**：全部 flat 无子目录 — 用户明确要求 **保留 format 目录**。

### D2: format.js 两阶段管线

**决策**：

```javascript
// 概念形状
function format(input, options) {
  const ast = parseToAst(input);      // runParsePipeline(fillTokens:true) + buildDocumentAst
  return formatAst(ast, options);     // transformAst + emitDocument
}
```

阶段 1「解析 → AST」与阶段 2「format」可在 `format.js` 内以私有函数或薄 wrapper 表达；底层仍保留 `ast-builder` / `ast-transform` / `ast-emitter` 分文件。

**理由**：与用户探索结论一致；rename 不改变 AST 语义。

### D3: parse.js 独立 CST 路径

**决策**：`parse.js` 内含（或同目录仅被 parse 引用的）CST visitor：`visitValue` → `visitObject` / `visitArray`；decode 逻辑写在 `parse.js` 底部或 `parse-decode.js`（与 `format/decode.js` 分离）。

**理由**：满足 spec「parse 不调用 AST builder」；与 format 零耦合。

**备选**：parse 也走 AST + astToValue — 与 spec 及用户「三 API 独立」冲突，否决。

### D4: validate.js 最薄实现

**决策**：`validate.js` 仅调用 `runParsePipeline({ fillTokens: false })`；错误由 pipeline 抛出。

**理由**：validate 无值构建、无 token 填充需求。

### D5: decode 工具双份（format vs parse）

**决策**：从现有 `value-visitor.js` 迁出逻辑时，`format/decode.js` 与 `parse.js` 内 decode 各自维护一份（或 parse 侧单文件 `parse-decode.js` 仅 parse import）。

**理由**：彻底切断 cross-import；keyToString / decodeJson5String 逻辑稳定，重复可控。

**风险**：两处 drift → 用交叉测试缓解（见 Risks）。

### D6: index.js 仅聚合

**决策**：

```javascript
import { validate } from './validate.js';
import { parse } from './parse.js';
import { format, DEFAULT_FORMAT_OPTIONS } from './format.js';
export { DEFAULT_FORMAT_OPTIONS };
export const JSON5 = { validate, parse, format };
```

**理由**：单一对外门面；文档注释保留在 `index.js`。

### D7: 删除旧文件

**决策**：删除 `value-visitor.js`、`format-emitter.js`；移动并重写 import 路径后无残留引用。

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| parse 与 format 的 decode 逻辑 drift | 添加「同一 input：parse 值与 format 后再 parse 值一致」smoke 测试 |
| 移动文件导致测试 import 断裂 | tasks 含更新 `test/` 路径与 `npm test` |
| ast-builder 仍依赖旧 value-visitor import | 迁移时改为 `format/decode.js` |
| 重复代码约 ~80 行 | 可接受；隔离优先于 DRY |

## Migration Plan

1. 创建 `format/` 并移动 AST 相关文件，更新内部 import
2. 新增 `format/decode.js`，从 `value-visitor` 复制 format 所需函数
3. 实现 `format.js`（替代 `format-emitter.js`）
4. 实现 `parse.js`（从 `value-visitor` 迁 visitor + decode）
5. 实现 `validate.js`
6. 更新 `index.js`
7. 删除 `value-visitor.js`、`format-emitter.js`
8. 跑 `npm test`；必要时 `node scripts/bench-json5.mjs`

回滚：git revert 单次 change commit。

## Open Questions

- `parse-decode.js` 是否作为 parse 侧独立文件，还是全部内联在 `parse.js`？实现时选更短路径（倾向单文件 `parse.js` 除非超过 ~200 行再拆）。
