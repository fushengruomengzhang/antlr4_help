## Context

`test/run.mjs` 当前对 3 个大 fixture 跑 8 个 API 调用，结果写入 `test/resources/out/`，几乎无断言，失败时仍 exit 0。`target.json5.format.text` 作为 compact 金标准存在但未接入 runner。近期 JSON5 format 多次回归（注释锚定、sortKeys+compact）表明需要自动化门禁。

约束：不引入外部测试框架（保持 `node test/run.mjs`）；公开 API 不变；无 Java 依赖。

## Goals / Non-Goals

**Goals:**

- `runCase` 支持 `assert`、`golden`、`expectError` / `assertError`
- 通过才写 out；失败不写 out，stderr 展示错误
- 每次运行前清空 `out/` 内容
- `golden/` 统一管理期望输出；compact format 接入 golden 对比
- 新增小用例锁住 sort+compact 与 invalid json5
- 失败时 `process.exit(1)`

**Non-Goals:**

- 引入 vitest/jest/tap 等框架
- 为所有 8 个现有用例立即加 golden（除 compact 外暂用「跑通即写 out」）
- `--keep-failed-out` 调试开关（可后续加）
- Java8 signatures 全量 golden（可后续加）

## Decisions

### 1. `runCase` 生命周期

```
清空 out → fn() → 校验(golden/assert/expectError) → pass: write out / fail: stderr only
```

- **为何先校验再写**：失败时不落盘，out 仅含本次已通过快照
- **备选**：先写再校验 — 被拒绝（与用户「失败不写 out」一致）

### 2. Golden 路径约定

- 目录：`test/resources/golden/`
- 默认映射：`golden` 选项缺省时 `golden/${outputName}`（与 out 文件名镜像）
- 对比前对文本结果应用 `normalizeFormatText`（统一尾换行、合并连续空行、不 trim 行内内容）

```javascript
function normalizeFormatText(text) {
  return text.replace(/\n{2,}/g, '\n').replace(/\n?$/, '\n');
}
```

- **为何归一化**：避免尾换行/空行导致脆弱失败；out 仍写原始结果

### 3. 启动时清空 out

```javascript
mkdirSync(outDir, { recursive: true });
for (const entry of readdirSync(outDir)) {
  unlinkSync(join(outDir, entry)); // 仅删文件，不递归子目录
}
```

- out 仅含扁平文件，无子目录

### 4. 错误处理

- 移除 `errorName` / `writeError` sidecar
- `expectError` 用例无 `outputName`，通过即 ✓，不写 out
- 非预期抛错：catch → stderr → failed++，不写 out

### 5. 新用例

| 标签 | fixture | 校验 |
|------|---------|------|
| json5 format (compact) | test.json5.text | golden `test.json5.format.compact.text` |
| json5 sort+compact | cases/json5.sort-compact.text | assert：无重复 member |
| json5 validate (invalid) | cases/json5.invalid.text | expectError, language=json5 |

sort-compact fixture 内容：`{ b: 1, // about b\n a: 2 }`

### 6. gitignore 与仓库清理

- `.gitignore` 添加 `test/resources/out/`
- `git rm --cached test/resources/out/*` 移除已跟踪生成物
- `golden/` 与 `cases/` 入库；`target.json5.format.text` 删除（已迁入 golden）

### 7. json parse 断言

- 将内联 `result["1"]` 检查抽为 `assert` 选项，与其他用例一致

## Risks / Trade-offs

- **[Golden 失败无 out 难 diff]** → stderr 打印首处行 diff（expected vs actual 摘要）
- **[normalize 掩盖真实差异]** → 仅用于 golden 对比，out 写原始值；规则写入 design 可审计
- **[部分失败 out 缺文件]** → 文档说明：缺文件 = 该用例本次未通过
- **[已提交 out 移除]** → 开发者需跑 `npm test` 本地生成 out 检视

## Migration Plan

1. 创建 `golden/`、`cases/`，迁移 target
2. 重构 `runCase`，更新现有用例
3. 更新 `.gitignore`，`git rm --cached` out
4. 跑 `npm test` 验证全绿
5. 归档时 sync `integration-tests` spec

## Open Questions

（无）
