## 1. Create module specs

- [x] 1.1 创建 `openspec/specs/json4/spec.md`（Purpose + 合并自 `json4-parse-sort-keys` 的全部 requirement）
- [x] 1.2 创建 `openspec/specs/json5/spec.md`（Purpose + 按 design.md 去重规则合并 6 个 JSON5 capability）
- [x] 1.3 创建 `openspec/specs/test/spec.md`（Purpose + 以 `expected/json5/` 为准更新 baseline requirement）

## 2. Remove legacy capability specs

- [x] 2.1 删除 `openspec/specs/json4-parse-sort-keys/`
- [x] 2.2 删除 `openspec/specs/json5-module-layout/`
- [x] 2.3 删除 `openspec/specs/json5-single-format/`
- [x] 2.4 删除 `openspec/specs/json5-format-ast/`
- [x] 2.5 删除 `openspec/specs/json5-format-triplet-anchor/`
- [x] 2.6 删除 `openspec/specs/json5-format-perf/`
- [x] 2.7 删除 `openspec/specs/json5-parse-sort-keys/`
- [x] 2.8 删除 `openspec/specs/test-expected-layout/`

## 3. Archive cleanup (策略 A)

- [x] 3.1 删除 `openspec/changes/archive/` 下全部 16 个 `2026-07-*` change 目录
- [x] 3.2 确认 `openspec/changes/` 下无其他 orphan active change 目录

## 4. Validation and docs

- [x] 4.1 运行 `openspec validate --all` 并修复任何失败项
- [x] 4.2 对照旧 8 spec 抽查：无 requirement 遗漏（尤其 format triplet / perf 约束）
- [x] 4.3 若 `AGENTS.md` 提及旧 capability 名，更新为 json4 / json5 / test

## 5. Verification

- [x] 5.1 `openspec list --specs` 仅显示 json4、json5、test 三个 capability
- [x] 5.2 `npm test` 仍全绿（无产品代码变更，预期不变）
