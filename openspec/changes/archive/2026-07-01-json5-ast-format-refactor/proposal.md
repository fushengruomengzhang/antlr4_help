## Why

`JSON5.format` 当前在 emit 阶段用 token 区间启发式处理 `sortKeys` 与注释归属（`isNextMemberPurePrefix` 等），导致 `format-emitter.js` 膨胀且难维护。根因是提取维度错误：注释应在 parse/build 阶段按 g4 语义节点归类，而非 emit 时从 HIDDEN channel 反推。本次 refactor 将 format 内部改为 grammar-driven AST 三阶段 pipeline，对外行为与 API 保持不变。

## What Changes

- 新增内部模块 `ast-builder.js`、`ast-transform.js`：从 parse tree + token stream 构建带注释槽位的 Document AST
- 重构 `format-emitter.js` 为 AST emit 路径，删除 sort 相关 token 考古逻辑（`hiddenLeftForSortedMember`、`memberSuffixForSortedMember`、`isNextMemberPurePrefix` 等）
- 注释按 g4 边界锚定：`ObjectEntry` / `ArrayEntry` 含 `before`、`right`、`sep`（COMMA 由 g4 驱动）；容器含 `openRight` / `closeBefore` / `closeRight`；文档含 `before` / `after`
- `sortKeys` 变为对 `entries[]` 稳定排序，整 entry（含 before/right/sep）随 key 移动
- 第一版注释槽位存 raw string；typedef 预留 Comment[] 扩展
- 实施分步：先 ast-builder + 单测，再切换 emit，最后删除旧启发式
- **不新增 public API**；`JSON5.validate` / `JSON5.parse` / `JSON5.format` 签名与对外语义不变

## Capabilities

### New Capabilities

- `json5-format-ast`: JSON5 format 内部 AST 模型、注释归属规则（g4 驱动）、build/transform/emit 三阶段 pipeline 及对外 format 行为契约

### Modified Capabilities

（无。项目尚无 `openspec/specs/` 主 spec；本次为首次将 JSON5 format 行为固化为 spec。）

## Impact

- **代码**：`src/parser/json5/`（新增 `ast-builder.js`、`ast-transform.js`；大幅瘦身 `format-emitter.js`；复用 `value-visitor.js` 的 key/value 解码）
- **API**：无 breaking change；`DEFAULT_FORMAT_OPTIONS` 与 README 描述的行为保持
- **测试**：现有 `test/resources/cases/json5.sort-*.text` 等必须全过；新增 ast-builder 单测
- **语法**：不改 `Json5Parser.g4` / `Json5Lexer.g4`（COMMA 归属以现有 g4 为准）
- **其他产品线**：JSON4 / JAVA8 / API 不受影响
