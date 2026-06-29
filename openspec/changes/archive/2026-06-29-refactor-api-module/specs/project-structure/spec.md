## MODIFIED Requirements

### Requirement: 源码与生成代码目录布局

项目 SHALL 将源码集中于 `src/`：`.g4` 语法源文件与 ANTLR 生成解析器（Lexer/Parser）位于 `src/grammars/`（按语言分子目录）；运行时 API 位于 `src/parser/` 下按语言或能力分子目录（如 `src/parser/json5/` 含 validate/parse/format，`src/parser/java8/` 含 signatures 等解析 API，`src/parser/api/` 含 Model → ApiSchema 等转换 API）；共享管线位于 `src/parser/core/`；统一入口位于 `src/index.js`。

#### Scenario: 语法源文件按语言分目录

- **WHEN** 查看 `src/grammars/`
- **THEN** 存在 `json5/`、`json/`、`java8/` 子目录且各含对应 `.g4` 文件

#### Scenario: 生成代码按语言分目录入库

- **WHEN** 执行代码生成后查看 `src/grammars/`
- **THEN** 存在 `json5/`、`json/`、`java8/` 子目录，各含对应 Lexer/Parser 文件且被 git 跟踪

#### Scenario: 运行时模块存在

- **WHEN** 查看 `src/parser/`
- **THEN** 存在 `core/`、`json5/`、`json/`、`java8/`、`api/` 目录，且各目录含对应运行时 API（不含 `.g4`）

### Requirement: 统一 API 导出入口

`src/index.js` SHALL re-export `json5`、`json`、`java8`、`api` 命名空间及 `ParseError`，供外部 `import { json5, json, java8, api, ParseError } from 'antlr4_help'`（或相对路径）使用。

#### Scenario: 命名空间可导入

- **WHEN** 在 ESM 模块中 `import { json5, json, java8, api, ParseError } from './src/index.js'`
- **THEN** 五个导出均可访问且 `json5.validate`、`json.parse`、`java8.signatures`、`api.java8ToApiSchema` 为函数
