# parse-pipeline Specification

## Purpose
定义 json5、json、java8 共享的 ANTLR 解析管线与统一 ParseError 异常形状。

## Requirements

### Requirement: 统一解析管线

项目 SHALL 提供共享解析管线，将输入字符串经由 Lexer 与 Parser 驱动至指定入口规则，并在语法或词法错误时收集错误信息而非写入控制台。

#### Scenario: 成功解析返回 CST
- **WHEN** 调用方传入合法输入字符串及对应语言的 Lexer、Parser、入口规则
- **THEN** 管线返回 Parser 入口规则对应的 CST 根节点

#### Scenario: 语法错误抛出 ParseError
- **WHEN** 输入字符串不符合对应语法
- **THEN** 管线抛出 ParseError，且包含 `line`、`column`、`message` 字段

### Requirement: ParseError 异常形状

项目 SHALL 定义 ParseError 异常类，所有语言解析失败 MUST 使用该类型（或其子类）抛出，且 MUST 包含以下字段：`language`（`'json5'` | `'json'` | `'java8'`）、`line`（1-based）、`column`（0-based，与 ANTLR `charPositionInLine` 一致）、`message`（人类可读错误描述）。

#### Scenario: Parser 错误包含位置
- **WHEN** Parser 在第 3 行第 5 列遇到 unexpected token
- **THEN** 抛出的 ParseError 的 `line` 为 3、`column` 为 5，且 `message` 非空

#### Scenario: Lexer 错误包含位置
- **WHEN** Lexer 遇到无法识别的字符
- **THEN** 抛出的 ParseError 包含该字符所在的 `line` 与 `column`

### Requirement: 默认错误监听器移除

解析管线 MUST 移除 ANTLR Lexer 与 Parser 的默认控制台 error listener，MUST NOT 将错误直接打印到 stderr。

#### Scenario: 无效输入不污染 stderr
- **WHEN** 对非法输入调用 validate 或 parse
- **THEN** 进程 stderr 无 ANTLR 默认错误输出，错误仅通过 ParseError 传递

### Requirement: SLL 预测模式与 LL 回退

共享解析管线 `runParsePipeline` SHALL 在调用入口规则前将 Parser 预测模式设为 SLL（`PredictionMode.SLL`）；若 parse 抛出异常或产生需回退的预测失败，SHALL reset token stream 与 parser 后以 LL 模式（`PredictionMode.LL`）重试一次。成功路径的 CST 与错误路径的 ParseError MUST 与仅使用 LL 模式时语义一致。

#### Scenario: 合法 JSON4 输入 SLL 成功
- **WHEN** 对合法标准 JSON 字符串调用 `JSON4.parse`
- **THEN** 返回与优化前相同的 JavaScript 值且不抛出异常

#### Scenario: 合法 JSON5 输入 SLL 成功
- **WHEN** 对合法 JSON5 字符串调用 `JSON5.parse`
- **THEN** 返回与优化前相同的 JavaScript 值且不抛出异常

#### Scenario: 非法输入仍抛出 ParseError
- **WHEN** 对语法非法字符串调用 `JSON5.validate`
- **THEN** 抛出 ParseError，且 `language`、`line`、`column`、`message` 字段均存在

#### Scenario: Java8 合法输入 SLL 或回退后成功
- **WHEN** 对 `test/resources/test.java.text` 调用 `JAVA8.signatures`
- **THEN** 返回非空 `types` 数组且不抛出异常
