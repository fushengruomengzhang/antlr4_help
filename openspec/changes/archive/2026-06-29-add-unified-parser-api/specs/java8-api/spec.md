## ADDED Requirements

### Requirement: Java8 完整文件输入

java8 API SHALL 假定输入为完整 Java 源文件字符串，Parser 入口规则 MUST 为 `compilationUnit`。

#### Scenario: 含 package 与 import 的文件
- **WHEN** 输入含 `package`、`import` 及 class 声明的完整 `.java` 内容
- **THEN** `java8.signatures` 与 `java8.firstClassName` 均可成功执行

#### Scenario: 语法非法文件
- **WHEN** 输入不是合法 Java8 compilationUnit
- **THEN** 抛出 ParseError

### Requirement: Java8 首个类名提取

项目 SHALL 提供 `java8.firstClassName(input: string): string | null`，按源码顺序返回 compilationUnit 中第一个顶层具名类型声明的名称（class、interface、enum 或 `@interface`）。若无类型声明 MUST 返回 `null`。

#### Scenario: 首个 class 名称
- **WHEN** 文件含 `public class Foo` 且在顶层第一个类型
- **THEN** `firstClassName` 返回 `"Foo"`

#### Scenario: 首个 interface 名称
- **WHEN** 顶层第一个类型为 `interface Bar`
- **THEN** `firstClassName` 返回 `"Bar"`

#### Scenario: 无类型声明
- **WHEN** 文件仅含 import 无 typeDeclaration
- **THEN** `firstClassName` 返回 `null`

### Requirement: Java8 签名提取

项目 SHALL 提供 `java8.signatures(input: string): FileModel`，返回文件中所有顶层及 nested 类型的签名树。FileModel MUST 包含 `types: TypeModel[]`。每个 TypeModel MUST 包含：`kind`（`'class'` | `'interface'` | `'enum'` | `'annotation'`）、`name`、`modifiers`、`extends`（可选字符串）、`implements`（可选字符串数组）、`ownMembers`、`nestedTypes`。

#### Scenario: 类签名含 extends 与 implements
- **WHEN** 输入 `class Child extends Parent implements Serializable { }`
- **THEN** 对应 TypeModel 的 `name` 为 `Child`、`extends` 含 `Parent`、`implements` 含 `Serializable`

#### Scenario: nested 类型出现在 nestedTypes
- **WHEN** 类体内声明 `class Inner { }`
- **THEN** 外层 TypeModel 的 `nestedTypes` 含名为 `Inner` 的子 TypeModel

### Requirement: Java8 仅 own members

`ownMembers` MUST 仅包含该类型自身声明的成员，MUST NOT 合并父类或接口继承的成员。子类 override 的方法 MUST 出现在子类 `ownMembers` 中，父类同名方法 MUST 仍保留在父类 `ownMembers` 中。

#### Scenario: 父子同名方法各归各
- **WHEN** `Parent` 含 `void foo()` 且 `Child extends Parent` 含 `void foo()`
- **THEN** Parent 的 `ownMembers` 含 `foo`，Child 的 `ownMembers` 也含 `foo`，且 Child 的 `ownMembers` 不含 Parent 的其他成员

### Requirement: Java8 ownMembers 成员类型

ownMembers SHALL 支持以下成员种类：字段（field）、方法（method）、构造器（constructor）、enum 常量（enum constant）、接口常量（interface constant）、注解元素（annotation element）。提取 MUST 包含签名信息（名称、类型文本、修饰符、参数列表等），MUST NOT 深入方法体或初始化表达式内部。

#### Scenario: 方法签名不含方法体
- **WHEN** 类含 `public void bar(int x) { System.out.println(x); }`
- **THEN** ownMembers 中 method 含 `name: bar`、参数含 `int x`，且不解析方法体内语句

#### Scenario: 构造器签名
- **WHEN** 类含 `public Foo(String s) { }`
- **THEN** ownMembers 含 constructor 成员且参数含 `String s`

#### Scenario: enum 常量
- **WHEN** enum 含 `A, B(1)`
- **THEN** ownMembers 含 enum constant `A` 与 `B`

### Requirement: Java8 浅 Visitor 性能策略

Java8 签名提取 MUST 使用浅 Visitor：进入 `methodBody`、`block`、`constructorBody` 及表达式子树时 MUST NOT 继续遍历，以控制大文件解析开销。

#### Scenario: 大方法体不阻塞签名提取
- **WHEN** 类含数千行方法体的单个 method
- **THEN** `signatures` 仍能在合理时间内返回且 method 签名正确
