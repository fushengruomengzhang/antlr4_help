## Why

`src/index.js` 当前以全小写 `json5`、`json`、`java8`、`api` 导出四条产品线命名空间，与规格/品牌名（JSON5、ANTLR 4 JSON、Java8、API 转换层）不对齐，对外辨识度弱。v2.3.0 刚完成 `api` 模块语义重组，趁消费者迁移窗口一并统一为 **SCREAMING 产品线命名**，避免再次分散改动。

## What Changes

- **BREAKING**：`src/index.js` 公开导出名改为 `JSON5`、`JSON4`、`JAVA8`、`API`（移除小写 `json5`/`json`/`java8`/`api`）
- **BREAKING**：消费者 `import` 与调用路径同步更新（如 `JSON5.parse`、`API.java8ToApiSchema`）
- 各命名空间 **方法签名与行为不变**；`ParseError.language` 仍为 `'json5'` | `'json'` | `'java8'` 小写
- 内部目录 `src/parser/{json5,json,java8,api}/`、fixture 文件名、grammar 规则名 **不变**
- 更新 `test/run.mjs`、`README.md`、`package.json` description 与 OpenSpec 主 spec 中的公开 API 路径表述
- 版本 **BREAKING** bump 至 v2.4.0；不提供旧名兼容别名

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `project-structure`：`src/index.js` 统一导出入口命名更新为 `JSON5`/`JSON4`/`JAVA8`/`API`
- `json5-api`：公开 API 路径 `json5.*` → `JSON5.*`
- `json-api`：公开 API 路径 `json.*` → `JSON4.*`（标准 JSON 解析，命名避开全局 `JSON`）
- `java8-api`：公开 API 路径 `java8.*` → `JAVA8.*`
- `api`：公开 API 路径 `api.*` → `API.*`；对解析层依赖表述改为 `JAVA8.*`
- `integration-tests`：runner import 与用例调用路径同步

## Impact

- **代码**：`src/index.js` export 名；`test/run.mjs` import/调用
- **API**：**BREAKING** v2.4.0——`import { JSON5, JSON4, JAVA8, API, ParseError }`
- **文档**：`README.md` 示例与 `package.json` description
- **Spec**：上述 6 个 capability 的 requirement 路径表述
- **不变**：`src/parser/**` 实现、`ParseError.language` 枚举、golden/fixture 文件名
