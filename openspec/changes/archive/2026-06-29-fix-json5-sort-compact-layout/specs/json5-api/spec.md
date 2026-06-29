## MODIFIED Requirements

### Requirement: JSON5 format compact 模式

当 `compact: true` 时，format SHALL 在保留注释锚定规则（与默认模式相同）的前提下输出紧凑布局：容器头注释与 `{`/`[` 同行（若存在）；member 行尾注释与 value 同行；SHALL NOT 在 member 之间插入多余空行。字符串 value（STRING、TRIPLE_DOUBLE_STRING、TRIPLE_SINGLE_STRING）SHALL 保留输入 token 原文形态（含单引号、`'''`、行续接反斜杠），SHALL NOT 应用「JSON5 format 字符串 value 规范」中的引号转换。尾逗号移除、key 形态保留、`indent` 与 `sortKeys` 规则仍适用。当 `sortKeys: true` 与 `compact: true` 同时启用时，member 前缀注释 MUST 经 `hiddenLeft(key)` 锚定；member 后缀（逗号、行尾 inline 注释、换行）MUST 经 `spanBetween(valStop, sourceNextKey)` 收集，其中 `sourceNextKey` 为该 member 在**源码**中的下一项 key（或容器 close），MUST NOT 使用排序后下一项 key 作为区间终点；输出 MUST NOT 重复 emit 同一 member。非末项 member 的行尾 inline 注释（源码形态 `value, // ...`）MUST 与 value 同行输出，且逗号 MUST 位于注释之前（`, // ...`）。当 `sortKeys: true` 与 `compact: true` 同时启用时，compact 布局规则（容器头注释与 `{`/`[` 同行、member 间无多余空行）MUST 仍然适用；容器头注释（位于 `{`/`[` 与源码首个 member key 之间）MUST NOT 因 key 排序而附着到任意 member 的 prefix。

#### Scenario: compact 容器头注释同行
- **WHEN** format 输入 `{ // head\n  a: 1 }` 且 `compact: true`
- **THEN** 输出中 `// head` 与 `{` 在同一行

#### Scenario: compact 行尾注释同行
- **WHEN** format 输入 `{ a: 1, // tail }` 且 `compact: true`
- **THEN** 输出中 `// tail` 与 `a: 1` 在同一行

#### Scenario: compact 保留单引号字符串
- **WHEN** format 输入 `{ msg: 'hello' }` 且 `compact: true`
- **THEN** 输出 value 仍为 `'hello'`

#### Scenario: compact 保留单引号三引号
- **WHEN** format 输入含 `'''line'''` 且 `compact: true`
- **THEN** 输出仍为 `'''...'''` 形态，而非 `"""`

#### Scenario: compact 与 sortKeys 注释锚定
- **WHEN** format 输入 `{ // about b\n b: 1, a: 2 }` 且 `{ compact: true, sortKeys: true }`
- **THEN** `// about b` 仍出现在 `b` member 之前（排序后 `a` 在 `b` 之前）

#### Scenario: compact 与 sortKeys 无重复 member
- **WHEN** format 输入 `{ b: 1, // about b\n a: 2 }` 且 `{ compact: true, sortKeys: true }`
- **THEN** 输出中 `a: 2` 与 `b: 1` 各出现一次，且含 `// about b`

#### Scenario: compact 与 sortKeys 行尾注释逗号在前
- **WHEN** format 输入 `{ "score": 99.5, "age": 18, // 年龄\n "hex": 0xFF }` 且 `{ compact: true, sortKeys: true }`
- **THEN** 输出含 `"age": 18, // 年龄`（同一行，逗号在 `// 年龄` 之前）

#### Scenario: compact 与 sortKeys 容器头注释同行
- **WHEN** format 输入 `{ // head\n b: 1, a: 2 }` 且 `{ compact: true, sortKeys: true }`
- **THEN** 输出含 `{ // head`（`// head` 与 `{` 在同一行）

#### Scenario: compact 与 sortKeys 容器头注释不挂 member
- **WHEN** format 输入 `{ // head\n b: 1, a: 2 }` 且 `{ compact: true, sortKeys: true }`
- **THEN** `// head` MUST NOT 出现在 `b:` 或 `a:` member 行的行首 prefix（独立成行且位于 `{` 之后除外）

#### Scenario: compact 与 sortKeys member 间无空行
- **WHEN** format 输入 `{ b: 1,\n\n a: 2 }` 且 `{ compact: true, sortKeys: true }`
- **THEN** 输出 MUST NOT 含连续两个换行符 `\n\n` 于同一 object 的 member 行之间
