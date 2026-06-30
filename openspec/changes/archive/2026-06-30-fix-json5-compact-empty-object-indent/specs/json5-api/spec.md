## MODIFIED Requirements

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
