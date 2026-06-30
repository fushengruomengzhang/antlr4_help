## 1. ParseError 公开路径

- [x] 1.1 新建 `src/parser/parse-error.js`，re-export `ParseError` from `core/parse-error.js`

## 2. 各产品线 public barrel

- [x] 2.1 新建 `src/parser/json5/index.js`：export `JSON5`、`DEFAULT_FORMAT_OPTIONS`；迁移 JSON5 用法 JSDoc
- [x] 2.2 新建 `src/parser/json/index.js`：export `JSON4`；迁移 JSON4 用法 JSDoc
- [x] 2.3 新建 `src/parser/java8/index.js`：export `JAVA8`；迁移 Java8 用法 JSDoc
- [x] 2.4 新建 `src/parser/api/index.js`：export `API`；迁移 ApiSchema 用法 JSDoc（含 rootClass 默认说明修正）

## 3. 瘦统一入口

- [x] 3.1 重写 `src/index.js` 为仅 re-export 各 package barrel + `ParseError`；移除长篇文档与深层 import

## 4. 验证

- [x] 4.1 `npm test` 全绿
- [x] 4.2 `openspec validate --all` 通过
- [x] 4.3 确认 `src/parser/core/` 无 `index.js` 且 `src/index.js` 不 import `core/*`
