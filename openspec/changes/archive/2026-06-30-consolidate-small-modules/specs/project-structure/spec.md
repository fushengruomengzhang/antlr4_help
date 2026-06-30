## MODIFIED Requirements

### Requirement: 源码与生成代码目录布局

项目 SHALL 将源码集中于 `src/`：`.g4` 语法源文件与 ANTLR 生成解析器（Lexer/Parser）位于 `src/grammars/`（按语言分子目录）；运行时 API 位于 `src/parser/` 下按语言或能力分子目录（如 `src/parser/json5/` 含 `index.js`（public barrel）、`value-visitor.js`（validate/parse/visit）、`format-emitter.js`（format + emitter），`src/parser/json/` 含 `index.js` 与 `value-visitor.js`（parse/visit），`src/parser/java8/` 含 `index.js`、`signature-visitor.js`（firstClassName/signatures/extract）、`peek-first-class-name.js` 等，`src/parser/api/` 含 `index.js`（含 snowflakeId）与 `java8/` 转换模块）；共享管线与性能工具位于 `src/parser/core/`（含 `parse-pipeline.js`（含 error listener 与 visitArrayChildren）、`text-buf.js`、`string-decode.js`），且 `core/` MUST NOT 提供对外 public barrel；公开异常类型 `ParseError` 位于 `src/parser/parse-error.js`（含实现）；统一入口 `src/index.js` 仅 re-export 各产品线 public barrel。

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

#### Scenario: 无一行 re-export 占位文件
- **WHEN** 查看 `src/parser/json/`
- **THEN** 不存在 `string-utils.js`；不存在仅含单函数 pipeline wrapper 的 `parse.js`

#### Scenario: core 无 public barrel
- **WHEN** 查看 `src/parser/core/`
- **THEN** 不存在 `index.js`

#### Scenario: core 共享模块存在
- **WHEN** 查看 `src/parser/core/`
- **THEN** 存在 `parse-pipeline.js`、`text-buf.js`、`string-decode.js`；不存在独立的 `parse-error.js`、`error-listener.js`、`visit-helpers.js`

#### Scenario: api/java8 baseTypeMap 内联于 type-to-parsed
- **WHEN** 查看 `src/parser/api/java8/`
- **THEN** 存在 `type-to-parsed.js` 且不存在 `base-type-map.js`
