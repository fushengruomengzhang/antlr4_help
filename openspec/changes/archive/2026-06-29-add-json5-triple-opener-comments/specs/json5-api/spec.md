## ADDED Requirements

### Requirement: JSON5 三引号开引号行注释

三引号字符串（`'''` 或 `"""`）**开引号 delimiter 同一行**上的 `//` 行注释与 `/* */` 块注释 MUST 作为词法 HIDDEN 处理，MUST NOT 计入字符串 BODY token，MUST NOT 出现在 `json5.parse` 结果中。`format` MUST 在开引号 delimiter 之后、BODY 之前还原这些注释。三引号 BODY 内（第二行及以后）的 `//`、`/* */` 仍为字符串字面量内容。

#### Scenario: 开引号行行注释不进 parse

- **WHEN** `json5.parse` 输入 `{ "names": ''' // 三引号注释\n    ddsd\n  ''' }`
- **THEN** 返回值 `names` 为 `"    ddsd\n  "`（或等价正文），且字符串值中不含 `// 三引号注释`

#### Scenario: 开引号行块注释不进 parse

- **WHEN** `json5.parse` 输入 `{ x: ''' /* opener */\nbody\n''' }`
- **THEN** 返回值 `x` 不含 `/* opener */` 文本

#### Scenario: BODY 内块注释仍为字符串

- **WHEN** `json5.parse` 输入 `{ x: '''\n/* inside */\nbody\n''' }`
- **THEN** 返回值 `x` 含 `/* inside */` 子串

#### Scenario: format 还原开引号行行注释

- **WHEN** `json5.format` 输入 `{ "names": ''' // 三引号注释\n    ddsd\n  ''' }`（compact 或 default）
- **THEN** 输出在开引号 `'''` 之后、正文 `ddsd` 之前仍含 `// 三引号注释`

### Requirement: JSON5 三引号 delimiter 保留

`format` 输出三引号字符串时 MUST 保留输入的 delimiter 类型（`TRIPLE_SINGLE_STRING` 结构输出 `'''`，`TRIPLE_DOUBLE_STRING` 结构输出 `"""`）。pretty（`compact: false`）MUST NOT 将 `'''` 强制转换为 `"""`。

#### Scenario: pretty 保留单引号三引号

- **WHEN** `json5.format` 输入含 `'''multi\nline'''` 且 `compact: false`
- **THEN** 输出仍为 `'''...'''` 形态，而非 `"""..."""`

#### Scenario: compact 保留单引号三引号

- **WHEN** `json5.format` 输入含 `'''line'''` 且 `compact: true`
- **THEN** 输出仍为 `'''...'''` 形态

### Requirement: JSON5 三引号必须成对闭合

未闭合的三引号字符串、开闭 delimiter 类型不匹配（`'''` 开 `"""` 关）、或词法分析在三引号模式中遇到非法输入时，`validate`/`parse`/`format` MUST 抛出 `ParseError`，MUST NOT 静默接受或错误解析为其他 token。

#### Scenario: 未闭合三引号报错

- **WHEN** 对 `{ x: ''' unclosed }` 调用 `json5.validate`
- **THEN** 抛出 ParseError

#### Scenario: 未闭合至 EOF 报错

- **WHEN** 对 `{ x: ''' // c\nno close` 调用 `json5.validate`
- **THEN** 抛出 ParseError

#### Scenario: delimiter 类型不匹配报错

- **WHEN** 对 `{ x: ''' start """ end }` 调用 `json5.validate`
- **THEN** 抛出 ParseError

## MODIFIED Requirements

### Requirement: JSON5 format 字符串 value 规范

当 `compact: false`（默认）时，format SHALL 将单行字符串 value（STRING token）统一输出为双引号 `"..."` 形式，含必要转义。多行字符串 value（三引号结构）SHALL 保留输入 delimiter 类型与多行形态（`'''...'''` 或 `"""..."""`），SHALL NOT 将三引号多行压成带 `\n` 转义的单行双引号。当 `compact: true` 时，本 requirement 的 STRING 双引号转换规则 MUST NOT 应用于三引号结构；单行 STRING 仍按 compact 规则保留源 token。当 `compact: true` 时，本 requirement 的字符串转换规则 MUST NOT 应用于三引号结构。

#### Scenario: 单引号转双引号

- **WHEN** format 输入 `{ msg: 'hello' }` 且 `compact` 未设置或为 `false`
- **THEN** 输出中 value 为 `"hello"`

#### Scenario: 三引号多行保留

- **WHEN** format 输入含 `"""line1\nline2"""` 多行 value 且 `compact: false`
- **THEN** 输出仍为三引号多行 `"""..."""` 形态，而非单行 `"line1\nline2"`

#### Scenario: 单引号三引号保留 delimiter

- **WHEN** format 输入含 `'''multi\nline'''` 且 `compact: false`
- **THEN** 输出为 `'''multi\nline'''` 形态（保留 `'''`）
