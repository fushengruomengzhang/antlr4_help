## 1. 测试迁移与 expected 简化

- [x] 1.1 将 standalone 中有价值的断言迁入 `test/run.mjs`（注释不重复、trailing comma、三引号 round-trip）
- [x] 1.2 将 `expected/legacy/json5/` 移至 `expected/json5/`，删除 `expected/json5format/`
- [x] 1.3 更新 `test/format-expected-utils.mjs` 与 `test/update-expected.mjs`（仅 legacy / JSON5.format）

## 2. 删除 JSON5Format 栈

- [x] 2.1 删除 `src/parser/json5-format/` 目录
- [x] 2.2 删除 `src/grammars/json5-format/` 目录
- [x] 2.3 删除 `test/json5-format-standalone.mjs`、`test/expected-diff.mjs`

## 3. 清理集成点

- [x] 3.1 更新 `src/index.js`：移除 JSON5Format 相关 export 与文档
- [x] 3.2 更新 `scripts/generate.sh`：移除 json5-format 生成目标
- [x] 3.3 更新 `scripts/bench-json5.mjs`：移除 JSON5Format 对比段
- [x] 3.4 更新 `package.json`：`test` 仅 `run.mjs`

## 4. 验证

- [x] 4.1 运行 `npm test` 全量通过
- [x] 4.2 确认仓库内无残留 `JSON5Format` / `json5-format` 生产代码引用（OpenSpec change 文档除外）
