## Context

项目测试分三层：

1. **`json5-format-standalone.mjs`** — JSON5Format 管线单元断言（build/emit 行为、smoke）
2. **`json5-format-out.mjs`** — 写 `out/json5format/` 全量快照 + `report.json` + `compare-with-legacy.json`
3. **`run.mjs`** — legacy JSON5/JSON4/Java/API + case 断言，写 `out/` 并对比 `golden/`

Explore 阶段已拍板：fixture format 快照进 `expected/`（提交 git）；case 只断言；error case 不进 expected；legacy 与 JSON5Format 并存。

## Goals / Non-Goals

**Goals:**

- 单一、可提交的 fixture baseline 目录 `test/resources/expected/`
- 测试只读 expected、不写临时快照（除 update 脚本）
- `npm test` 绿 = legacy 与 JSON5Format 各自匹配 expected
- `npm run test:update-expected` 一键刷新 baseline

**Non-Goals:**

- case 级别 expected 快照（仍用内联断言）
- Java/JSON parse.json 进 expected（仍用内联断言）
- byteEqual legacy vs JSON5Format（cosmetic 差异可接受，valueEqual 由 standalone 或可选 diff 覆盖）
- CI 流水线（项目尚无 CI）

## Decisions

### 1. 目录布局

```
test/resources/
├── expected/
│   ├── legacy/json5/
│   │   ├── fixture.default.text
│   │   ├── fixture.compact.text
│   │   └── fixture.sort-compact.text
│   └── json5format/json5/
│       └── （同上 3 文件）
├── cases/          # 不变，仅断言
├── test.json5.text
└── （其他 fixture）
```

**Rationale:** `legacy/` vs `json5format/` 前缀清晰；`json5/` 子目录预留其他语言/format 变体。

**Alternative considered:** 扁平 `expected/fixture.compact.legacy.text` —  rejected，扩展性差。

### 2. 脚本拆分

| 脚本 | 职责 |
|------|------|
| `json5-format-standalone.mjs` | 不变：管线/case smoke 断言 |
| `run.mjs` | legacy fixture format → 对比 `expected/legacy/json5/`；case/API 断言；**不再写 out** |
| `expected-diff.mjs`（新） | JSON5Format fixture format → 对比 `expected/json5format/json5/` |
| `update-expected.mjs`（新） | 生成/覆盖 6 个 baseline 文件 |

**Rationale:** 删除 `json5-format-out.mjs` 的 report/compare/case 快照职责，测试更快、输出更干净。

### 3. golden/ 迁移

- `golden/test.json5.format.compact.text` → `expected/legacy/json5/fixture.compact.text`
- `golden/json5.compact-empty-object-indent.text` → 保留为 `run.mjs` 内联断言（case golden，不进 expected）
- `golden/test.java.api.structure.json` → 保留内联于 `run.mjs`（或迁至 `test/resources/fixtures/`，本次可内联读取同路径后删 golden）

**Rationale:** 仅 fixture format 快照进 expected；结构 JSON 仍断言对比。

### 4. 文本规范化

复用 `run.mjs` 现有 `normalizeFormatText`（折叠连续空行、保证末尾换行）做 expected 对比，避免 CRLF/尾部空白误报。

### 5. out/ 与 .gitignore

测试运行时不再写 `out/`。`.gitignore` 中 `test/resources/out/` 可保留（防本地调试残留）或删除；不影响 CI。

## Risks / Trade-offs

- **[Risk] baseline 与实现耦合** → 仅 3 个 fixture 变体，变更 format 时需显式 `test:update-expected`
- **[Risk] legacy/json5format 双份维护** → 6 个文件可接受；未来可考虑只 commit json5format 并对 legacy 做 valueEqual
- **[Trade-off] 删除 compare-with-legacy.json** → standalone 与历史 explore 已验证 valueEqual；需要时可加可选 verbose flag

## Migration Plan

1. 运行 format 生成 6 个 baseline 写入 `expected/`
2. 更新 `run.mjs`、`expected-diff.mjs`、删除 `json5-format-out.mjs`
3. 迁移/内联 golden 剩余文件，删除 `golden/`
4. 更新 `package.json` scripts
5. 全量 `npm test` 验证

Rollback: 恢复旧脚本与 golden/，删除 expected/。

## Open Questions

- （无）Java API structure JSON 本次内联保留在 run.mjs，路径改为 `test/resources/fixtures/test.java.api.structure.json` 或继续放 cases 旁 — 实施时选最小 diff：暂存 `test/resources/test.java.api.structure.json`。
