## MODIFIED Requirements

### Requirement: Java8 签名提取

项目 SHALL 提供 `java8.signatures(input: string): FileModel`，返回文件中所有顶层及 nested 类型的结构化签名树。FileModel MUST 包含 `types: TypeModel[]`。每个 TypeModel MUST 包含：`kind`（`'class'` | `'interface'` | `'enum'` | `'annotation'`）、`name`、`annotations`（AnnotationModel 数组）、`modifiers`（仅 Java keyword，如 `public`/`static`）、`typeParameters`（可选 TypeParameterModel 数组）、`extendsType`（可选 TypeSignature）、`implementsTypes`（可选 TypeSignature 数组）、`ownMembers`、`nestedTypes`。MUST NOT 包含已废弃的扁平字段：`extends`（string）、`implements`（string[]）、字符串版 `typeParameters`、或与注解混排的 `modifiers`。

#### Scenario: 类签名含 extends 与 implements
- **WHEN** 输入 `class Child extends Parent implements Serializable { }`
- **THEN** 对应 TypeModel 的 `name` 为 `Child`、`extendsType.name` 为 `Parent`、`implementsTypes[0].name` 为 `Serializable`

#### Scenario: nested 类型出现在 nestedTypes
- **WHEN** 类体内声明 `class Inner { }`
- **THEN** 外层 TypeModel 的 `nestedTypes` 含名为 `Inner` 的子 TypeModel

#### Scenario: 泛型 extends 结构化
- **WHEN** 输入 `class Foo extends Bar<String> implements Baz<List<T>> { }`
- **THEN** `extendsType` 为 `{ kind: 'class', name: 'Bar', typeArguments: [{ kind: 'class', name: 'String' }] }`，`implementsTypes[0].typeArguments` 含 `List` 与 `T` 的嵌套结构

### Requirement: Java8 ownMembers 成员类型

ownMembers SHALL 支持以下成员种类：字段（field）、方法（method）、构造器（constructor）、enum 常量（enum constant）、接口常量（interface constant）、注解元素（annotation element）。提取 MUST 以结构化字段描述签名（TypeSignature、AnnotationModel、ParameterModel 等），MUST NOT 使用扁平 `type`/`params`/`signature`/`throws`/`names` 字符串字段。MUST NOT 深入方法体；字段 initializer 与注解 elementValue 仅按浅解析规则提取 defaultValue。

#### Scenario: 方法签名不含方法体
- **WHEN** 类含 `public void bar(int x) { System.out.println(x); }`
- **THEN** ownMembers 中 method 含 `name: bar`、`parameters` 含一项 `{ name: x, type: { kind: 'primitive', name: 'int' } }`，且不解析方法体内语句

#### Scenario: 构造器签名
- **WHEN** 类含 `public Foo(String s) { }`
- **THEN** ownMembers 含 constructor 成员且 `parameters` 含 `{ type: { kind: 'class', name: 'String' }, name: s }`

#### Scenario: enum 常量
- **WHEN** enum 含 `A, B(1)`
- **THEN** ownMembers 含 enum constant `A` 与 `B`

## ADDED Requirements

### Requirement: Java8 结构化注解

签名提取 MUST 将注解从 keyword 修饰符中分离。每个 AnnotationModel MUST 含 `name`（注解类型简单名）与 `attributes`（键值对象）。marker 注解（`@Name` 无括号）MUST 使 `attributes` 为空对象 `{}`。单元素注解（`@Name(value)` 仅一个 elementValue）MUST 将 attributes 设为 `{ value: <parsed> }`（隐式 key 为 `value`）。normal 注解 MUST 按 `elementValuePair` 解析每个 key/value。注解 MAY 出现在类型、字段、方法、参数、泛型参数等 modifier 位置。

#### Scenario: marker 注解
- **WHEN** 字段含 `@ESDocument` 与 `private int age`
- **THEN** 字段 `annotations` 含 `{ name: 'ESDocument', attributes: {} }`，`modifiers` 为 `['private']`

#### Scenario: 单元素注解默认 key
- **WHEN** 类含 `@ApiModel("用户信息")`
- **THEN** 类 `annotations` 含 `{ name: 'ApiModel', attributes: { value: '用户信息' } }`

#### Scenario: normal 注解多属性
- **WHEN** 字段含 `@ApiModelProperty(value = "用户名", required = true)`
- **THEN** `attributes` 为 `{ value: '用户名', required: true }`

#### Scenario: 参数上的注解
- **WHEN** 方法含 `void setH(@H(p = "dd") int a)`
- **THEN** 对应 parameter 的 `annotations` 含 `{ name: 'H', attributes: { p: 'dd' } }`

### Requirement: Java8 注解值浅解析

`elementValue` 与字段 initializer 的解析 MUST 限于：字面量（string/number/boolean/char）、嵌套 AnnotationModel、数组字面量（`{ ... }` 内的上述形态）。若值为其他 `conditionalExpression`（方法调用、`new`、SpEL 等），MUST 省略该 attribute 或 `defaultValue` 字段，MUST NOT 递归进入表达式子树。

#### Scenario: 字面量与布尔属性
- **WHEN** 注解含 `required = true`
- **THEN** `attributes.required` 为布尔 `true`

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

字段 member MUST 使用 `declarators: { name, defaultValue? }[]` 描述每个 variableDeclarator，MUST NOT 使用 `names: string[]`。若 declarator 含 `=` 且 initializer 为可浅解析字面量或数组/注解字面量，MUST 设置 `defaultValue`；否则 MUST 省略 `defaultValue`。MUST NOT 将 initializer 文本拼入任何 signature 字符串字段。

#### Scenario: 字面量默认值
- **WHEN** 字段为 `private static final String uuid = "123"`
- **THEN** `declarators` 含 `{ name: 'uuid', defaultValue: '123' }`

#### Scenario: 无 initializer
- **WHEN** 字段为 `private String name`
- **THEN** `declarators` 含 `{ name: 'name' }` 且无 `defaultValue`

#### Scenario: 多 declarator
- **WHEN** 字段为 `private int a = 1, b = 2`
- **THEN** `declarators` 含 `{ name: 'a', defaultValue: 1 }` 与 `{ name: 'b', defaultValue: 2 }`

### Requirement: Java8 结构化方法头

方法（及构造器）MUST 含结构化 `parameters: ParameterModel[]`（每项含 `name`、`type`、`annotations`、`modifiers`、`varargs?`）。方法 MUST 含 `returnType`（TypeSignature 或 void）、可选 `typeParameters`、可选 `throwsTypes`（TypeSignature 数组）、可选 `returnDimensions`（返回数组维度）。MUST NOT 含 `params` 或 `throws` 字符串字段。

#### Scenario: 完整方法头
- **WHEN** 类含 `@Skip(c=true) public <T> T[] foo(String s) throws IOException`
- **THEN** method 含注解 `Skip`、modifiers `['public']`、`typeParameters`、`returnType`、`returnDimensions: 1`、`parameters` 一项、`throwsTypes` 含 `IOException`

#### Scenario: 可变参数
- **WHEN** 方法含 `void bar(String... args)`
- **THEN** 对应 parameter 的 `varargs` 为 `true`

### Requirement: Java8 注解元素 defaultValue

`@interface` 内 annotationTypeElementDeclaration MUST 提取 `defaultValue`（当存在 `default elementValue` 且可浅解析时），类型 MUST 为 TypeSignature。

#### Scenario: 注解元素默认值
- **WHEN** `@interface Api { String value() default ""; }`
- **THEN** annotationElement 含 `name: 'value'`、`type` 为 String、`defaultValue: ''`
