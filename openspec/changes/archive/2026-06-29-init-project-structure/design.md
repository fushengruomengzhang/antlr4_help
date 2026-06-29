## Context

`antlr4_help` 是一个面向 ANTLR4 学习/参考的仓库，README 已锁定使用 **ANTLR 4.9.3**。当前除文档与 OpenSpec 脚手架外没有任何可运行结构。本设计确定如何用 **Node.js (ESM) + ANTLR 4.9.3** 搭建标准目录与端到端"语法 → 生成 → 解析"流水线。

约束（探索阶段已确认）：
- 运行环境为 Node + JavaScript，模块风格统一 **ESM**。
- 非 npm 依赖（Java 的 ANTLR 生成工具 jar）统一放 `lib/`。
- 源码放 `src/`；由语法生成的解析器代码 `src/parser/` **提交进仓库**。
- 环境已具备 Java 21（运行 jar）与 Node v22 / npm（`antlr4@4.9.3` 运行时存在）。

## Goals / Non-Goals

**Goals:**
- 一套清晰、可复制的目录约定，区分"生成工具依赖（lib）"与"运行时依赖（npm）"。
- clone 后无需安装 Java 即可直接 `node` 运行（因为生成代码已入库、运行时来自 npm）。
- 提供可复现的代码生成脚本，并有一个跑得通的 Hello 示例。

**Non-Goals:**
- 不支持多目标语言（仅 JavaScript/ESM）。
- 不引入打包器/TypeScript/测试框架的复杂配置（保持最小可用）。
- 不实现具体业务语法，仅提供起手示例与约定。

## Decisions

- **模块风格 = ESM**：`package.json` 设 `"type": "module"`，源码用 `import/export`。`antlr4@4.9.3` 为 CommonJS，通过默认导入 `import antlr4 from 'antlr4'` 互操作。
  - 备选：CommonJS（`require`）。更省事，但用户明确要求 ESM，且 ESM 更贴近现代 Node。
- **依赖分层**：Java 生成工具 `antlr-4.9.3-complete.jar` 放 `lib/` 并入库；JS 运行时 `antlr4@4.9.3` 走 npm（`node_modules/` 不入库）。
  - 理由：jar 是构建期工具、版本固定、便于命令行直接生成；npm 运行时可由 `package.json` 复现。
- **生成代码入库**：`src/parser/` 提交进仓库。
  - 理由：clone 即可运行、生成结果可在 PR review；代价是改语法后需重新生成并提交，由 `npm run generate` 辅助。
  - 备选：gitignore 生成目录、运行前按需生成（要求安装 Java，clone 后多一步）。
- **生成命令**：`scripts/generate.sh` 封装 `java -jar lib/antlr-4.9.3-complete.jar -Dlanguage=JavaScript -o src/parser src/grammars/*.g4`（生成 Lexer/Parser/Listener）。
- **目录约定**：`src/grammars/`（`.g4`）、`src/parser/`（生成代码）、`src/index.js`（入口驱动）。

## Risks / Trade-offs

- [生成代码与语法不同步] → 提供 `npm run generate`，并在 README 说明改 `.g4` 后须重新生成并提交；后续可加 CI 校验。
- [ANTLR 4.9.3 生成的 JS 与 ESM 互操作细节] → 入口用默认导入 `import antlr4 from 'antlr4'`；如生成文件本身用 CommonJS，在 ESM 下通过命名约定/包装解决，落地时以实际生成产物为准并验证 `node src/index.js` 跑通。
- [构建期依赖 Java] → 仅生成阶段需要；运行阶段不需要（生成代码已入库），降低使用门槛。
- [固定 4.9.3 版本] → 与 README 声明一致；升级时需同步 jar 与 npm 运行时两处版本。
