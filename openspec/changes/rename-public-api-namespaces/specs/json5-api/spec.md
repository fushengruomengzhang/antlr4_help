## MODIFIED Requirements

### Requirement: JSON5 快速验证

项目 SHALL 提供 `JSON5.validate(input: string): void`，仅执行词法与语法分析；输入合法时不返回值，非法时抛出 ParseError。

#### Scenario: 合法 JSON5 验证通过

- **WHEN** 对 `{ name: "foo", }` 调用 `JSON5.validate`
- **THEN** 不抛出异常

#### Scenario: 非法 JSON5 验证失败

- **WHEN** 对 `{ name: }` 调用 `JSON5.validate`
- **THEN** 抛出 ParseError，且包含 `line`、`column`、`message`

### Requirement: JSON5 解析为对象

项目 SHALL 提供 `JSON5.parse(input: string): unknown`，将合法 JSON5 字符串转换为 JavaScript 值（object、array、string、number、boolean、null）；SHALL 支持 JSON5 扩展（无引号 key、尾逗号、注释、Infinity/NaN、hex 数字等）。注释在 parse 结果中 MUST NOT 出现。

#### Scenario: 对象解析

- **WHEN** 对 `{ a: 1, b: "x" }` 调用 `JSON5.parse`
- **THEN** 返回 `{ a: 1, b: "x" }`

#### Scenario: 特殊字面量解析

- **WHEN** 对 `{ n: Infinity, x: NaN }` 调用 `JSON5.parse`
- **THEN** 返回对象且 `n` 为 `Infinity`、`x` 为 `NaN`

#### Scenario: 非法输入解析失败

- **WHEN** 对语法非法字符串调用 `JSON5.parse`
- **THEN** 抛出 ParseError

### Requirement: JSON5 格式化

项目 SHALL 提供 `JSON5.format(input: string, options?: FormatOptions): string`，在输入合法的前提下输出格式化后的 JSON5 字符串。FormatOptions SHALL 支持：`indent`（`{ type: 'space', size: number }` 或 `{ type: 'tab' }`，默认 2 空格）、`sortKeys`（boolean，默认 `false`）、`compact`（boolean，默认 `false`）。

#### Scenario: 默认格式化布局

- **WHEN** 对含嵌套对象的 JSON5 调用 `JSON5.format` 且不传 options
- **THEN** 输出使用 2 空格缩进且结构换行清晰

#### Scenario: Tab 缩进配置

- **WHEN** 调用 `JSON5.format(input, { indent: { type: 'tab' } })`
- **THEN** 输出使用 Tab 作为缩进字符

#### Scenario: compact 默认关闭

- **WHEN** 调用 `JSON5.format(input)` 且不传 `compact`
- **THEN** 行为与引入 compact 前一致（含字符串双引号规范化）

### Requirement: JSON5 三引号开引号行注释

三引号字符串（`'''` 或 `"""`）**开引号 delimiter 同一行**上的 `//` 行注释与 `/* */` 块注释 MUST 作为词法 HIDDEN 处理，MUST NOT 计入字符串 BODY token，MUST NOT 出现在 `JSON5.parse` 结果中。`format` MUST 在开引号 delimiter 之后、BODY 之前还原这些注释。三引号 BODY 内（第二行及以后）的 `//`、`/* */` 仍为字符串字面量内容。

#### Scenario: 开引号行行注释不进 parse

- **WHEN** `JSON5.parse` 输入 `{ "names": ''' // 三引号注释\n    ddsd\n  ''' }`
- **THEN** 返回值 `names` 为 `"    ddsd\n  "`（或等价正文），且字符串值中不含 `// 三引号注释`

#### Scenario: 开引号行块注释不进 parse

- **WHEN** `JSON5.parse` 输入 `{ x: ''' /* opener */\nbody\n''' }`
- **THEN** 返回值 `x` 不含 `/* opener */` 文本

#### Scenario: BODY 内块注释仍为字符串

- **WHEN** `JSON5.parse` 输入 `{ x: '''\n/* inside */\nbody\n''' }`
- **THEN** 返回值 `x` 含 `/* inside */` 子串

#### Scenario: format 还原开引号行行注释

- **WHEN** `JSON5.format` 输入 `{ "names": ''' // 三引号注释\n    ddsd\n  ''' }`（compact 或 default）
- **THEN** 输出在开引号 `'''` 之后、正文 `ddsd` 之前仍含 `// 三引号注释`

### Requirement: JSON5 三引号 delimiter 保留

`format` 输出三引号字符串时 MUST 保留输入的 delimiter 类型（`tripleSingleString` 结构输出 `'''`，`tripleDoubleString` 结构输出 `"""`）。pretty（`compact: false`）MUST NOT 将 `'''` 强制转换为 `"""`。

#### Scenario: pretty 保留单引号三引号

- **WHEN** `JSON5.format` 输入含 `'''multi\nline'''` 且 `compact: false`
- **THEN** 输出仍为 `'''...'''` 形态，而非 `"""..."""`

#### Scenario: compact 保留单引号三引号

- **WHEN** `JSON5.format` 输入含 `'''line'''` 且 `compact: true`
- **THEN** 输出仍为 `'''...'''` 形态

### Requirement: JSON5 三引号必须成对闭合

未闭合的三引号字符串、开闭 delimiter 类型不匹配（`'''` 开 `"""` 关）、或词法分析在三引号模式中遇到非法输入时，`validate`/`parse`/`format` MUST 抛出 `ParseError`，MUST NOT 静默接受或错误解析为其他 token。

#### Scenario: 未闭合三引号报错

- **WHEN** 对 `{ x: ''' unclosed }` 调用 `JSON5.validate`
- **THEN** 抛出 ParseError

#### Scenario: 未闭合至 EOF 报错

- **WHEN** 对 `{ x: ''' // c\nno close` 调用 `JSON5.validate`
- **THEN** 抛出 ParseError

#### Scenario: delimiter 类型不匹配报错

- **WHEN** 对 `{ x: ''' start """ end }` 调用 `JSON5.validate`
- **THEN** 抛出 ParseError
