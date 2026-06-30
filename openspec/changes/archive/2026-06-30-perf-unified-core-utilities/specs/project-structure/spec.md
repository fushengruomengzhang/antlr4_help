## MODIFIED Requirements

### Requirement: 源码与生成代码目录布局

项目 SHALL 将源码集中于 `src/`：`.g4` 语法源文件与 ANTLR 生成解析器（Lexer/Parser）位于 `src/grammars/`（按语言分子目录）；运行时 API 位于 `src/parser/` 下按语言或能力分子目录（如 `src/parser/json5/` 含 validate/parse/format，`src/parser/java8/` 含 signatures 等解析 API，`src/parser/api/` 含 Model → ApiSchema 等转换 API，`src/parser/api/java8/` 含 `java8-to-api-schema.js`、`effective-fields.js`、`type-to-parsed.js` 等模块且 `type-to-parsed.js` MUST 内联 baseTypeMap、MUST NOT 存在独立的 `base-type-map.js`）；共享管线与性能工具位于 `src/parser/core/`（含 `parse-pipeline.js`、`parse-error.js`、`text-buf.js`、`string-decode.js`、`visit-helpers.js`、`error-listener.js`）；统一入口位于 `src/index.js`。

#### Scenario: 语法源文件按语言分目录
- **WHEN** 查看 `src/grammars/`
- **THEN** 存在 `json5/`、`json/`、`java8/` 子目录且各含对应 `.g4` 文件

#### Scenario: 生成代码按语言分目录入库
- **WHEN** 执行代码生成后查看 `src/grammars/`
- **THEN** 存在 `json5/`、`json/`、`java8/` 子目录，各含对应 Lexer/Parser 文件且被 git 跟踪

#### Scenario: 运行时模块存在
- **WHEN** 查看 `src/parser/`
- **THEN** 存在 `core/`、`json5/`、`json/`、`java8/`、`api/` 目录，且各目录含对应运行时 API（不含 `.g4`）

#### Scenario: core 共享性能工具模块存在
- **WHEN** 查看 `src/parser/core/`
- **THEN** 存在 `text-buf.js`、`string-decode.js`、`visit-helpers.js`、`error-listener.js`

#### Scenario: api/java8 baseTypeMap 内联于 type-to-parsed
- **WHEN** 查看 `src/parser/api/java8/`
- **THEN** 存在 `type-to-parsed.js` 且不存在 `base-type-map.js`

## ADDED Requirements

### Requirement: 跨语言性能基准脚本

项目 SHALL 在 `scripts/bench-all.mjs` 提供可选的跨语言性能基准脚本，覆盖 JSON4.parse、JSON5 validate/parse/format（含 sort+compact）、JAVA8 signatures/peekFirstClassName、API.java8ToApiSchema 及 synthetic 大 object 场景；SHALL NOT 纳入 `npm test` 或 CI 门禁。MAY 保留现有 `scripts/bench-json5.mjs` 作为 JSON5 子集或由其逻辑复用。

#### Scenario: 跨语言基准脚本可独立运行
- **WHEN** 开发者在仓库根目录执行 `node scripts/bench-all.mjs`
- **THEN** 脚本输出 JSON4 / JSON5 / Java8 / API 各操作的 ms/op 统计并正常退出（code 0）

#### Scenario: 跨语言基准不进 npm test
- **WHEN** 读取 `package.json` 的 `scripts.test`
- **THEN** 其值为 `node test/run.mjs`，不包含 `bench-all`
