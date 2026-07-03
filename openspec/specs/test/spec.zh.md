# test

## 目的

定义 JSON5 format 测试 baseline 的存放方式、`npm test` 比对方式及维护脚本更新方式。

## 需求

### Requirement: fixture format baseline 存放在 expected 目录

测试套件 SHALL 将已提交的 JSON5 format 输出 baseline 存于 `test/resources/expected/json5/`。仅主 JSON5 fixture（`test/resources/test.json5.text`）SHALL 有 expected 快照。`test/resources/cases/` 下的 case 输入 SHALL NOT 有 expected 快照文件。

#### Scenario: expected 目录结构

- **WHEN** 检出仓库
- **THEN** `test/resources/expected/json5/` SHALL 包含 `fixture.default.text`、`fixture.compact.text`、`fixture.sort-compact.text`
- **AND** `test/resources/expected/` 下 SHALL NOT 存在名为 `json5format` 或 `legacy` 的目录

#### Scenario: case 输入仅使用断言

- **WHEN** 测试针对 `test/resources/cases/` 中的文件运行
- **THEN** 测试 SHALL 使用 inline 断言，且 SHALL NOT 读写该 case 的 expected 快照

#### Scenario: 错误 case 不包含 expected

- **WHEN** case 表示非法输入（如 `json5.invalid.text`、`json5.triple-unclosed.text`、`json5.triple-mismatch.text`）
- **THEN** `test/resources/expected/` 下 SHALL NOT 存在对应文件

---

### Requirement: npm test 将运行时输出与 expected baseline 比对

运行 `npm test` SHALL 将主 fixture 的 `JSON5.format` 输出与 `test/resources/expected/json5/` 比对，且 SHALL NOT 向 `test/resources/out/` 写入快照文件。

#### Scenario: fixture 默认 format

- **WHEN** `npm test` 运行且执行 `JSON5.format(test.json5.text)`
- **THEN** 结果 SHALL 匹配 `expected/json5/fixture.default.text`（规范化后）

#### Scenario: fixture compact format

- **WHEN** `npm test` 运行且执行 `JSON5.format(test.json5.text, { compact: true })`
- **THEN** 结果 SHALL 匹配 `expected/json5/fixture.compact.text`（规范化后）

#### Scenario: fixture sort+compact format

- **WHEN** `npm test` 运行且执行 `JSON5.format(test.json5.text, { sortKeys: true, compact: true })`
- **THEN** 结果 SHALL 匹配 `expected/json5/fixture.sort-compact.text`（规范化后）

#### Scenario: 测试时不写入 out 目录

- **WHEN** `npm test` 成功完成
- **THEN** 测试脚本 SHALL NOT 要求或填充 `test/resources/out/` 以判定通过/失败

---

### Requirement: 可通过 npm 脚本更新 baseline

项目 SHALL 提供 `npm run test:update-expected`（或等效文档化脚本），以从当前 `JSON5.format` 实现 regenerate fixture expected 文件。

#### Scenario: 更新 expected baseline

- **WHEN** 维护者在 intentional format 输出变更后运行 update-expected 脚本
- **THEN** `expected/json5/` 下全部三个 fixture baseline 文件 SHALL 被覆写为当前 formatter 输出

---

### Requirement: test 模块 spec 提供简体中文 mirror 文档

`openspec/specs/test/spec.zh.md` SHALL 完整 mirror `spec.md`（简体中文），并遵循与 json4 文档 requirement 相同的保留规则。

#### Scenario: test mirror 存在

- **WHEN** 检出仓库
- **THEN** `openspec/specs/test/spec.zh.md` SHALL 存在

