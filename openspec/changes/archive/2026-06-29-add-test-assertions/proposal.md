## Why

当前 `test/run.mjs` 以「跑通 + 写 out」为主，几乎无自动断言，`npm test` 失败时仍以 exit 0 退出，无法拦住 JSON5 format 等高频回归（如 `sortKeys+compact` 重复 emit）。需要将集成 runner 升级为带 golden 对比与断言的门禁，同时保留通过用例的可检视 out 输出。

## What Changes

- 扩展 `runCase`：支持 `assert`、`golden`（`test/resources/golden/`）、`expectError` / `assertError`
- 执行语义：**通过才写 out，失败不写 out**，错误仅 stderr 展示；移除失败时写 `*.error.json` sidecar
- 每次 `npm test` 启动前**清空** `test/resources/out/` 目录内容
- 任一用例失败时进程 **exit(1)**；全部通过 exit 0
- 新建 `test/resources/golden/`，迁入 `target.json5.format.text` → `golden/test.json5.format.compact.text`
- 新增小 fixture 与用例：JSON5 invalid（expectError）、sort+compact 无重复 member（assert）
- `json5 format (compact)` 用例增加 golden 对比
- `.gitignore` 加入 `test/resources/out/`；从 git 移除已提交的 out 生成物
- 现有 8 个集成用例保留，通过即写 out（行为与现有一致，增加清空与退出码）

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `integration-tests`: runner 断言语义、golden 目录、out 清空/写入策略、退出码、错误处理、新用例与 gitignore

## Impact

- **代码**：`test/run.mjs`（主要重构）
- **资源**：`test/resources/golden/`（新建）、`test/resources/cases/`（小 fixture）、删除/忽略 `test/resources/out/`
- **配置**：`.gitignore`
- **API**：无变更
- **依赖**：无新依赖
