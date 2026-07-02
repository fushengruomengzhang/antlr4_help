## Why

当前测试资源分散在 `golden/`（少量 golden 文件）、`out/`（gitignore 下的运行时快照，含 50+ case 输出与 report JSON）以及脚本内联断言中，职责重叠且难以维护。JSON5Format 与 legacy JSON5 的 fixture 格式化输出没有统一的、可提交的 baseline，导致回归对比依赖临时生成目录。现在 JSON5Format 已稳定，应重组测试架构：用提交的 `expected/` 目录承载 fixture 快照，case 仅保留断言，error case 不进 expected。

## What Changes

- 新增 `test/resources/expected/`，提交 git，取代 fixture 级别的 `out/` 快照与部分 `golden/` 文件
- **BREAKING**：`test/resources/golden/` 迁移后删除；`npm test` 不再运行写 `out/` 快照的 `json5-format-out.mjs`
- `expected/legacy/json5/` 与 `expected/json5format/json5/` 平行存放同一 fixture 的 format 变体（default、compact、sort-compact）
- `cases/` 下 json5 case 仅保留脚本内联断言，不生成 expected 快照
- error case（invalid、triple-unclosed、mismatch）不进 expected
- 新增 `test/expected-diff.mjs` 对比 JSON5Format 输出与 expected；`run.mjs` 对比 legacy 输出与 expected
- 新增 `npm run test:update-expected` 用于有意更新 baseline
- `.gitignore` 移除 `test/resources/out/`（或保留 out 但测试不再写入）

## Capabilities

### New Capabilities

- `test-expected-layout`: 测试资源目录结构、expected baseline 管理、fixture 快照对比与 update 流程

### Modified Capabilities

- （无）本变更仅重组测试基础设施，不改变 `json5-format-ast` 的产品行为要求

## Impact

- `test/run.mjs`：golden 路径改 expected，移除 fixture 写 out
- `test/json5-format-out.mjs`：删除或替换为 `test/expected-diff.mjs`
- `test/json5-format-standalone.mjs`：保持不变（单元/管线断言）
- `package.json`：`test` 与 `test:update-expected` scripts
- `test/resources/golden/`：迁移后删除
- `.gitignore`：更新 out 规则
