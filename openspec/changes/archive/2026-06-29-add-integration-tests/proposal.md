## Why

项目已有 json5、json、java8 三套解析 API 和 `test/resources/` 下的 fixture 文件，但缺少可重复运行的集成验证方式。需要一条 `npm test` 命令，读取 fixture、调用各 API，并将结果写入 `test/resources/out/` 供人工检查，避免每次手动跑 demo 或临时脚本。

## What Changes

- 新增 `test/run.mjs` 集成 runner：读取 `test/resources/*.text`，调用 `json` / `json5` / `java8` API，将输出写入 `test/resources/out/`
- 填充 `test/resources/test.json.text` 为标准 JSON fixture（当前为空）
- json5 覆盖：`validate`、`parse`、`format`（默认）、`format({ sortKeys: true })`
- json 覆盖：`parse`
- java8 覆盖：`firstClassName`、`signatures`
- 将 `test/resources/out/` 加入 `.gitignore`（生成物不进 git）
- 更新 `package.json` 的 `"test"` 脚本为 `node test/run.mjs`（`npm start` 仍跑 demo）

## Capabilities

### New Capabilities

- `integration-tests`: 基于 fixture 文件的集成 runner，按约定路径读写输入/输出，无断言框架依赖

### Modified Capabilities

（无——解析 API 行为不变，仅新增测试基础设施）

## Impact

- **新增**: `test/run.mjs`、`test/resources/test.json.text`（内容）
- **修改**: `package.json`（`test` 脚本）、`.gitignore`
- **运行时生成**: `test/resources/out/`（7 个输出文件，不提交）
- **无 breaking change**: 公开 API（`src/index.js`）不变
