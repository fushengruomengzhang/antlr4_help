## 1. Expected baseline 目录

- [x] 1.1 创建 `test/resources/expected/legacy/json5/` 与 `test/resources/expected/json5format/json5/` 目录结构
- [x] 1.2 新增 `test/update-expected.mjs`，生成 6 个 fixture baseline 文件（default、compact、sort-compact × legacy/json5format）
- [x] 1.3 运行 update 脚本写入 baseline 并提交到 expected/

## 2. 测试脚本重组

- [x] 2.1 新增 `test/expected-diff.mjs`：JSON5Format fixture 对比 `expected/json5format/json5/`
- [x] 2.2 重构 `test/run.mjs`：fixture format 对比 `expected/legacy/json5/`，移除 out 写入与 golden 依赖
- [x] 2.3 迁移 `golden/test.java.api.structure.json` 至 `test/resources/test.java.api.structure.json`，删除 `test/json5-format-out.mjs`
- [x] 2.4 删除 `test/resources/golden/` 目录

## 3. 配置与验证

- [x] 3.1 更新 `package.json`：`test` 用 standalone + expected-diff + run；新增 `test:update-expected`
- [x] 3.2 更新 `.gitignore`（expected 不 ignore）
- [x] 3.3 运行 `npm test` 全量验证通过
