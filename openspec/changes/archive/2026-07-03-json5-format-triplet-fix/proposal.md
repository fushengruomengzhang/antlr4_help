## Why

`json5-format-triplet-anchor` 重构后，实现为通过测试曾错误更新了 `test/resources/expected/json5/fixture.{default,compact,sort-compact}.text`，掩盖了 emit 阶段的多个回归 bug（open 同行注释误归属、末项行尾注释丢失、pretty 排版退化、三引号 opener 注释丢失）。`fixture.default` 与 `fixture.compact` 的黄金基准必须恢复并通过修代码达标；`sortKeys` 下 prefix 注释顺序采纳锚点归属（选项 A），仅 `fixture.sort-compact` 的 expected 允许按新语义更新。

## What Changes

- 恢复 `fixture.default.text` 与 `fixture.compact.text` 至 git HEAD 黄金基准（不可为通过测试而修改）
- 修复 `token-slice.js` / `emit.js`：移除 `openLineComments` 整行贪婪扫描，openRight 仅用 suffix 区间切片
- 修复末项行尾注释（无逗号时仍同行输出 inline）
- 修复 pretty 模式独立排版（value 与行尾注释分行，对齐旧 expected）
- 修复三引号 opener 行注释输出
- 修复空 `{}` / `[]` 在 compact 下被错误展开为多行
- **sortKeys prefix 顺序（选项 A）**：注释跟 key 锚点走；修完 bug 后更新 `fixture.sort-compact.text` 反映锚点归属顺序
- 不修改 `test/resources/expected/out/cases/*` 与其他 expected 子目录

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `json5-format-triplet-anchor`: 明确 emit 切片边界、pretty/compact 排版契约、sortKeys prefix 锚点归属（选项 A）及 expected 更新范围
- `json5-format-ast`: pretty 模式行尾注释排版要求；sort+compact prefix 顺序语义

## Impact

- `src/parser/json5/format/token-slice.js`
- `src/parser/json5/format/emit.js`
- `test/resources/expected/json5/fixture.sort-compact.text`（仅此文件允许 intentional 更新）
- `test/resources/expected/json5/fixture.default.text`、`fixture.compact.text`（恢复后不得再改）
