# json5-comment-anchor-index Specification

## Purpose

定义 JSON5 format 注释/空白锚点索引模块：构建 API、槽位分类规则，以及与 member/container/doc 的绑定语义。

## Requirements

### Requirement: JSON5 format 注释锚点索引构建

项目 SHALL 提供 `buildCommentAnchorIndex(parseTree, tokenStream)`（或等价导出），在 `CommonTokenStream` 已 fill HIDDEN token 的前提下，对 token 流执行 **单次 O(n) 扫描**，结合 parse tree 锚点，将每条 HIDDEN trivia（注释与空白）分类并绑定到 doc、container、member 或三引号 opener 槽位。索引 MUST NOT 改变 parse tree 或 token 流内容。

#### Scenario: 单次扫描完成

- **WHEN** 对合法 JSON5 输入完成 parse 与 fill 后调用 `buildCommentAnchorIndex`
- **THEN** 返回结构含 doc、members、containers（及三引号 opener）槽位映射，且实现不对同一 token index 重复全流扫描

#### Scenario: member prefix 绑定 key

- **WHEN** 输入 `{ // about b\n b: 1, a: 2 }` 且索引构建完成
- **THEN** `// about b` 及其后跟随换行 trivia 绑定于 `b` member 的 prefix 槽位

#### Scenario: member suffix 含行尾 inline

- **WHEN** 输入 `{ "age": 18, // 年龄\n "hex": 0xFF }` 且索引构建完成
- **THEN** `, // 年龄` 同行 trivia 绑定于 `"age"` member 的 suffix 槽位

#### Scenario: pure prefix 不落入上一 member suffix

- **WHEN** 输入 `{ "a": 1,\n // next\n "b": 2 }` 且索引构建完成
- **THEN** `// next` 绑定于 `"b"` member 的 prefix，且 MUST NOT 出现在 `"a"` member 的 suffix

#### Scenario: 容器头注释绑定 openAfter

- **WHEN** 输入 `{ // head\n a: 1 }` 且索引构建完成
- **THEN** `// head` 绑定于该 object 的 openAfter 槽位，而非任意 member prefix

#### Scenario: 文档级注释绑定 doc

- **WHEN** 输入 `// header\n{ a: 1 }\n// footer` 且索引构建完成
- **THEN** `// header` 在 doc.before，`// footer` 在 doc.after

### Requirement: JSON5 format 注释锚点索引供 FormatEmitter 查询

`FormatEmitter`（或等价 format emit 路径）SHALL 在 sort 相关路径通过索引查询 member prefix/suffix 与 container open/close trivia，SHALL NOT 在热路径对每个 member 重复调用 `isNextMemberPurePrefix` 或等价区间扫描以推断归属。

#### Scenario: sort compact 使用索引 prefix

- **WHEN** `JSON5.format` 输入 `{ // about b\n b: 1, a: 2 }` 且 `{ compact: true, sortKeys: true }`
- **THEN** 输出与索引语义一致：`// about b` 出现在 `b` member 之前，且输出与还原 A 前 golden byte-equal

#### Scenario: sort compact 使用索引 suffix

- **WHEN** `JSON5.format` 输入 `{ "score": 99.5, "age": 18, // 年龄\n "hex": 0xFF }` 且 `{ compact: true, sortKeys: true }`
- **THEN** 输出含 `"age": 18, // 年龄`，且与 golden byte-equal
