## 1. Merge AST modules

- [x] 1.1 创建 `ast-builder-transform.js`（合并 builder + transform + 函数上方 typedef）
- [x] 1.2 新增 `buildAndTransformDocumentAst`；`transformDocumentAst` 标 @internal 仍 export
- [x] 1.3 删除 `ast-builder.js`、`ast-transform.js`、`types.js`

## 2. Update dependents

- [x] 2.1 `token-slice.js`：`TokenCoord` / `AnchorTriplet` typedef 贴函数；引用改本地
- [x] 2.2 `format.js` 改用 `buildAndTransformDocumentAst`
- [x] 2.3 `emit.js`、`test/run.mjs`、`bench-json5.mjs` 更新 import/typedef 路径

## 3. Verify

- [x] 3.1 grep 无残留 `types.js` / `ast-builder.js` / `ast-transform.js` import
- [x] 3.2 `npm test` 全绿
