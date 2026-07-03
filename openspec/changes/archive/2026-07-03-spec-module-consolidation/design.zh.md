## Context

`openspec/specs/` 现有 8 个 capability，其中 JSON5 占 6 个，按 change 历史拆分而非 `src/parser/` 模块结构。`format-ast` 与 `format-triplet-anchor` 大量 requirement 重复。`openspec/changes/archive/` 含 16 个已 sync 的过程 change（368KB）。产品代码与 spec 行为已对齐，本次仅文档重组。

## Goals / Non-Goals

**Goals:**

- 主 spec 按模块目录组织：`json4/`、`json5/`、`test/`
- `json5/spec.md` 合并 6 个旧 capability 的全部 requirement（去重后）
- 删除 8 个旧 capability 目录
- 策略 A：删除 `archive/` 下全部 16 个 change 目录
- `openspec validate --all` 通过

**Non-Goals:**

- 不修改 `src/`、`test/run.mjs` 或 npm 脚本
- 不创建 java8 / api spec（以后再说）
- 不写 archive HISTORY.md（策略 A）
- 不改变任何产品 API 或行为 requirement

## Decisions

### 1. 模块 id 与代码目录对齐

| 新 capability | 对应代码 | 合并来源 |
|---------------|----------|----------|
| `json4` | `src/parser/json/` | `json4-parse-sort-keys` |
| `json5` | `src/parser/json5/` | 6 个 JSON5 capability |
| `test` | `test/resources/` | `test-expected-layout` + `json5-single-format` baseline 路径 |

**理由：** 读 spec 时与代码模块一一对应；未来 change 的 delta 挂模块名即可。

### 2. json5 去重规则

| 重复主题 | 保留策略 |
|----------|----------|
| AnchorTriplet 定义 | 保留 triplet-anchor 版本（更细） |
| build 不存 comment 字符串 | 合并为一 req |
| emit interval slicing | triplet-anchor 为主 |
| 禁止 gap archaeology | triplet-anchor 完整版 |
| Document/container anchors | format-ast 独有 |
| ObjectEntry / ArrayEntry | format-ast 独有 |
| sortKeys 排序 entry | format-ast + triplet 场景合并 |
| Format 输出行为 / indent | format-ast 独有 |
| 性能约束 | format-perf 整节保留 |
| module layout / subpath | module-layout 整节保留 |
| single format | single-format 整节保留 |
| parse sortKeys | parse-sort-keys 整节保留 |

### 3. test spec 以当前仓库为准

旧 `test-expected-layout` 仍引用 `expected/legacy/json5/` 与 `expected/json5format/`；实际目录仅 `test/resources/expected/json5/`（3 个 fixture）。合并时 **以 `json5-single-format` + 实际目录为准** 更新 requirement。

### 4. Archive 策略 A

直接 `rm -rf openspec/changes/archive/2026-07-*`（16 个目录）。历史依赖 git log，不保留 OpenSpec archive 快照。

**备选（未采用）：** 每模块 HISTORY.md — 用户选择策略 A。

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 合并遗漏 requirement | apply 后 `openspec validate --all`；对照旧 8 spec diff |
| test spec 与旧 spec 文字不一致 | 以实际 `test/resources/expected/json5/` 为准 |
| 丢失 archive 设计上下文 | git 历史保留；必要时 `git log openspec/` |
| AGENTS.md 仍引用旧 capability 名 | tasks 含可选更新项 |

## Migration Plan

1. 编写 `openspec/specs/json4/spec.md`、`json5/spec.md`、`test/spec.md`（合并去重）
2. 删除 8 个旧 capability 目录
3. 删除 `openspec/changes/archive/` 下 16 个目录
4. `openspec validate --all`
5. 本 change 自身 archive 时 sync delta → 主 spec（若 apply 已直接写入主 spec，则 archive 前确认无漂移）

**Rollback：** `git checkout openspec/`

## Open Questions

（无 — java8/api 占位已明确推迟）
