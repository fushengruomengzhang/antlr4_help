# project-structure Specification

## Purpose
定义 antlr4_help 项目的目录结构与依赖约定：基于 Node.js (ESM) + ANTLR 4.9.3，区分构建期 Java 工具依赖（`lib/`）与运行期 npm 依赖，规定源码/生成代码布局及"语法 → 生成 → 解析"流水线。
## Requirements
### Requirement: 依赖分层放置

项目 SHALL 将"非 npm 的构建工具依赖"与"npm 运行时依赖"分层管理：ANTLR 生成工具 jar MUST 存放于 `lib/` 并纳入版本控制；JavaScript 运行时 MUST 通过 npm（`antlr4@4.9.3`）声明于 `package.json`，且 `node_modules/` MUST NOT 纳入版本控制。

#### Scenario: ANTLR 工具 jar 位于 lib 且入库
- **WHEN** 查看仓库 `lib/` 目录
- **THEN** 存在 `antlr-4.9.3-complete.jar` 且被 git 跟踪

#### Scenario: 运行时依赖经由 npm 声明
- **WHEN** 读取 `package.json` 的 `dependencies`
- **THEN** 包含 `antlr4`，版本为 `4.9.3`

#### Scenario: node_modules 被忽略
- **WHEN** 查看 `.gitignore`
- **THEN** 其中包含 `node_modules/`，且 `node_modules/` 未被 git 跟踪

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

### Requirement: ESM 模块风格

项目 SHALL 使用 ESM 模块风格：`package.json` MUST 设置 `"type": "module"`，源码 MUST 使用 `import`/`export`；对 CommonJS 的 `antlr4` 运行时 MUST 通过默认导入互操作。

#### Scenario: 声明为 ESM
- **WHEN** 读取 `package.json`
- **THEN** 字段 `"type"` 的值为 `"module"`

#### Scenario: 入口使用 ESM 导入运行时
- **WHEN** 查看 `src/index.js`
- **THEN** 通过 `import antlr4 from 'antlr4'` 形式导入运行时

### Requirement: 可复现的代码生成

项目 SHALL 提供可复现的代码生成方式：`scripts/generate.sh` MUST 调用 `lib/` 下的 ANTLR jar 以 `-Dlanguage=JavaScript` 从 `src/grammars/` 各语言子目录生成解析器到同目录，并 SHALL 通过 `npm run generate` 暴露。

#### Scenario: 通过 npm 触发生成
- **WHEN** 运行 `npm run generate`
- **THEN** 脚本调用 `java -jar lib/antlr-4.9.3-complete.jar -Dlanguage=JavaScript` 并在 `src/grammars/json5/`、`src/grammars/json/`、`src/grammars/java8/` 产出对应 Lexer/Parser 文件

### Requirement: 端到端解析流水线

项目 SHALL 提供一条可运行的「语法 → 生成 → 解析」流水线：使用生成的解析器与 `antlr4` 运行时，`node src/index.js` MUST 能调用 JSON5、JSON4 或 JAVA8 示例 API 并产生可观察的输出而不报错。

#### Scenario: 运行入口完成解析
- **WHEN** 在已 `npm install` 且已生成解析器的前提下运行 `node src/index.js`
- **THEN** 进程成功退出（退出码 0）并打印至少一种语言（JSON5、JSON4 或 JAVA8）的解析/格式化/签名提取示例结果

### Requirement: 统一 API 导出入口

`src/index.js` SHALL re-export `JSON5`、`JSON4`、`JAVA8`、`API` 命名空间及 `ParseError`，供外部 `import { JSON5, JSON4, JAVA8, API, ParseError } from 'antlr4_help'`（或相对路径）使用。MUST NOT 再 export 小写 `json5`、`json`、`java8`、`api`。

#### Scenario: 命名空间可导入
- **WHEN** 在 ESM 模块中 `import { JSON5, JSON4, JAVA8, API, ParseError } from './src/index.js'`
- **THEN** 五个导出均可访问且 `JSON5.validate`、`JSON4.parse`、`JAVA8.signatures`、`API.java8ToApiSchema` 为函数

### Requirement: JSON5 format 性能基准脚本

项目 SHALL 在 `scripts/bench-json5.mjs` 提供可选的 JSON5 format 性能基准脚本，用于手动对比优化前后耗时；SHALL NOT 纳入 `npm test` 或 CI 门禁。

#### Scenario: 基准脚本可独立运行

- **WHEN** 开发者在仓库根目录执行 `node scripts/bench-json5.mjs`
- **THEN** 脚本对 `test/resources/test.json5.text` 及 synthetic 大 object（含 sort+compact）输出各操作的 ms/op 统计并正常退出（code 0）

#### Scenario: 基准脚本不进 npm test

- **WHEN** 读取 `package.json` 的 `scripts.test`
- **THEN** 其值为 `node test/run.mjs`，不包含 `bench-json5`

### Requirement: 跨语言性能基准脚本

项目 SHALL 在 `scripts/bench-all.mjs` 提供可选的跨语言性能基准脚本，覆盖 JSON4.parse、JSON5 validate/parse/format（含 sort+compact）、JAVA8 signatures/peekFirstClassName、API.java8ToApiSchema 及 synthetic 大 object 场景；SHALL NOT 纳入 `npm test` 或 CI 门禁。MAY 保留现有 `scripts/bench-json5.mjs` 作为 JSON5 子集或由其逻辑复用。

#### Scenario: 跨语言基准脚本可独立运行
- **WHEN** 开发者在仓库根目录执行 `node scripts/bench-all.mjs`
- **THEN** 脚本输出 JSON4 / JSON5 / Java8 / API 各操作的 ms/op 统计并正常退出（code 0）

#### Scenario: 跨语言基准不进 npm test
- **WHEN** 读取 `package.json` 的 `scripts.test`
- **THEN** 其值为 `node test/run.mjs`，不包含 `bench-all`

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
