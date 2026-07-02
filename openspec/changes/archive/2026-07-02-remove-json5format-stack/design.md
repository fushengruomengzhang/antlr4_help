## Context

当前架构：

```
JSON5.format  ──► format-emitter.js ──► grammars/json5/
JSON5Format   ──► build/transform/emit ──► grammars/json5-format/  ← 待删除
```

测试：`run.mjs`（legacy）+ `json5-format-standalone.mjs` + `expected-diff.mjs` + 双份 expected baseline。

## Goals / Non-Goals

**Goals:**

- 单一 format 实现：`JSON5.format`
- 删除 json5-format 全部源码、grammar、生成物
- 测试与 expected 目录简化
- `npm test` 全绿

**Non-Goals:**

- 重构 `format-emitter.js` 内部实现
- 将 document grammar 概念移植回 legacy
- 修改 validate/parse 行为

## Decisions

### 1. 保留 legacy，整栈删除 JSON5Format

**Rationale:** 更快（小对象）、更少代码、API 已完整；B 未在性能上显著超越 A。

### 2. expected 目录扁平化

```
test/resources/expected/json5/
  fixture.default.text
  fixture.compact.text
  fixture.sort-compact.text
```

删除 `legacy/` 与 `json5format/` 前缀层级。

### 3. standalone 断言迁移

迁入 `run.mjs` 的 legacy 断言（用 `JSON5.format`）：

| 原 standalone 测试 | 迁移方式 |
|-------------------|---------|
| 注释不重复（header / inline） | 新 runCase |
| trailing comma stripped | 新 runCase |
| pretty 三引号 round-trip | 新 runCase |
| compact 空对象 opener comment | 合并到现有 empty-object case 或新 case |
| buildDoc AST 槽位测试 | **不迁移**（JSON5Format 内部细节） |
| 2000-key perf smoke | 移至 bench 或删除（bench 已覆盖） |

### 4. package.json test 脚本

```json
"test": "node test/run.mjs"
"test:update-expected": "node test/update-expected.mjs"
```

### 5. generate.sh

从 `for lang in json5 json5-format json java8` 改为 `json5 json java8`。

## Risks / Trade-offs

- **[BREAKING]** 外部依赖 `JSON5Format` 的代码会失败 → 本仓库为 reference 项目，README 未公开 JSON5Format
- **[Loss]** document grammar 架构作废 → 接受；legacy HIDDEN 考古继续承担 comment 语义
- **[Risk]** 迁移断言遗漏回归 → 对照 standalone 清单逐项勾选

## Migration Plan

1. 迁移 run.mjs 断言
2. 更新 expected 路径与 update-expected.mjs
3. 删除 json5-format 源码与测试文件
4. 清理 index.js、generate.sh、bench、package.json
5. `npm test` 验证

Rollback: git revert（删除前 commit 可恢复）。

## Open Questions

- （无）
