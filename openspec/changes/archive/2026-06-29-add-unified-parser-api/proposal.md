## Why

项目已初始化 json5、json、java8 三套 ANTLR 语法，但缺少统一的「字符串 → AST → 目标」运行时 API。调用方需要在 Node.js 中快速验证 JSON5、解析 JSON、提取 Java8 类签名，且三类操作应共享一致的错误格式与解析管线。现在补齐这层能力，才能将语法资产转化为可复用的库。

## What Changes

- 新增统一解析管线（Lexer → Parser → 错误收集），三种语言共享 `ParseError { line, column, msg }` 异常形状
- 新增 **json5** API：`validate()`、`parse()`（→ JS object）、`format()`（布局规范化 + 注释锚定保留）
- 新增 **json** API：`parse()`（100% ANTLR，→ plain object）
- 新增 **java8** API：`firstClassName()`、`signatures()`（完整文件、浅 Visitor、仅 own members）
- 修正 `scripts/generate.sh` 以支持 `src/grammars/*/` 子目录，生成物输出到 `src/parser/{json5,json,java8}/`
- 新增 `src/core/`、`src/json5/`、`src/json/`、`src/java8/` 模块及统一入口 `src/index.js`
- **BREAKING**：移除/替换原 Hello 示例入口（若存在），`npm start` 改为演示新 API 或提供用法示例

## Capabilities

### New Capabilities

- `parse-pipeline`: 统一 Lexer/Parser 驱动、错误监听与 `ParseError` 异常
- `json5-api`: JSON5 验证、解析为对象、可配置格式化（含注释保留与 key 排序）
- `json-api`: JSON 字符串 ANTLR 解析为 plain object
- `java8-api`: Java8 完整文件解析，提取首个类名与签名模型（own members + nested 类型树）

### Modified Capabilities

- `project-structure`: 目录布局扩展（`src/core/`、按语言分子目录的 `src/parser/`）；`generate.sh` 与入口职责变更

## Impact

- **代码**：`scripts/generate.sh`、`src/index.js`（新建）、`src/core/`、`src/json5/`、`src/json/`、`src/java8/`、`src/parser/`（三套生成物）
- **API**：对外导出 json5 / json / java8 命名空间及统一 `ParseError`
- **依赖**：无新 npm 依赖；仍使用 `antlr4@4.9.3` 与现有 `.g4` 语法
- **构建**：修改语法或生成脚本后须 `npm run generate` 并提交 `src/parser/`
