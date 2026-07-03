## Why

`ast-builder.js`、`ast-transform.js` 与纯 JSDoc 的 `types.js` 拆分过细：transform 仅 sortKeys，与 builder 强耦合；`types.js` 无运行时代码。合并并就近放置 typedef 可降低文件数、简化 import，且不改变 format 行为。

## What Changes

- 合并 `ast-builder.js` + `ast-transform.js` → `ast-builder-transform.js`
- 删除 `types.js`；JSDoc typedef 拆到各函数上方（`token-slice.js` 保留坐标类型）
- 新增 `buildAndTransformDocumentAst` 作为 `format.js` 唯一管线入口（C1）
- 保留 `buildDocumentAst`、`transformDocumentAst`（@internal）、`buildObjectEntriesForTest` 供 bench/test（C2，不进入 `index.js`）
- `token-slice.js`、`emit.js` 不动职责，仅更新类型引用路径

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `json5-module-layout`：format 目录文件列表更新（`ast-builder-transform.js` 取代 builder/transform/types）

## Impact

- `src/parser/json5/format/` — 删 3 文件、增 1 文件
- `format.js`、`emit.js`、`token-slice.js`、`bench-json5.mjs`、`test/run.mjs` — import/typedef 路径
- 无公共 API 变更
