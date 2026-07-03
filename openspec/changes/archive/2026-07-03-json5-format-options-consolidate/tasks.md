## 1. Consolidate options into format.js

- [x] 1.1 将 `DEFAULT_FORMAT_OPTIONS`、`FormatOptions` / `ResolvedFormatOptions` typedef、`resolveFormatOptions`（原 normalize 逻辑）迁入 `format.js`
- [x] 1.2 删除 `format.js` 对 `normalizeFormatOptions` 的 re-export
- [x] 1.3 `format()` 入口单点 `resolveFormatOptions`，向 transform/emit 传递 resolved

## 2. Update internal pipeline

- [x] 2.1 `ast-transform.js`：入参改为 `ResolvedFormatOptions`，移除 `format-options.js` import 与内部 normalize
- [x] 2.2 `emit.js`：`DocumentEmitter` 与 `emitDocument` 入参改为 `ResolvedFormatOptions`，移除内部 normalize
- [x] 2.3 删除 `src/parser/json5/format/format-options.js`

## 3. Update references and verify

- [x] 3.1 更新 `index.js` JSDoc 中 `FormatOptions` 类型引用路径（`indent` 文档保持 object 形态）
- [x] 3.2 更新 `scripts/bench-json5.mjs` typedef 引用
- [x] 3.3 全库 grep 确认无残留 `format-options` import
- [x] 3.4 `npm test` 全绿；`JSON5.format` 输出与改前一致
