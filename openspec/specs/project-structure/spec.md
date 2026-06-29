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

项目 SHALL 将源码集中于 `src/`：`.g4` 语法源文件位于 `src/grammars/`，由语法生成的解析器代码位于 `src/parser/` 并 MUST 纳入版本控制，入口驱动位于 `src/index.js`。

#### Scenario: 语法源文件位置
- **WHEN** 查看 `src/grammars/`
- **THEN** 存在至少一个 `.g4` 文件（起手示例 `Hello.g4`）

#### Scenario: 生成代码入库
- **WHEN** 执行代码生成后查看 `src/parser/`
- **THEN** 生成的 Lexer/Parser 文件存在且被 git 跟踪（不在 `.gitignore` 中）

### Requirement: ESM 模块风格

项目 SHALL 使用 ESM 模块风格：`package.json` MUST 设置 `"type": "module"`，源码 MUST 使用 `import`/`export`；对 CommonJS 的 `antlr4` 运行时 MUST 通过默认导入互操作。

#### Scenario: 声明为 ESM
- **WHEN** 读取 `package.json`
- **THEN** 字段 `"type"` 的值为 `"module"`

#### Scenario: 入口使用 ESM 导入运行时
- **WHEN** 查看 `src/index.js`
- **THEN** 通过 `import antlr4 from 'antlr4'` 形式导入运行时

### Requirement: 可复现的代码生成

项目 SHALL 提供可复现的代码生成方式：`scripts/generate.sh` MUST 调用 `lib/` 下的 ANTLR jar 以 `-Dlanguage=JavaScript` 从 `src/grammars/` 生成解析器到 `src/parser/`，并 SHALL 通过 `npm run generate` 暴露。

#### Scenario: 通过 npm 触发生成
- **WHEN** 运行 `npm run generate`
- **THEN** 脚本调用 `java -jar lib/antlr-4.9.3-complete.jar -Dlanguage=JavaScript` 并在 `src/parser/` 产出对应语法的 Lexer/Parser 文件

### Requirement: 端到端解析流水线

项目 SHALL 提供一条可运行的"语法 → 生成 → 解析"流水线：使用生成的解析器与 `antlr4` 运行时，`node src/index.js` MUST 能解析示例输入并产生可观察的输出而不报错。

#### Scenario: 运行入口完成解析
- **WHEN** 在已 `npm install` 且已生成解析器的前提下运行 `node src/index.js`
- **THEN** 进程成功退出（退出码 0）并打印示例输入的解析/遍历结果

