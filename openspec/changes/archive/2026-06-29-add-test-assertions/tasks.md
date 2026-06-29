## 1. 资源与 gitignore

- [x] 1.1 创建 `test/resources/golden/`，将 `target.json5.format.text` 迁入 `golden/test.json5.format.compact.text` 并删除原文件
- [x] 1.2 创建 `test/resources/cases/json5.sort-compact.text` 与 `cases/json5.invalid.text`
- [x] 1.3 `.gitignore` 添加 `test/resources/out/`；`git rm --cached` 已跟踪的 out 文件

## 2. runCase 基础设施

- [x] 2.1 启动时 `mkdirSync` + 清空 `out/` 目录内所有文件
- [x] 2.2 重构 `runCase`：支持 `assert`、`golden`、`normalize`、`expectError`、`assertError`；通过才写 out
- [x] 2.3 实现 `normalizeFormatText` 与 golden diff 错误报告（stderr 首处差异）
- [x] 2.4 移除 `errorName` / `writeError` sidecar；汇总 `failed`，末尾 `process.exit(failed ? 1 : 0)`

## 3. 用例更新与新增

- [x] 3.1 现有 8 用例迁移到新 `runCase`（json parse 的 `result["1"]` 抽为 `assert`）
- [x] 3.2 `json5 format (compact)` 接入 golden `test.json5.format.compact.text`
- [x] 3.3 新增 `json5 sort+compact` 小用例（assert 无重复 member、保留注释）
- [x] 3.4 新增 `json5 validate (invalid)` expectError 用例

## 4. 验证

- [x] 4.1 `npm test` 全绿且 exit 0；故意破坏 golden 时 exit 1 且 out 无对应文件
- [x] 4.2 `openspec validate --all`
