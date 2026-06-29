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
