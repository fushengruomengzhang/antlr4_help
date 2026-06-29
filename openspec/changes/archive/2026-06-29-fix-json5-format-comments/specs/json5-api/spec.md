## MODIFIED Requirements

### Requirement: JSON5 format 注释保留与锚定

format MUST 保留注释文本。注释 MUST 语义锚定：member 前/行尾注释随该 member 移动；容器头注释留在容器顶部；容器尾注释留在容器底部；文档级注释（根 value 之前与 EOF 之前）MUST 保留在格式化输出的对应位置。当 `sortKeys: true` 时，member 绑定的注释 MUST 随 member 一起重排。

#### Scenario: member 前注释保留
- **WHEN** format 输入 `{ // comment\n a: 1 }`
- **THEN** 输出在 key `a` 之前仍含 `// comment`

#### Scenario: sortKeys 时注释随 member 移动
- **WHEN** format 输入 `{ // about b\n b: 1, a: 2 }` 且 `sortKeys: true`
- **THEN** `// about b` 仍出现在 `b` member 之前（排序后 `b` 在 `a` 之后）

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
