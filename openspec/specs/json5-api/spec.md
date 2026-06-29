# json5-api Specification

## Purpose
定义 JSON5 的 validate、parse、format API 及格式化语义（含注释锚定、key 排序、字符串规范）。

## Requirements

### Requirement: JSON5 快速验证

项目 SHALL 提供 `json5.validate(input: string): void`，仅执行词法与语法分析；输入合法时不返回值，非法时抛出 ParseError。

#### Scenario: 合法 JSON5 验证通过
- **WHEN** 对 `{ name: "foo", }` 调用 `json5.validate`
- **THEN** 不抛出异常

#### Scenario: 非法 JSON5 验证失败
- **WHEN** 对 `{ name: }` 调用 `json5.validate`
- **THEN** 抛出 ParseError，且包含 `line`、`column`、`message`

### Requirement: JSON5 解析为对象

项目 SHALL 提供 `json5.parse(input: string): unknown`，将合法 JSON5 字符串转换为 JavaScript 值（object、array、string、number、boolean、null）；SHALL 支持 JSON5 扩展（无引号 key、尾逗号、注释、Infinity/NaN、hex 数字等）。注释在 parse 结果中 MUST NOT 出现。

#### Scenario: 对象解析
- **WHEN** 对 `{ a: 1, b: "x" }` 调用 `json5.parse`
- **THEN** 返回 `{ a: 1, b: "x" }`

#### Scenario: 特殊字面量解析
- **WHEN** 对 `{ n: Infinity, x: NaN }` 调用 `json5.parse`
- **THEN** 返回对象且 `n` 为 `Infinity`、`x` 为 `NaN`

#### Scenario: 非法输入解析失败
- **WHEN** 对语法非法字符串调用 `json5.parse`
- **THEN** 抛出 ParseError

### Requirement: JSON5 格式化

项目 SHALL 提供 `json5.format(input: string, options?: FormatOptions): string`，在输入合法的前提下输出格式化后的 JSON5 字符串。FormatOptions SHALL 支持：`indent`（`{ type: 'space', size: number }` 或 `{ type: 'tab' }`，默认 2 空格）、`sortKeys`（boolean，默认 `false`）。

#### Scenario: 默认格式化布局
- **WHEN** 对含嵌套对象的 JSON5 调用 `json5.format` 且不传 options
- **THEN** 输出使用 2 空格缩进且结构换行清晰

#### Scenario: Tab 缩进配置
- **WHEN** 调用 `json5.format(input, { indent: { type: 'tab' } })`
- **THEN** 输出使用 Tab 作为缩进字符

### Requirement: JSON5 format 字符串 value 规范

format SHALL 将单行字符串 value（STRING token）统一输出为双引号 `"..."` 形式，含必要转义。多行字符串 value（TRIPLE_DOUBLE_STRING 或 TRIPLE_SINGLE_STRING token）SHALL 保留三引号多行形态 `"""..."""`；TRIPLE_SINGLE_STRING 输入 MUST 输出为 TRIPLE_DOUBLE 形态（`"""`）。SHALL NOT 将三引号多行压成带 `\n` 转义的单行双引号。

#### Scenario: 单引号转双引号
- **WHEN** format 输入 `{ msg: 'hello' }`
- **THEN** 输出中 value 为 `"hello"`

#### Scenario: 三引号多行保留
- **WHEN** format 输入含 `"""line1\nline2"""` 多行 value
- **THEN** 输出仍为三引号多行 `"\"\"\"..."` 形态，而非单行 `"line1\nline2"`

#### Scenario: 单引号三引号转双引号三引号
- **WHEN** format 输入含 `'''multi\nline'''`
- **THEN** 输出为 `"""multi\nline"""` 形态

### Requirement: JSON5 format 三引号内部不 deep indent

format 时三引号字符串的内容行 MUST NOT 随外层 object/array 深度增加额外缩进；仅三引号 delimiter 行跟随 member 行的外层 indent；结束 `"""` MUST 与起始 `"""` 列对齐。

#### Scenario: 嵌套 object 内三引号内容列不变
- **WHEN** format 含嵌套 object 且 value 为三引号多行字符串
- **THEN** 三引号内部各内容行的行首空白相对关系与输入一致（允许 trim 行尾空白）

### Requirement: JSON5 format 尾逗号移除

format 输出 MUST NOT 包含 trailing comma（object 或 array 最后一个元素后的逗号）。

#### Scenario: object 尾逗号移除
- **WHEN** format 输入 `{ a: 1, }`
- **THEN** 输出 `{ ... }` 中最后一个 member 后无逗号

### Requirement: JSON5 format key 形态保留

format 输出 key MUST 保留 JSON5 合法形态：IdentifierName 无引号、NUMBER 数字形态、关键字 token（true/false/null/Infinity/NaN）无引号、STRING key 保留引号或在可 unquote 时输出无引号标识符。

#### Scenario: 数字 key 保留
- **WHEN** format 输入 `{ 123: "x" }`
- **THEN** 输出 key 仍为数字形态 `123`

#### Scenario: 关键字 key 保留
- **WHEN** format 输入 `{ true: 1 }`
- **THEN** 输出 key 为无引号 `true`

### Requirement: JSON5 format 注释保留与锚定

format MUST 保留注释文本。注释 MUST 语义锚定：member 前/行尾注释随该 member 移动；容器头注释留在容器顶部；容器尾注释留在容器底部。当 `sortKeys: true` 时，member 绑定的注释 MUST 随 member 一起重排。

#### Scenario: member 前注释保留
- **WHEN** format 输入 `{ // comment\n a: 1 }`
- **THEN** 输出在 key `a` 之前仍含 `// comment`

#### Scenario: sortKeys 时注释随 member 移动
- **WHEN** format 输入 `{ // about b\n b: 1, a: 2 }` 且 `sortKeys: true`
- **THEN** `// about b` 仍出现在 `b` member 之前（排序后 `b` 在 `a` 之后）

### Requirement: JSON5 format key 排序

当 `sortKeys: true` 时，format SHALL 对每个 object 的 member 按 key 的 canonical 字符串表示字典序稳定排序。SHALL NOT 对 array 元素排序。

#### Scenario: object key 排序
- **WHEN** format 输入 `{ b: 1, a: 2 }` 且 `sortKeys: true`
- **THEN** 输出中 `a` 出现在 `b` 之前

#### Scenario: array 顺序不变
- **WHEN** format 输入 `[2, 1]` 且 `sortKeys: true`
- **THEN** 输出数组元素顺序仍为 `[2, 1]`
