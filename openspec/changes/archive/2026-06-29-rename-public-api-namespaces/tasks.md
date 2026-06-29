## 1. 公开 API 导出名

- [x] 1.1 更新 `src/index.js`：`export const JSON5` / `JSON4` / `JAVA8` / `API`（移除小写 export）
- [x] 1.2 bump `package.json` version 至 `2.4.0`，更新 description 中的命名空间表述

## 2. 集成测试

- [x] 2.1 更新 `test/run.mjs`：`import { JSON5, JSON4, JAVA8, API, ParseError }` 及全部调用路径
- [x] 2.2 运行 `npm test` 确认全绿

## 3. 文档

- [x] 3.1 更新 `README.md` API 示例与 import 语句（含 `JSON4` 命名说明）
- [x] 3.2 确认 `ParseError.language` 文档仍描述小写 `'json5'`/`'json'`/`'java8'`（不变）

## 4. 收尾

- [x] 4.1 `openspec validate --change rename-public-api-namespaces` 通过
- [x] 4.2 提交 `release: v2.4.0 rename public API namespaces`
