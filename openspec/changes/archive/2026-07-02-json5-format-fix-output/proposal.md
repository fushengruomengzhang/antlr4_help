## Why

`JSON5Format.format()` 在与 legacy `JSON5.format` 的对比测试中暴露了多处输出缺陷：注释重复、pretty 三引号不可再解析、空对象 compact 结构错误。这些问题使独立 fast lane 无法作为可靠替代，需在不动 legacy API 的前提下修复。

## What Changes

- 在 `build-document.js` 引入 HIDDEN token 互斥分配，消除 `openRight` / `sep` / `before` 之间的注释重复
- 修复空容器（`{}` / `[]`）的 `closeBefore` 构建，避免将 `}` / `]` 默认通道 token 写入 hidden 槽
- 修复 pretty 模式下三引号字符串 emit，保持 opener/closer 引号风格一致且可再解析
- 补充对比测试断言：注释用例无重复、pretty 三引号可 round-trip、compact 空对象与 legacy 语义一致

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `json5-format-standalone`: 补充输出正确性要求（注释去重、三引号 pretty、空容器 compact）

## Impact

- `src/parser/json5-format/build-document.js` — AST 构建
- `src/parser/json5-format/emit.js` — 三引号 emit
- `test/json5-format-standalone.mjs` — 回归断言
- 不影响 `src/parser/json5/` 与 `JSON5.format` 公共 API
