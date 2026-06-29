## MODIFIED Requirements

### Requirement: Java8 完整文件输入

`JAVA8.signatures` 与 `JAVA8.firstClassName` SHALL 假定输入为完整 Java 源文件字符串，Parser 入口规则 MUST 为 `compilationUnit`，且 MUST parse 至规则完成（含 `EOF`）。`JAVA8.peekFirstClassName` MAY 在取得首个顶层类型名后提前终止 parse，MUST NOT 要求 parse 完整 compilationUnit。

#### Scenario: 含 package 与 import 的文件
- **WHEN** 输入含 `package`、`import` 及 class 声明的完整 `.java` 内容
- **THEN** `JAVA8.signatures`、`JAVA8.firstClassName` 与 `JAVA8.peekFirstClassName` 均可成功执行

#### Scenario: 语法非法文件（strict API）
- **WHEN** 输入不是合法 Java8 compilationUnit（含 body 语法错误）
- **THEN** `JAVA8.firstClassName` 与 `JAVA8.signatures` 抛出 ParseError

#### Scenario: header 非法时 peek 仍抛错
- **WHEN** 输入在 package、import 或类型 header（Identifier 之前）存在语法错误
- **THEN** `JAVA8.peekFirstClassName` 抛出 ParseError

## ADDED Requirements

### Requirement: Java8 peekFirstClassName 快速提取

项目 SHALL 提供 `JAVA8.peekFirstClassName(input: string): string | null`，按源码顺序返回 compilationUnit 中第一个顶层具名类型声明的名称（class、interface、enum 或 `@interface`），规则 MUST 与 `JAVA8.firstClassName` 相同。若无类型声明 MUST 返回 `null`。实现 MUST 在取得该名称后立即终止 parse，MUST NOT lex 或 parse 首个顶层类型的 body 及之后的内容。

#### Scenario: 与 firstClassName 结果一致（合法文件）
- **WHEN** 输入为合法 Java8 文件且含顶层 `public class Foo`
- **THEN** `peekFirstClassName` 返回 `"Foo"`

#### Scenario: body 语法错误仍返回类名
- **WHEN** 输入为 `public class User { void broken( {`（header 合法、body 非法）
- **THEN** `peekFirstClassName` 返回 `"User"`

#### Scenario: body 语法错误时 firstClassName 仍 strict
- **WHEN** 同上输入
- **THEN** `firstClassName` 抛出 ParseError

#### Scenario: 无类型声明
- **WHEN** 文件仅含 import 无 typeDeclaration
- **THEN** `peekFirstClassName` 返回 `null`
