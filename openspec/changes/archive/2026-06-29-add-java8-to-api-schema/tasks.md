## 1. Core utilities

- [x] 1.1 实现 `src/parser/core/snowflake-id.js`：`snowflakeId()` 使用 `crypto.randomUUID()`（或等价），进程内保证不重复
- [x] 1.2 实现 `src/parser/java8/base-type-map.js`：导出固定 `baseTypeMap` 与查询 helper

## 2. Type adapter

- [x] 2.1 实现 `src/parser/java8/type-to-parsed.js`：将 `TypeSignature` 转为 `{ kind: 'base'|'object'|'list'|'map', ... }`
- [x] 2.2 覆盖 primitive、class、List、Map 及嵌套泛型场景（与 design 一致）

## 3. API Schema builder

- [x] 3.1 实现 `buildClassMap(fileModels)`：合并多文件顶层 `types[]`，后者覆盖同名
- [x] 3.2 实现 `buildNode`：path 环检测、desc/check、List/Map children、field 过滤
- [x] 3.3 实现 `toApiSchema(inputs, options?)`：归一化 inputs、调用 signatures、解析 rootClass、返回 ApiSchemaNode[]
- [x] 3.4 根类不存在时抛出明确 Error

## 4. Public exports

- [x] 4.1 在 `src/index.js` 导出 `java8.toApiSchema` 与 `snowflakeId`

## 5. Integration tests

- [x] 5.1 添加 `test/resources/golden/test.java.api.structure.json`（无 id/parentId 的结构期望）
- [x] 5.2 在 `test/run.mjs` 添加 `java8 toApiSchema` case：结构 golden、id 唯一性 assert、name/age check assert
- [x] 5.3 运行 `npm test` 确认全部通过

## 6. Validation

- [x] 6.1 运行 `openspec validate --change add-java8-to-api-schema` 确认 change 合法
