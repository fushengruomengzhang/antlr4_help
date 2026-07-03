## Context

`openspec/specs/` 现有 3 模块 × `spec.md`（英文）。Archive 仅余 `2026-07-03-spec-module-consolidation`。OpenSpec CLI 不认 `spec.zh.md`。

## Goals / Non-Goals

**Goals:**

- 每个 `spec.md` 旁有全量 `spec.zh.md`
- Archive 内 `proposal.md`、`design.md`、`tasks.md` 及 delta `specs/*/spec.md` 均有 `.zh.md`
- 保留英文 normative 关键字：`Requirement`、`Scenario`、`WHEN`、`THEN`、`AND`、`SHALL`、`MUST`、`MAY`、`NOT`
- 代码、路径、API 名、标识符保持英文

**Non-Goals:**

- 不修改 `spec.md` 英文正文
- 不让 `openspec validate` 解析中文文件
- 不翻译 `src/` JSDoc（本次 scope 仅 openspec）

## Decisions

### 1. 文件命名：`spec.zh.md` 并列

```
openspec/specs/json5/
├── spec.md      ← authoritative（validate）
└── spec.zh.md   ← 中文 mirror（人类/AI 阅读）
```

Archive：`proposal.zh.md`、`design.zh.md`、`tasks.zh.md`、`specs/json5/spec.zh.md` 等。

### 2. 翻译粒度（粒度 2）

| 元素 | 处理 |
|------|------|
| `## Purpose` | 改为 `## 目的`，正文中文 |
| `### Requirement:` | 保留前缀，标题中文 |
| `#### Scenario:` | 保留前缀，标题中文 |
| Requirement 正文 | 中文，保留 `SHALL`/`NOT` 等 |
| `- **WHEN**` 行 | 关键字英文，描述中文；代码原样 |
| `- **THEN**` / `- **AND**` | 同上 |

### 3. 权威性与同步

- **Authoritative：** `spec.md`（英文）
- **Mirror：** `spec.zh.md` — 语义等价，非独立演化
- 在 `openspec/config.yaml` `context` 追加维护约定

### 4. Archive

- `proposal.md` 已中文 → `proposal.zh.md` 与之间对齐（可相同或润色）
- `design.md` 中英混合 → `design.zh.md` 统一中文
- delta specs 全译

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 双轨漂移 | config context + change tasks 提醒 sync |
| json5 体积大（~540 行） | 一次性全量；后续按模块 diff |

## Migration Plan

1. 编写 3 个主 spec.zh.md
2. 编写 archive 下全部 .zh.md
3. 更新 config.yaml context
4. `openspec validate --all` 仍 3/3

## Open Questions

（无）
