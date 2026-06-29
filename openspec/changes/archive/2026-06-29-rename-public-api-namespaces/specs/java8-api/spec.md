## MODIFIED Requirements

### Requirement: Java8 完整文件输入

JAVA8 API SHALL 假定输入为完整 Java 源文件字符串，Parser 入口规则 MUST 为 `compilationUnit`。

#### Scenario: 含 package 与 import 的文件

- **WHEN** 输入含 `package`、`import` 及 class 声明的完整 `.java` 内容
- **THEN** `JAVA8.signatures` 与 `JAVA8.firstClassName` 均可成功执行

#### Scenario: 语法非法文件

- **WHEN** 输入不是合法 Java8 compilationUnit
- **THEN** 抛出 ParseError

### Requirement: Java8 首个类名提取

项目 SHALL 提供 `JAVA8.firstClassName(input: string): string | null`，按源码顺序返回 compilationUnit 中第一个顶层具名类型声明的名称（class、interface、enum 或 `@interface`）。若无类型声明 MUST 返回 `null`。

#### Scenario: 首个 class 名称

- **WHEN** 文件含 `public class Foo` 且在顶层第一个类型
- **THEN** `firstClassName` 返回 `"Foo"`

#### Scenario: 首个 interface 名称

- **WHEN** 顶层第一个类型为 `interface Bar`
- **THEN** `firstClassName` 返回 `"Bar"`

### Requirement: Java8 签名提取

项目 SHALL 提供 `JAVA8.signatures(input: string): FileModel`，返回文件中所有顶层及 nested 类型的结构化签名树。FileModel MUST 包含 `types: TypeModel[]`。每个 TypeModel MUST 包含：`kind`（`'class'` | `'interface'` | `'enum'` | `'annotation'`）、`name`、`annotations`（`Record<string, AnnotationAttrs>`，无注解时为 `{}`）、`modifiers`（仅 Java keyword，如 `public`/`static`）、`typeParameters`（可选 TypeParameterModel 数组）、`extendsType`（可选 TypeSignature）、`implementsTypes`（可选 TypeSignature 数组）、`ownMembers`、`nestedTypes`。MUST NOT 使用 `AnnotationModel[]` 或 `{ name, attributes }` 包装形态；MUST NOT 包含已废弃的扁平字段：`extends`（string）、`implements`（string[]）、字符串版 `typeParameters`、或与注解混排的 `modifiers`。

#### Scenario: 类签名含 extends 与 implements

- **WHEN** 输入 `class Child extends Parent implements Serializable { }`
- **THEN** 对应 TypeModel 的 `name` 为 `Child`、`extendsType.name` 为 `Parent`、`implementsTypes[0].name` 为 `Serializable`

#### Scenario: nested 类型出现在 nestedTypes

- **WHEN** 类体内声明 `class Inner { }`
- **THEN** 外层 TypeModel 的 `nestedTypes` 含名为 `Inner` 的子 TypeModel

#### Scenario: 泛型 extends 结构化

- **WHEN** 输入 `class Foo extends Bar<String> implements Baz<List<T>> { }`
- **THEN** `extendsType` 为 `{ kind: 'class', name: 'Bar', typeArguments: [{ kind: 'class', name: 'String' }] }`，`implementsTypes[0].typeArguments` 含 `List` 与 `T` 的嵌套结构
