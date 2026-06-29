# java8-api Specification

## Purpose
定义 Java8 完整源文件的签名提取 API：首个类名与 FileModel（own members + nested 类型树）。签名模型为结构化 AST（AnnotationMap、TypeSignature、ParameterModel 等），非扁平文本；注解以 Record 形态便于 O(1) 查询。

## Requirements

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

### Requirement: Java8 首个类名提取

项目 SHALL 提供 `JAVA8.firstClassName(input: string): string | null`，按源码顺序返回 compilationUnit 中第一个顶层具名类型声明的名称（class、interface、enum 或 `@interface`）。若无类型声明 MUST 返回 `null`。

#### Scenario: 首个 class 名称
- **WHEN** 文件含 `public class Foo` 且在顶层第一个类型
- **THEN** `firstClassName` 返回 `"Foo"`

#### Scenario: 首个 interface 名称
- **WHEN** 顶层第一个类型为 `interface Bar`
- **THEN** `firstClassName` 返回 `"Bar"`

#### Scenario: 无类型声明
- **WHEN** 文件仅含 import 无 typeDeclaration
- **THEN** `firstClassName` 返回 `null`

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

### Requirement: Java8 仅 own members

`ownMembers` MUST 仅包含该类型自身声明的成员，MUST NOT 合并父类或接口继承的成员。子类 override 的方法 MUST 出现在子类 `ownMembers` 中，父类同名方法 MUST 仍保留在父类 `ownMembers` 中。

#### Scenario: 父子同名方法各归各
- **WHEN** `Parent` 含 `void foo()` 且 `Child extends Parent` 含 `void foo()`
- **THEN** Parent 的 `ownMembers` 含 `foo`，Child 的 `ownMembers` 也含 `foo`，且 Child 的 `ownMembers` 不含 Parent 的其他成员

### Requirement: Java8 ownMembers 成员类型

ownMembers SHALL 支持以下成员种类：字段（field）、方法（method）、构造器（constructor）、enum 常量（enum constant）、接口常量（interface constant）、注解元素（annotation element）。提取 MUST 以结构化字段描述签名（TypeSignature、AnnotationMap、ParameterModel 等），MUST NOT 使用扁平 `type`/`params`/`signature`/`throws`/`names` 字符串字段或 `declarators` 数组。字段与接口常量 MUST 含顶层 `name` 与可选 `defaultValue`；多 declarator 声明 MUST 拆成多条 member。MUST NOT 深入方法体；字段 initializer 与注解 elementValue 仅按浅解析规则提取 defaultValue。enum 常量与方法等的 `annotations` MUST 为 Record（无注解 `{}`）。

#### Scenario: 方法签名不含方法体
- **WHEN** 类含 `public void bar(int x) { System.out.println(x); }`
- **THEN** ownMembers 中 method 含 `name: bar`、`parameters` 含一项 `{ name: x, type: { kind: 'primitive', name: 'int' } }`，且不解析方法体内语句

#### Scenario: 构造器签名
- **WHEN** 类含 `public Foo(String s) { }`
- **THEN** ownMembers 含 constructor 成员且 `parameters` 含 `{ type: { kind: 'class', name: 'String' }, name: s }`

#### Scenario: enum 常量
- **WHEN** enum 含 `A, B(1)`
- **THEN** ownMembers 含 enum constant `A` 与 `B`

#### Scenario: 接口常量拆分
- **WHEN** 接口含 `int X = 1, Y = 2;`
- **THEN** ownMembers 含两条 interfaceConstant，分别为 `name: 'X'` 与 `name: 'Y'`

### Requirement: Java8 浅 Visitor 性能策略

Java8 签名提取 MUST 使用浅 Visitor：进入 `methodBody`、`block`、`constructorBody` 及表达式子树时 MUST NOT 继续遍历，以控制大文件解析开销。

#### Scenario: 大方法体不阻塞签名提取
- **WHEN** 类含数千行方法体的单个 method
- **THEN** `signatures` 仍能在合理时间内返回且 method 签名正确

### Requirement: Java8 结构化注解

签名提取 MUST 将注解从 keyword 修饰符中分离。`annotations` MUST 为以注解类型简单名为 key 的对象（`Record<string, AnnotationAttrs>`），value 为属性键值对象（即原 `attributes` 内容，不再嵌套 `name`/`attributes` 包装）。无注解时 MUST 为 `{}`。marker 注解（`@Name` 无括号）MUST 对应 `{ Name: {} }`。单元素注解（`@Name(value)`）MUST 对应 `{ Name: { value: <parsed> } }`（隐式 key 为 `value`）。normal 注解 MUST 按 `elementValuePair` 解析为 value 对象。假定同一元素上不存在同名注解重复。注解 MAY 出现在类型、字段、方法、参数等 modifier 位置。

#### Scenario: marker 注解
- **WHEN** 字段含 `@ESDocument` 与 `private int age`
- **THEN** 字段 `annotations` 为 `{ ESDocument: {} }`，`modifiers` 为 `['private']`

#### Scenario: 单元素注解默认 key
- **WHEN** 类含 `@ApiModel("用户信息")`
- **THEN** 类 `annotations` 为 `{ ApiModel: { value: '用户信息' } }`

#### Scenario: normal 注解多属性
- **WHEN** 字段含 `@ApiModelProperty(value = "用户名", required = true)`
- **THEN** `annotations.ApiModelProperty` 为 `{ value: '用户名', required: true }`

#### Scenario: 参数上的注解
- **WHEN** 方法含 `void setH(@H(p = "dd") int a)`
- **THEN** 对应 parameter 的 `annotations` 为 `{ H: { p: 'dd' } }`

#### Scenario: 无注解
- **WHEN** 字段无注解修饰符
- **THEN** `annotations` 为 `{}`

### Requirement: Java8 注解值浅解析

`elementValue` 与字段 initializer 的解析 MUST 限于：字面量（string/number/boolean/char）、嵌套注解（递归为 `Record<string, AnnotationAttrs>` 形态的值）、数组字面量（`{ ... }` 内的上述形态）。若值为其他 `conditionalExpression`（方法调用、`new`、SpEL 等），MUST 省略该 attribute 或 `defaultValue` 字段，MUST NOT 递归进入表达式子树。

#### Scenario: 字面量与布尔属性
- **WHEN** 注解含 `required = true`
- **THEN** `annotations.ApiModelProperty.required` 为布尔 `true`

#### Scenario: 数组字面量
- **WHEN** `@interface 元素` 或注解含 `codes = { 1, 2 }`
- **THEN** 解析为数字数组 `[1, 2]`

#### Scenario: 复杂表达式省略
- **WHEN** 字段为 `private String x = compute()` 或注解值为方法调用
- **THEN** 对应 `defaultValue` 或 attribute 字段不出现

### Requirement: Java8 结构化类型签名

类型位置（字段、方法返回、参数、throws、extends、implements、泛型实参）MUST 使用 TypeSignature 递归描述。class 类型 MUST 含 `kind: 'class'`、`name` 与可选 `typeArguments`。primitive MUST 含 `kind: 'primitive'` 与 `name`。type variable MUST 含 `kind: 'typeVariable'` 与 `name`。数组 MUST 含 `kind: 'array'`、`elementType` 与 `dimensions`。wildcard（`?`、`? extends T`、`? super T`）MUST 含 `kind: 'wildcard'` 与可选 bound。void 返回 MUST 使用 `{ kind: 'void' }`。

#### Scenario: List 泛型
- **WHEN** 字段类型为 `List<User>`
- **THEN** `type` 为 `{ kind: 'class', name: 'List', typeArguments: [{ kind: 'class', name: 'User' }] }`

#### Scenario: Map 双泛型参数
- **WHEN** 字段类型为 `Map<String, UserDetail>`
- **THEN** `type.typeArguments` 依次为 `String` 与 `UserDetail` 的 TypeSignature

#### Scenario: 嵌套泛型
- **WHEN** 字段类型为 `List<Map<String, List<UserDetail>>>`
- **THEN** `type` 递归描述三层嵌套，最内层 `UserDetail` 为 class TypeSignature

### Requirement: Java8 结构化 typeParameters

类与方法上的泛型形参 MUST 使用 TypeParameterModel 数组：`{ name, annotations?, bound? }`。若存在 `extends` bound，MUST 设为 `bound.extends`（TypeSignature）；若存在 `&` 交叉 bound，MUST 设为 `bound.additional`（TypeSignature 数组）。无 bound 的形参（如 `<T>`）MUST 省略 `bound` 字段。

#### Scenario: 单形参无 bound
- **WHEN** 类声明为 `class Box<T> { }`
- **THEN** `typeParameters` 为 `[{ name: 'T' }]`

#### Scenario: extends 与交叉 bound
- **WHEN** 类声明为 `class Box<T extends Serializable & Comparable<T>> { }`
- **THEN** `typeParameters[0].bound.extends.name` 为 `Serializable`，`bound.additional[0]` 为含 `Comparable` 与 `T` 实参的 TypeSignature

#### Scenario: 方法泛型形参
- **WHEN** 方法声明为 `<K, V> void foo()`
- **THEN** method 的 `typeParameters` 含 `K` 与 `V` 两项

### Requirement: Java8 字段 declarator 与默认值

字段 member MUST 含顶层 `name`（string）与可选 `defaultValue`。MUST NOT 使用 `declarators` 数组。同一 `fieldDeclaration` 含多个 `variableDeclarator` 时 MUST 拆成多条 `kind: 'field'` member，每条对应一个 declarator，共享相同 `type`、`annotations`、`modifiers`。若 declarator 含 `=` 且 initializer 可浅解析，MUST 设置该 member 的 `defaultValue`；否则 MUST 省略 `defaultValue`。

#### Scenario: 字面量默认值
- **WHEN** 字段为 `private static final String uuid = "123"`
- **THEN** 对应 field member 含 `name: 'uuid'`、`defaultValue: '123'`

#### Scenario: 无 initializer
- **WHEN** 字段为 `private String name`
- **THEN** field member 含 `name: 'name'` 且无 `defaultValue`

#### Scenario: 多 declarator 拆分
- **WHEN** 字段为 `private int a = 1, b = 2`
- **THEN** `ownMembers` 含两条 field：`{ name: 'a', defaultValue: 1, ... }` 与 `{ name: 'b', defaultValue: 2, ... }`，且二者 `type` 与 `modifiers` 相同

### Requirement: Java8 结构化方法头

方法（及构造器）MUST 含结构化 `parameters: ParameterModel[]`（数组顺序与源码一致；每项含 `name`、`type`、`annotations`（Record，无注解为 `{}`）、`modifiers`、`varargs?`）。方法 `annotations` MUST 为 Record。方法 MUST 含 `returnType`（TypeSignature 或 void）、可选 `typeParameters`、可选 `throwsTypes`（TypeSignature 数组）、可选 `returnDimensions`（返回数组维度）。MUST NOT 含 `params` 或 `throws` 字符串字段。

#### Scenario: 完整方法头
- **WHEN** 类含 `@Skip(c=true) public <T> T[] foo(String s) throws IOException`
- **THEN** method 的 `annotations` 为 `{ Skip: { c: true } }`、modifiers `['public']`、`typeParameters`、`returnType`、`returnDimensions: 1`、`parameters` 一项、`throwsTypes` 含 `IOException`

#### Scenario: 可变参数
- **WHEN** 方法含 `void bar(String... args)`
- **THEN** 对应 parameter 的 `varargs` 为 `true`

#### Scenario: 参数顺序
- **WHEN** 方法含 `void setH(int a, int b, int c)`
- **THEN** `parameters[0].name` 为 `a`、`parameters[1].name` 为 `b`、`parameters[2].name` 为 `c`

### Requirement: Java8 注解元素 defaultValue

`@interface` 内 annotationTypeElementDeclaration MUST 提取 `defaultValue`（当存在 `default elementValue` 且可浅解析时），类型 MUST 为 TypeSignature。

#### Scenario: 注解元素默认值
- **WHEN** `@interface Api { String value() default ""; }`
- **THEN** annotationElement 含 `name: 'value'`、`type` 为 String、`defaultValue: ''`
