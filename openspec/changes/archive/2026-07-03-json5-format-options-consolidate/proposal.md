## Why

`format-options.js` 与 `format.js` 职责重叠：`normalizeFormatOptions` 在 `ast-transform` 与 `emit` 中各调用一次，选项边界不清晰。将选项解析收拢到公共入口 `format.js`，内部管线只接收已解析的最终 options，可简化依赖并消除重复 normalize。

## What Changes

- 删除 `src/parser/json5/format/format-options.js`
- 将 `DEFAULT_FORMAT_OPTIONS` 与内部 `resolveFormatOptions`（现 `normalizeFormatOptions`）迁入 `src/parser/json5/format.js`
- `format()` 在入口**唯一一次**解析 options，向 `transformDocumentAst` / `emitDocument` 传递 **Resolved** options
- `ast-transform.js`、`emit.js` 移除对 `format-options.js` 的 import，不再自行 normalize
- **不**对外 export `normalizeFormatOptions` / `resolveFormatOptions`（仅 `DEFAULT_FORMAT_OPTIONS` 与 `format` 保持公开）
- **`indent` 保持现有 object 形态** `{ type: 'space' | 'tab', size?: number }`，本次不改公共 `FormatOptions` 字段形状

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `json5-module-layout`：明确 `format/` 子目录不再包含 `format-options.js`；选项默认值与解析逻辑归属 `format.js` 门面

## Impact

- `src/parser/json5/format.js` — 新增选项类型与 resolve 逻辑
- `src/parser/json5/format/ast-transform.js`、`emit.js` — 签名改为接收 Resolved options
- `src/parser/json5/index.js` — JSDoc 类型引用路径更新（`indent` 文档保持 object 形态）
- `scripts/bench-json5.mjs` — typedef 引用路径更新
- 删除 `format/format-options.js`
- 对外 `JSON5.format` 行为与 `DEFAULT_FORMAT_OPTIONS` 不变；无 **BREAKING** 公共 API 变更（`normalizeFormatOptions` 从未在 `index.js` 公开导出）
