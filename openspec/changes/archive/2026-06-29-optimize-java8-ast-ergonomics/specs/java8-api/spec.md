## MODIFIED Requirements

### Requirement: Java8 签名提取

项目 SHALL 提供 `java8.signatures(input: string): FileModel`，返回文件中所有顶层及 nested 类型的结构化签名树。FileModel MUST 包含 `types: TypeModel[]`。每个 TypeModel MUST 包含：`kind`（`'class'` | `'interface'` | `'enum'` | `'annotation'`）、`name`、`annotations`（`Record<string, AnnotationAttrs>`，无注解时为 `{}`）、`modifiers`（仅 Java keyword，如 `public`/`static`）、`typeParameters`（可选 TypeParameterModel 数组）、`extendsType`（可选 TypeSignature）、`implementsTypes`（可选 TypeSignature 数组）、`ownMembers`、`nestedTypes`。MUST NOT 使用 `AnnotationModel[]` 或 `{ name, attributes }` 包装形态。

#### Scenario: 类签名含 extends 与 implements
- **WHEN** 输入 `class Child extends Parent implements Serializable { }`
- **THEN** 对应 TypeModel 的 `name` 为 `Child`、`extendsType.name` 为 `Parent`、`implementsTypes[0].name` 为 `Serializable`

#### Scenario: nested 类型出现在 nestedTypes
- **WHEN** 类体内声明 `class Inner { }`
- **THEN** 外层 TypeModel 的 `nestedTypes` 含名为 `Inner` 的子 TypeModel

#### Scenario: 泛型 extends 结构化
- **WHEN** 输入 `class Foo extends Bar<String> implements Baz<List<T>> { }`
- **THEN** `extendsType` 为 `{ kind: 'class', name: 'Bar', typeArguments: [{ kind: 'class', name: 'String' }] }`，`implementsTypes[0].typeArguments` 含 `List` 与 `T` 的嵌套结构

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

### Requirement: Java8 ownMembers 成员类型

ownMembers SHALL 支持以下成员种类：字段（field）、方法（method）、构造器（constructor）、enum 常量（enum constant）、接口常量（interface constant）、注解元素（annotation element）。接口常量 MUST 与字段相同：按 declarator 拆分为多条 member，每条含顶层 `name` 与可选 `defaultValue`。enum 常量与方法等的 `annotations` MUST 为 Record（无注解 `{}`）。

#### Scenario: enum 常量
- **WHEN** enum 含 `A, B(1)`
- **THEN** ownMembers 含 enum constant `A` 与 `B`

#### Scenario: 接口常量拆分
- **WHEN** 接口含 `int X = 1, Y = 2;`
- **THEN** ownMembers 含两条 interfaceConstant，分别为 `name: 'X'` 与 `name: 'Y'`
