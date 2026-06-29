## 1. 目录迁移

- [x] 1.1 创建 `src/parser/api/java8/` 目录结构
- [x] 1.2 将 `src/parser/core/snowflake-id.js` 迁至 `src/parser/api/snowflake-id.js`
- [x] 1.3 将 `to-api-schema.js`、`effective-fields.js`、`type-to-parsed.js`、`base-type-map.js` 从 `src/parser/java8/` 迁至 `src/parser/api/java8/`
- [x] 1.4 重命名入口文件为 `java8-to-api-schema.js`，导出函数改名为 `java8ToApiSchema`，错误前缀同步更新
- [x] 1.5 更新 `api/java8/` 内全部 import 路径（指向 `../../java8/`、`../snowflake-id.js` 等）
- [x] 1.6 删除 `src/parser/java8/` 下已迁出文件及 `src/parser/core/snowflake-id.js`

## 2. 公开 API

- [x] 2.1 更新 `src/index.js`：新增 `export const api = { snowflakeId, java8ToApiSchema }`；从 `java8` 移除 `toApiSchema`；移除顶层 `snowflakeId` export
- [x] 2.2 全库 grep 确认无残留 `java8.toApiSchema`、顶层 `snowflakeId`、`parser/core/snowflake-id` 引用

## 3. 测试与文档

- [x] 3.1 更新 `test/run.mjs`：import `api`，case 名与调用改为 `api.java8ToApiSchema`
- [x] 3.2 更新 `README.md` 示例（若有 toApiSchema / snowflakeId 引用）
- [x] 3.3 运行 `npm test`，确认 15/15 通过且 golden 不变

## 4. 验证与版本

- [x] 4.1 运行 `openspec validate --change refactor-api-module`
- [x] 4.2 bump `package.json` / `package-lock.json` 至 **v2.3.0**
