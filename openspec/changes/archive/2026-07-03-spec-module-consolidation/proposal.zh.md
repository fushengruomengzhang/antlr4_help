## Why

OpenSpec 主 spec 按 change 历史拆成 8 个 capability（JSON5 占 6 个），内容与 `src/parser/` 模块结构不对齐，且 format-ast / triplet-anchor 等存在重复 requirement。Archive 保留 16 个完整 change 包（368KB），均为已 sync 进主 spec 的过程快照。需要按代码模块整理为最终一版 spec，并清空 archive（策略 A：历史靠 git）。

## What Changes

- 将 `openspec/specs/` 从 8 个 capability 合并为 **3 个模块 spec**：`json4/`、`json5/`、`test/`
- `json5/spec.md` 合并现有 6 个 JSON5 capability 的全部 requirement（去重后）
- `json4/spec.md` 迁移自 `json4-parse-sort-keys`
- `test/spec.md` 迁移自 `test-expected-layout`
- 删除 8 个旧 capability 目录
- **删除** `openspec/changes/archive/` 下全部 16 个 change 目录（策略 A，不保留 HISTORY.md）
- java8 / api 模块 **暂不** 创建 spec（以后有 change 再说）
- **无产品代码或 API 行为变更** — 仅 OpenSpec 文档重组

## Capabilities

### New Capabilities

- `json4`: JSON4 产品线最终规范（parse + sortKeys）
- `json5`: JSON5 产品线最终规范（module layout、single format、parse sortKeys、format AST/triplet/perf）
- `test`: 测试 baseline 与 expected 目录规范

### Modified Capabilities

（无 — 产品行为不变，旧 capability 整体移除并由新模块 spec 承接）

### Removed Capabilities

- `json4-parse-sort-keys` → 合并进 `json4`
- `json5-module-layout` → 合并进 `json5`
- `json5-single-format` → 合并进 `json5`
- `json5-format-ast` → 合并进 `json5`
- `json5-format-triplet-anchor` → 合并进 `json5`
- `json5-format-perf` → 合并进 `json5`
- `json5-parse-sort-keys` → 合并进 `json5`
- `test-expected-layout` → 合并进 `test`

## Impact

- `openspec/specs/` 目录结构变更；`openspec validate --all` capability id 从 8 变为 3
- `openspec/changes/archive/` 清空
- 可选：更新 `AGENTS.md` 中 OpenSpec capability 描述
- 不影响 `src/`、`test/run.mjs` 或 npm 脚本
