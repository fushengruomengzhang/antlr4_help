## ADDED Requirements

### Requirement: JSON5 format 性能基准脚本

项目 SHALL 在 `scripts/bench-json5.mjs` 提供可选的 JSON5 format 性能基准脚本，用于手动对比优化前后耗时；SHALL NOT 纳入 `npm test` 或 CI 门禁。

#### Scenario: 基准脚本可独立运行

- **WHEN** 开发者在仓库根目录执行 `node scripts/bench-json5.mjs`
- **THEN** 脚本对 `test/resources/test.json5.text` 及 synthetic 大 object（含 sort+compact）输出各操作的 ms/op 统计并正常退出（code 0）

#### Scenario: 基准脚本不进 npm test

- **WHEN** 读取 `package.json` 的 `scripts.test`
- **THEN** 其值为 `node test/run.mjs`，不包含 `bench-json5`
