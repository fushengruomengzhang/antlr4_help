## Why

`json5.format` 声称保留注释，但当前实现对文档级首尾注释、空容器内注释、以及最后一项与闭合括号之间的注释处理不完整。根因是 `formatDocument` 未处理根 value 外的 HIDDEN token，且 `formatObject`/`formatArray` 将 `TerminalNode`（`LBRACE()` 等）传给需要 `CommonToken.tokenIndex` 的 hidden-token 查询，导致部分锚点静默失效。用户在 `test.json5.text` 上已观察到顶部 2 条与尾部 1 条注释丢失。

## What Changes

- 修复 `FormatEmitter.formatDocument`：在根 value 前后 emit 文档级 HIDDEN 注释
- 修复 `formatObject`/`formatArray` 的 bracket 锚点：使用 `ctx.start`/`ctx.stop`（CommonToken）查询 HIDDEN channel，而非 `ctx.LBRACE()` 等 TerminalNode
- 明确 opening-brace 与首个 member 之间的注释归属策略，避免修复后与非空容器产生重复 emit
- 为上述场景补充 spec scenario 与集成测试断言（或 fixture 对比）

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `json5-api`：扩展「JSON5 format 注释保留与锚定」需求，明确文档级首尾注释、空容器内注释、容器闭合前注释 MUST 保留；补充对应 scenario

## Impact

- **代码**：`src/parser/json5/format-emitter.js`（主要）、可能新增小型 token 归一化辅助
- **测试**：`test/resources/test.json5.text` 对应的 format 输出应保留全部 117 条注释；建议增加针对性单元/集成用例
- **API**：`json5.format` 输出字符串变化（更多注释被保留），属 bug 修复，非 **BREAKING** 语义变更
- **依赖**：无新依赖；不涉及 grammar 或 regenerate
