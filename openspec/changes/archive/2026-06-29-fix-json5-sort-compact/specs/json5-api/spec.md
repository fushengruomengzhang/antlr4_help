## MODIFIED Requirements

### Requirement: JSON5 format compact 模式

当 `compact: true` 时，format SHALL 在保留注释锚定规则（与默认模式相同）的前提下输出紧凑布局：容器头注释与 `{`/`[` 同行（若存在）；member 行尾注释与 value 同行；SHALL NOT 在 member 之间插入多余空行。字符串 value（STRING、TRIPLE_DOUBLE_STRING、TRIPLE_SINGLE_STRING）SHALL 保留输入 token 原文形态（含单引号、`'''`、行续接反斜杠），SHALL NOT 应用「JSON5 format 字符串 value 规范」中的引号转换。尾逗号移除、key 形态保留、`indent` 与 `sortKeys` 规则仍适用。当 `sortKeys: true` 与 `compact: true` 同时启用时，member 的 hidden token MUST 按 member 锚定（`hiddenLeft`/`hiddenRight`）收集，MUST NOT 依赖源码 token 顺序的区间拼接；输出 MUST NOT 重复 emit 同一 member。

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
