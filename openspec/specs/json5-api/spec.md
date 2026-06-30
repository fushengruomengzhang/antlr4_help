# json5-api Specification

## Purpose
定义 JSON5 的 validate、parse、format API 及格式化语义（含注释锚定、key 排序、字符串规范）。

## Requirements

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

### Requirement: JSON5 format compact 模式

当 `compact: true` 时，format SHALL 在保留注释锚定规则（与默认模式相同）的前提下输出紧凑布局：容器头注释与 `{`/`[` 同行（若存在）；member 行尾注释与 value 同行；SHALL NOT 在 member 之间插入多余空行。字符串 value（STRING、TRIPLE_DOUBLE_STRING、TRIPLE_SINGLE_STRING）SHALL 保留输入 token 原文形态（含单引号、`'''`、行续接反斜杠），SHALL NOT 应用「JSON5 format 字符串 value 规范」中的引号转换。尾逗号移除、key 形态保留、`indent` 与 `sortKeys` 规则仍适用。当 `sortKeys: true` 与 `compact: true` 同时启用时，member 前缀注释 MUST 经 `hiddenLeft(key)` 锚定；member 后缀（逗号、行尾 inline 注释、换行）MUST 经 `spanBetween(valStop, sourceNextKey)` 收集，其中 `sourceNextKey` 为该 member 在**源码**中的下一项 key（或容器 close），MUST NOT 使用排序后下一项 key 作为区间终点；输出 MUST NOT 重复 emit 同一 member。`spanBetween` 收集的后缀 MUST NOT 包含下一源码 member 的 pure prefix `hiddenLeft(key)` token（含 comment 后 whitespace/newline；该 prefix MUST 仅随其所属 member emit）；MUST NOT 因排除 pure prefix 而移除上一 member 的行尾 inline 注释 token；MUST NOT 保留 pure prefix 之前的 inter-member layout gap whitespace（compact sort 路径 suffix 仅保留 value 同行后缀如 `, // inline`）。member 前缀注释与 key token 之间 MUST 保留换行（MUST NOT 输出 `// ..."key"` 粘连形态）。非末项 member 的行尾 inline 注释（源码形态 `value, // ...`）MUST 与 value 同行输出，且逗号 MUST 位于注释之前（`, // ...`）。当 `sortKeys: true` 与 `compact: true` 同时启用时，compact 布局规则（容器头注释与 `{`/`[` 同行、member 间无多余空行、无 whitespace-only 行）MUST 仍然适用；输出布局 MUST 与 `{ compact: true }` 相同，仅各 object 层 member 顺序按 sortKeys 重排；容器头注释（位于 `{`/`[` 与源码首个 member key 之间）MUST NOT 因 key 排序而附着到任意 member 的 prefix。**空 object 或空 array**（无 member/element）在 compact 模式下，若 `{`/`[` 后存在需换行闭合的布局，闭合 `}`/`]` 的缩进 MUST 按当前容器 `depth` 与 `indent` 配置计算（`indentUnit(depth)`），MUST NOT 原样 emit 源码 HIDDEN 通道中 `{`/`[` 与 `}`/`]` 之间的 layout whitespace（如 `\n  `）；开括号后的 inline 头注释（`{ // ...`）MUST 仍保留在同一行。

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

#### Scenario: compact 与 sortKeys 无 whitespace-only 行
- **WHEN** format 输入 `{ // a\n "a": 1, // inline\n\n // b\n "b": 2 }` 且 `{ compact: true, sortKeys: true }`
- **THEN** 输出 MUST NOT 含仅由空白字符组成的行（whitespace-only lines）

#### Scenario: compact 与 sortKeys member 前缀注释随 key
- **WHEN** format 输入 `{ "_private": true,\n // 中文 key\n 中文字段: "v", "$key": "x" }` 且 `{ compact: true, sortKeys: true }`
- **THEN** `// 中文 key` 出现在 `中文字段` member 之前，且 MUST NOT 出现在 `"$key"` member 之前

#### Scenario: compact 与 sortKeys unicode 前缀注释随 key
- **WHEN** format 输入 `{ "a": 1,\n // unicode\n "unicode": "\\u4F60\\u597D", "b": 2 }` 且 `{ compact: true, sortKeys: true }`
- **THEN** `// unicode` 出现在 `"unicode"` member 之前，且 MUST NOT 出现在 `"a"` 或 `"b"` member 之前

#### Scenario: compact 与 sortKeys prefix 注释与 key 分行
- **WHEN** format 输入 `{ "$key": "value", // $\n\n  // 下划线\n  "_private": true, // private }` 且 `{ compact: true, sortKeys: true }`
- **THEN** 输出含 `// 下划线` 与 `"_private"` 分行相邻，且 MUST NOT 含 `下划线"_private"` 粘连子串

#### Scenario: compact 与 sortKeys section prefix 下行尾 inline 保留
- **WHEN** format 输入 `{ // 数字\n "age": 18, // 年龄\n\n // 浮点数\n "score": 99.5, // 分数 }` 且 `{ compact: true, sortKeys: true }`
- **THEN** 输出含 `"age": 18, // 年龄` 与 `"score": 99.5, // 分数`（各自与 value 同行），且 `// 浮点数` 行与 `"score"` 行之间 MUST NOT 有 whitespace-only 行

#### Scenario: compact 空 object 闭合缩进按 indent 重算
- **WHEN** format 输入 `{"userDetail": { // 用户详情\n  "user": { // 用户基础信息\n  },\n  "userP": {"x": 1}\n}}` 且 `{ compact: true, indent: { type: 'space', size: 4 } }`
- **THEN** `"user": { // 用户基础信息` 与紧随其后的 `},` 行 MUST 使用相同的前导缩进（均为 `indentUnit` 在该 depth 下的宽度），MUST NOT 出现 `},` 仍保留源码 2 空格而 member 行已按 size 4 重算的不对齐

#### Scenario: compact 空 array 闭合缩进按 indent 重算
- **WHEN** format 输入 `{"items": [ // list\n  ],\n  "a": 1}` 且 `{ compact: true, indent: { type: 'space', size: 4 } }`
- **THEN** `[ // list` 与 `],` 行 MUST 使用相同的前导缩进，MUST NOT 沿用源码 HIDDEN 中的 `\n  ` 作为 `]` 行缩进

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

### Requirement: JSON5 format 字符串 value 规范

当 `compact: false`（默认）时，format SHALL 将单行字符串 value（STRING token）统一输出为双引号 `"..."` 形式，含必要转义。多行字符串 value（三引号结构）SHALL 保留输入 delimiter 类型与多行形态（`'''...'''` 或 `"""..."""`），SHALL NOT 将三引号多行压成带 `\n` 转义的单行双引号。当 `compact: true` 时，本 requirement 的 STRING 双引号转换规则 MUST NOT 应用于三引号结构；单行 STRING 仍按 compact 规则保留源 token。

#### Scenario: 单引号转双引号

- **WHEN** format 输入 `{ msg: 'hello' }` 且 `compact` 未设置或为 `false`
- **THEN** 输出中 value 为 `"hello"`

#### Scenario: 三引号多行保留

- **WHEN** format 输入含 `"""line1\nline2"""` 多行 value 且 `compact: false`
- **THEN** 输出仍为三引号多行 `"""..."""` 形态，而非单行 `"line1\nline2"`

#### Scenario: 单引号三引号保留 delimiter

- **WHEN** format 输入含 `'''multi\nline'''` 且 `compact: false`
- **THEN** 输出为 `'''multi\nline'''` 形态（保留 `'''`）

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

format MUST 保留注释文本。注释 MUST 语义锚定：member 前/行尾注释随该 member 移动；容器头注释留在容器顶部；容器尾注释留在容器底部；文档级注释（根 value 之前与 EOF 之前）MUST 保留在格式化输出的对应位置。当 `sortKeys: true` 时，member 绑定的注释 MUST 随 member 一起重排。源码形态为 `value, // comment` 的行尾 inline 注释 MUST 锚定于该 value 所属 member，MUST NOT 因排序而附着到其它 key 的 `hiddenLeft`；当下一 member 存在 section prefix 注释时，上一 member 的行尾 inline MUST NOT 因 pure prefix 排除逻辑而丢失。member 前缀注释（独立行 `// ...` 或块注释位于 key 之前）MUST 锚定于该 key 所属 member；当 `sortKeys: true` 时 MUST NOT 因上一 member 的 suffix 收集而附着到其它 member；prefix 注释与 key 之间 MUST 保留换行（MUST NOT 与 key token 粘连输出）。

#### Scenario: member 前注释保留
- **WHEN** format 输入 `{ // comment\n a: 1 }`
- **THEN** 输出在 key `a` 之前仍含 `// comment`

#### Scenario: sortKeys 时注释随 member 移动
- **WHEN** format 输入 `{ // about b\n b: 1, a: 2 }` 且 `sortKeys: true`
- **THEN** `// about b` 仍出现在 `b` member 之前（排序后 `b` 在 `a` 之后）

#### Scenario: sortKeys 时行尾 inline 注释随 value member 移动
- **WHEN** format 输入 `{ "score": 99.5, "age": 18, // 年龄\n "hex": 0xFF }` 且 `sortKeys: true`
- **THEN** `// 年龄` 出现在 `"age"` member 行，而非 `"score"` 或 `"hex"` member 行

#### Scenario: sortKeys 时 member 前缀注释随 key 移动
- **WHEN** format 输入 `{ "_private": true,\n // 中文 key\n 中文字段: "v", "$key": "x" }` 且 `sortKeys: true`
- **THEN** `// 中文 key` 出现在 `中文字段` member 之前，而非 `"$key"` member 之前

#### Scenario: sortKeys 时 prefix 注释与 key 分行
- **WHEN** format 输入 `{ "$key": "v", // tag\n\n  // label\n  "a": 1 }` 且 `sortKeys: true`
- **THEN** 输出含 `// label` 与 `"a"` 分行相邻，且 MUST NOT 含 `label"a"` 粘连子串

#### Scenario: sortKeys 时 section 间隔下行尾 inline 不丢失
- **WHEN** format 输入 `{ // 数字\n "age": 18, // 年龄\n\n // 浮点数\n "score": 99.5 }` 且 `{ sortKeys: true, compact: true }`
- **THEN** 输出含 `"age": 18, // 年龄`

#### Scenario: 文档首部注释保留
- **WHEN** format 输入 `// header\n{ a: 1 }`
- **THEN** 输出在根 object 的 `{` 之前仍含 `// header`

#### Scenario: 文档尾部注释保留
- **WHEN** format 输入 `{ a: 1 }\n// footer`
- **THEN** 输出在根 object 的 `}` 之后仍含 `// footer`

#### Scenario: 空 object 内注释保留
- **WHEN** format 输入 `{ /* inside */ }`
- **THEN** 输出在 `{` 与 `}` 之间仍含 `/* inside */`

#### Scenario: 空 array 内注释保留
- **WHEN** format 输入 `[ /* inside */ ]`
- **THEN** 输出在 `[` 与 `]` 之间仍含 `/* inside */`

#### Scenario: 最后 member 与闭合括号之间注释保留
- **WHEN** format 输入 `{ a: 1,\n // between\n }`
- **THEN** 输出在最后一个 member 之后、闭合 `}` 之前仍含 `// between`

### Requirement: JSON5 format key 排序

当 `sortKeys: true` 时，format SHALL 对每个 object 的 member 按 key 的 canonical 字符串表示字典序稳定排序。SHALL NOT 对 array 元素排序。

#### Scenario: object key 排序
- **WHEN** format 输入 `{ b: 1, a: 2 }` 且 `sortKeys: true`
- **THEN** 输出中 `a` 出现在 `b` 之前

#### Scenario: array 顺序不变
- **WHEN** format 输入 `[2, 1]` 且 `sortKeys: true`
- **THEN** 输出数组元素顺序仍为 `[2, 1]`
