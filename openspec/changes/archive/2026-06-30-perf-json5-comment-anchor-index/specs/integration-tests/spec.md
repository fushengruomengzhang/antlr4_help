## ADDED Requirements

### Requirement: JSON5 format 锚点索引 golden 回归

集成测试 SHALL 继续以 byte-equal golden 验证全部 format 模式（含 sort+compact 注释 case）。引入注释锚点索引后，现有 golden 文件 MUST NOT 变更语义；任何 golden 更新 MUST 伴随明确的 spec scenario 变更说明。

#### Scenario: sort comment cases byte-equal

- **WHEN** `npm test` 运行 `test/resources/cases/json5.sort-*` 及 `test.json5.text` 相关 format case
- **THEN** 全部通过 golden 或 inline assert，且无 golden 非预期 diff

#### Scenario: format bench 不退化

- **WHEN** 开发者在还原方案 A 并完成索引改造后运行 `node scripts/bench-json5.mjs`
- **THEN** format fixture 耗时 MUST 处于 ~1 ms/op 量级或优于方案 A 的 ~7 ms/op（记录于 change 或 PR 说明，非 CI 门禁）
