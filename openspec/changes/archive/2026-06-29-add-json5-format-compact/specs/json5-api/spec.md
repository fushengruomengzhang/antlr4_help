## MODIFIED Requirements

### Requirement: JSON5 格式化

项目 SHALL 提供 `json5.format(input: string, options?: FormatOptions): string`，在输入合法的前提下输出格式化后的 JSON5 字符串。FormatOptions SHALL 支持：`indent`（`{ type: 'space', size: number }` 或 `{ type: 'tab' }`，默认 2 空格）、`sortKeys`（boolean，默认 `false`）、`compact`（boolean，默认 `false`）。

#### Scenario: 默认格式化布局
- **WHEN** 对含嵌套对象的 JSON5 调用 `json5.format` 且不传 options
- **THEN** 输出使用 2 空格缩进且结构换行清晰

#### Scenario: Tab 缩进配置
- **WHEN** 调用 `json5.format(input, { indent: { type: 'tab' } })`
- **THEN** 输出使用 Tab 作为缩进字符

#### Scenario: compact 默认关闭
- **WHEN** 调用 `json5.format(input)` 且不传 `compact`
- **THEN** 行为与引入 compact 前一致（含字符串双引号规范化）

## ADDED Requirements

### Requirement: JSON5 format compact 模式

当 `compact: true` 时，format SHALL 在保留注释锚定规则（与默认模式相同）的前提下输出紧凑布局：容器头注释与 `{`/`[` 同行（若存在）；member 行尾注释与 value 同行；SHALL NOT 在 member 之间插入多余空行。字符串 value（STRING、TRIPLE_DOUBLE_STRING、TRIPLE_SINGLE_STRING）SHALL 保留输入 token 原文形态（含单引号、`'''`、行续接反斜杠），SHALL NOT 应用「JSON5 format 字符串 value 规范」中的引号转换。尾逗号移除、key 形态保留、`indent` 与 `sortKeys` 规则仍适用。

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
- **THEN** `// about b` 仍出现在 `b` member 之前

## MODIFIED Requirements

### Requirement: JSON5 format 字符串 value 规范

当 `compact: false`（默认）时，format SHALL 将单行字符串 value（STRING token）统一输出为双引号 `"..."` 形式，含必要转义。多行字符串 value（TRIPLE_DOUBLE_STRING 或 TRIPLE_SINGLE_STRING token）SHALL 保留三引号多行形态 `"""..."""`；TRIPLE_SINGLE_STRING 输入 MUST 输出为 TRIPLE_DOUBLE 形态（`"""`）。SHALL NOT 将三引号多行压成带 `\n` 转义的单行双引号。当 `compact: true` 时，本 requirement 的字符串转换规则 MUST NOT 应用。

#### Scenario: 单引号转双引号
- **WHEN** format 输入 `{ msg: 'hello' }` 且 `compact` 未设置或为 `false`
- **THEN** 输出中 value 为 `"hello"`

#### Scenario: 三引号多行保留
- **WHEN** format 输入含 `"""line1\nline2"""` 多行 value 且 `compact: false`
- **THEN** 输出仍为三引号多行 `"\"\"\"..."` 形态，而非单行 `"line1\nline2"`

#### Scenario: 单引号三引号转双引号三引号
- **WHEN** format 输入含 `'''multi\nline'''` 且 `compact: false`
- **THEN** 输出为 `"""multi\nline"""` 形态
