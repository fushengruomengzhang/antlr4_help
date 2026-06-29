## Why

当前 `json5.format` 默认输出为 canonical pretty-print（结构换行清晰、字符串规范化为双引号/`"""`），注释虽已保留，但布局与 `test/resources/target.json5.format.text` 期望差距大：行尾注释被拆行、容器头注释与 `{` 分行、空行过多。用户需要一种**紧凑且保留源码字符串形态**的格式化模式，同时保持默认行为不变。

## What Changes

- 为 `FormatOptions` 新增 `compact`（boolean，默认 `false`）
- `compact: true` 时：紧凑布局（容器头注释与 `{`/`[` 同行、member 行尾注释与 value 同行、不插入多余空行）、字符串 value 保留输入 token 形态（单引号/`'''`/行续接不强制规范化）
- `compact: false` 时：行为与现有一致（双引号规范化、结构换行清晰）
- `sortKeys`、`indent` 在两种模式下均可用；尾逗号移除规则不变
- 集成测试新增 `format({ compact: true })` 输出，与 `target.json5.format.text` 对齐

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `json5-api`：扩展 `FormatOptions` 与 format 语义，新增 compact 模式需求及 scenario；明确字符串规范 requirement 仅在 `compact: false` 时适用
- `integration-tests`：新增 compact format 输出用例

## Impact

- **代码**：`src/parser/json5/format-emitter.js`（主要）、`format.js` typedef、`test/run.mjs`
- **测试**：新增 `test/resources/out/test.json5.format.compact.text`；金标准 `test/resources/target.json5.format.text`
- **API**：非 **BREAKING**；默认 `compact: false` 保持现有输出
- **依赖**：无 grammar 变更
