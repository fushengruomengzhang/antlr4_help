## Why

`antlr4_help` 目前只有一个 README，缺少可运行的项目骨架。需要建立一套基于 **ANTLR 4.9.3 + Node.js (ESM)** 的标准目录结构，使任何人 clone 后能立即定义语法、生成解析器并在 Node 中运行解析，作为学习/参考的起点。

## What Changes

- 新增 Node 项目元数据 `package.json`（`"type": "module"`，依赖 `antlr4@4.9.3`，提供 `generate` / `start` / `test` 脚本）。
- 新增 `lib/` 目录，统一存放非 npm 的依赖：提交 `antlr-4.9.3-complete.jar`（ANTLR 生成工具，需 Java 运行）。
- 新增 `src/` 源码目录：`src/grammars/`（`.g4` 语法源文件）、`src/parser/`（由语法生成的 ESM 解析器，**提交进仓库**）、`src/index.js`（ESM 入口驱动）。
- 新增 `scripts/generate.sh`，封装 `java -jar lib/antlr-4.9.3-complete.jar -Dlanguage=JavaScript` 的代码生成命令。
- 新增 `.gitignore`（忽略 `node_modules/`；**不**忽略 `src/parser/` 与 `lib/*.jar`）。
- 新增起手示例 `Hello.g4` 及对应生成代码，跑通"语法 → 生成 → 解析"端到端流程。
- 更新 `README.md`，补充安装、生成与运行说明。

## Capabilities

### New Capabilities
- `project-structure`: 定义 Node+JS(ESM) 的 ANTLR4 项目目录约定（依赖分层 `lib/` vs npm、源码与生成代码布局、生成代码入库策略），并保证存在一条可运行的"语法→生成→解析"流水线。

### Modified Capabilities
<!-- 无既有 spec 需要修改 -->

## Impact

- 受影响：仓库目录结构、新增 `package.json` 与依赖 `antlr4@4.9.3`。
- 外部依赖：构建期需要 **Java**（运行 ANTLR jar）；运行期仅需 **Node.js**（npm `antlr4` 运行时）。
- 无破坏性变更（全为新增）。
