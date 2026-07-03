## Why

主 spec 与 archive artifact 均为英文 normative 正文（`spec.md`），团队阅读与 AI 中文上下文不便。需要为每个模块 spec 及 archive 文档提供完整中文 mirror，同时保留 `WHEN`/`THEN`/`SHALL` 等英文关键字与代码字面量不变。

## What Changes

- 为 `openspec/specs/{json4,json5,test}/` 各新增 `spec.zh.md`（与 `spec.md` 一一对应、全量翻译）
- 为 `openspec/changes/archive/2026-07-03-spec-module-consolidation/` 各 artifact 新增 `.zh.md`（`proposal` 已是中文则复制/润色为 `proposal.zh.md`）
- 在 `openspec/config.yaml` 的 `context` 中约定：未来 change 更新 `spec.md` 时同步更新 `spec.zh.md`
- **无产品代码或 API 行为变更** — 仅文档 i18n

## Capabilities

### New Capabilities

（无 — 不新增产品线 capability）

### Modified Capabilities

- `json4`：新增文档要求 — 必须存在与 `spec.md` 对齐的 `spec.zh.md`
- `json5`：同上
- `test`：同上

## Impact

- `openspec validate --all` 仍只校验 `spec.md`（英文 authoritative）
- 双轨维护：`spec.md` 变更时需同步 `spec.zh.md`
- 不影响 `src/` 或测试
