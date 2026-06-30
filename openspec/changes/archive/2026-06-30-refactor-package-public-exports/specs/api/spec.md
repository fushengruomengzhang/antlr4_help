## MODIFIED Requirements

### Requirement: api 命名空间导出

`src/parser/api/index.js` SHALL 定义并 export `API` 命名空间对象（非小写 `api`），至少含 `snowflakeId` 与 `java8ToApiSchema` 两个函数；`src/index.js` SHALL re-export 该 `API`。MUST NOT 在 `JAVA8` 命名空间或顶层 export 中再提供等价函数。

#### Scenario: API 命名空间可导入
- **WHEN** 在 ESM 模块中 `import { API } from './src/index.js'`
- **THEN** `API.snowflakeId` 与 `API.java8ToApiSchema` 均为函数

#### Scenario: API 自 package barrel 定义
- **WHEN** 查看 `src/parser/api/index.js`
- **THEN** 定义 `export const API = { snowflakeId, java8ToApiSchema }`（或等价），且含 `API` / `java8ToApiSchema` 用法 JSDoc
