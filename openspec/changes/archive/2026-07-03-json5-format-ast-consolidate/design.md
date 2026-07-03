## Context

format 子目录现有 `ast-builder.js`（247 行）、`ast-transform.js`（52 行）、`types.js`（纯 typedef）。用户要求：`token-slice` 不合并；合并文件名为 `ast-builder-transform.js`；typedef 贴函数；对外不暴露 transform。

## Goals / Non-Goals

**Goals:**
- 单文件 `ast-builder-transform.js`：build + transform + AST typedefs（函数上方）
- `format.js` 调用 `buildAndTransformDocumentAst` 一步完成 build+transform
- `token-slice.js` 定义 `TokenCoord` / `AnchorTriplet`（函数上方）
- 删除 `types.js`、`ast-builder.js`、`ast-transform.js`

**Non-Goals:**
- 不改 AST 结构、emit、测试 expected
- 不合并 `token-slice.js`
- 不改 `JSON5.format` 公共签名

## Decisions

### Export 策略（C1 + C2）

| 符号 | export | 消费者 |
|------|--------|--------|
| `buildAndTransformDocumentAst` | ✓ | `format.js` |
| `buildDocumentAst` | ✓ | bench、test |
| `transformDocumentAst` | ✓ @internal | bench 分段 |
| `buildObjectEntriesForTest` | ✓ | test |

### typedef 归属

- `TokenCoord`、`AnchorTriplet` → `token-slice.js`（`toCoord` / `makeTriplet` 上方）
- `DocumentNode`、`ObjectNode`、`ArrayNode`、`ObjectEntry`、`ArrayEntry`、`ValueNode`、`PrimitiveNode`、`Triple*` → `ast-builder-transform.js`（对应 build 函数上方）
- `emit.js` / `test` 通过 `import('./ast-builder-transform.js').Type` 引用，不重复定义

## Migration Plan

1. 创建 `ast-builder-transform.js`（合并内容 + transform + typedefs）
2. 更新 `token-slice.js` typedef
3. 更新 `format.js`、`emit.js`、bench、test
4. 删除旧三文件
5. `npm test`
