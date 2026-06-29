## Why

`base-type-map.js` 仅被 `type-to-parsed.js` 引用，且内容只有固定映射表与一行查询 helper。单独文件增加了模块数量却没有复用价值，合并到唯一消费者可简化 `src/parser/api/java8/` 目录结构。

## What Changes

- 将 `baseTypeMap` 常量内联到 `src/parser/api/java8/type-to-parsed.js` 顶部（模块内 `const`，不 export）
- 将两处 `resolveBaseType(sig.name)` 改为 `baseTypeMap[sig.name]`
- 删除 `src/parser/api/java8/base-type-map.js`
- 行为与 `API.java8ToApiSchema baseTypeMap` 映射规则保持不变

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `project-structure`：明确 `src/parser/api/java8/` 中 baseTypeMap 内联于 `type-to-parsed.js`，不得保留独立 `base-type-map.js`

## Impact

- **代码**：`src/parser/api/java8/type-to-parsed.js`（内联映射表）、删除 `base-type-map.js`
- **API**：无公共 export 变化
- **Spec**：`openspec/specs/api/spec.md` 中 baseTypeMap 要求不变
