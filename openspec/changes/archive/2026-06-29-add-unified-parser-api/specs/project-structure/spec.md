## MODIFIED Requirements

### Requirement: 源码与生成代码目录布局

项目 SHALL 将源码集中于 `src/`：`.g4` 语法源文件位于 `src/grammars/`（按语言分子目录，如 `json5/`、`json/`、`java8/`），由语法生成的解析器代码位于 `src/parser/` 下按语言分子目录（如 `src/parser/json5/`）并 MUST 纳入版本控制；运行时模块位于 `src/core/`、`src/json5/`、`src/json/`、`src/java8/`；统一入口位于 `src/index.js`。

#### Scenario: 语法源文件按语言分目录
- **WHEN** 查看 `src/grammars/`
- **THEN** 存在 `json5/`、`json/`、`java8/` 子目录且各含对应 `.g4` 文件

#### Scenario: 生成代码按语言分目录入库
- **WHEN** 执行代码生成后查看 `src/parser/`
- **THEN** 存在 `json5/`、`json/`、`java8/` 子目录，各含对应 Lexer/Parser 文件且被 git 跟踪

#### Scenario: 运行时模块存在
- **WHEN** 查看 `src/`
- **THEN** 存在 `core/`、`json5/`、`json/`、`java8/` 目录及 `index.js` 入口

### Requirement: 可复现的代码生成

项目 SHALL 提供可复现的代码生成方式：`scripts/generate.sh` MUST 调用 `lib/` 下的 ANTLR jar 以 `-Dlanguage=JavaScript` 从 `src/grammars/` 各语言子目录生成解析器到 `src/parser/` 对应子目录，并 SHALL 通过 `npm run generate` 暴露。

#### Scenario: 通过 npm 触发生成
- **WHEN** 运行 `npm run generate`
- **THEN** 脚本调用 `java -jar lib/antlr-4.9.3-complete.jar -Dlanguage=JavaScript` 并在 `src/parser/json5/`、`src/parser/json/`、`src/parser/java8/` 产出对应 Lexer/Parser 文件

### Requirement: 端到端解析流水线

项目 SHALL 提供一条可运行的「语法 → 生成 → 解析」流水线：使用生成的解析器与 `antlr4` 运行时，`node src/index.js` MUST 能调用 json5、json 或 java8 示例 API 并产生可观察的输出而不报错。

#### Scenario: 运行入口完成解析
- **WHEN** 在已 `npm install` 且已生成解析器的前提下运行 `node src/index.js`
- **THEN** 进程成功退出（退出码 0）并打印至少一种语言（json5、json 或 java8）的解析/格式化/签名提取示例结果

## ADDED Requirements

### Requirement: 统一 API 导出入口

`src/index.js` SHALL re-export `json5`、`json`、`java8` 命名空间及 `ParseError`，供外部 `import { json5, json, java8, ParseError } from 'antlr4_help'`（或相对路径）使用。

#### Scenario: 命名空间可导入
- **WHEN** 在 ESM 模块中 `import { json5, json, java8, ParseError } from './src/index.js'`
- **THEN** 四个导出均可访问且 `json5.validate`、`json.parse`、`java8.signatures` 为函数
