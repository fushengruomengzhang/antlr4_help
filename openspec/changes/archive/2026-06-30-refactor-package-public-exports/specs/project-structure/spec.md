## MODIFIED Requirements

### Requirement: 源码与生成代码目录布局

项目 SHALL 将源码集中于 `src/`：`.g4` 语法源文件与 ANTLR 生成解析器（Lexer/Parser）位于 `src/grammars/`（按语言分子目录）；运行时 API 位于 `src/parser/` 下按语言或能力分子目录（如 `src/parser/json5/` 含 `index.js`（public barrel）、validate/parse/format，`src/parser/json/` 含 `index.js` 与 parse，`src/parser/java8/` 含 `index.js` 与 signatures 等解析 API，`src/parser/api/` 含 `index.js` 与 Model → ApiSchema 转换 API、`src/parser/api/java8/` 含 `java8-to-api-schema.js`、`effective-fields.js`、`type-to-parsed.js` 等模块且 `type-to-parsed.js` MUST 内联 baseTypeMap、MUST NOT 存在独立的 `base-type-map.js`）；共享管线与性能工具位于 `src/parser/core/`（含 `parse-pipeline.js`、`parse-error.js`（实现或 re-export）、`text-buf.js`、`string-decode.js`、`visit-helpers.js`、`error-listener.js`），且 `core/` MUST NOT 提供对外 public barrel（无 `core/index.js`）；公开异常类型 `ParseError` 位于 `src/parser/parse-error.js`；统一入口 `src/index.js` 仅 re-export 各产品线 public barrel，MUST NOT 直接从 `parser/core/` 或各包深层实现文件 import 组装命名空间。

#### Scenario: 语法源文件按语言分目录
- **WHEN** 查看 `src/grammars/`
- **THEN** 存在 `json5/`、`json/`、`java8/` 子目录且各含对应 `.g4` 文件

#### Scenario: 生成代码按语言分目录入库
- **WHEN** 执行代码生成后查看 `src/grammars/`
- **THEN** 存在 `json5/`、`json/`、`java8/` 子目录，各含对应 Lexer/Parser 文件且被 git 跟踪

#### Scenario: 运行时模块存在
- **WHEN** 查看 `src/parser/`
- **THEN** 存在 `core/`、`json5/`、`json/`、`java8/`、`api/` 目录，且各目录含对应运行时 API（不含 `.g4`）

#### Scenario: 各产品线 public barrel 存在
- **WHEN** 查看 `src/parser/json5/`、`json/`、`java8/`、`api/`
- **THEN** 各目录存在 `index.js` 作为对外统一 export 入口

#### Scenario: core 无 public barrel
- **WHEN** 查看 `src/parser/core/`
- **THEN** 不存在 `index.js`

#### Scenario: core 共享性能工具模块存在
- **WHEN** 查看 `src/parser/core/`
- **THEN** 存在 `text-buf.js`、`string-decode.js`、`visit-helpers.js`、`error-listener.js`

#### Scenario: api/java8 baseTypeMap 内联于 type-to-parsed
- **WHEN** 查看 `src/parser/api/java8/`
- **THEN** 存在 `type-to-parsed.js` 且不存在 `base-type-map.js`

## ADDED Requirements

### Requirement: 瘦统一入口 re-export

`src/index.js` SHALL 仅通过 re-export 聚合各产品线 public barrel 与 `ParseError`；SHALL NOT 在文件内直接 import 各包深层实现文件（如 `validate.js`、`parse.js`、`signatures.js`）组装命名空间对象；SHALL NOT 包含各 API 的长篇用法文档（用法 JSDoc 位于各 package `index.js` 或 `parse-error.js`）。

#### Scenario: index 仅 re-export package barrel
- **WHEN** 查看 `src/index.js`
- **THEN** 自 `./parser/json5/index.js`、`./parser/json/index.js`、`./parser/java8/index.js`、`./parser/api/index.js`、`./parser/parse-error.js` re-export，且无 `import ... from './parser/json5/validate.js'` 等深层 import

#### Scenario: index 无长篇 API 文档块
- **WHEN** 查看 `src/index.js` 行数与内容
- **THEN** 文件以 `@module antlr4_help` 简短说明与 export 语句为主，不含 JSON5/JSON4/JAVA8/API 分节用法表格

### Requirement: ParseError 公开路径

公开异常类 `ParseError` SHALL 定义或 re-export 于 `src/parser/parse-error.js`，供 `src/index.js` 与各产品线文档引用。`src/index.js` MUST NOT 自 `parser/core/parse-error.js` 直接 export `ParseError`。

#### Scenario: ParseError 公开模块路径
- **WHEN** 查看 `src/parser/parse-error.js`
- **THEN** 导出 `ParseError` 类且可被 `src/index.js` import

#### Scenario: index 从公开路径导出 ParseError
- **WHEN** 查看 `src/index.js` 的 ParseError import
- **THEN** 来自 `./parser/parse-error.js` 而非 `./parser/core/parse-error.js`
