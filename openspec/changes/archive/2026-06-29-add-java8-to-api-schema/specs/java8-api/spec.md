## ADDED Requirements

### Requirement: snowflakeId 随机唯一标识

项目 SHALL 提供 `snowflakeId(): string`，每次调用 MUST 返回新的非空字符串，且在单次进程内已生成的 id MUST 互不重复。实现 MUST NOT 使用 Twitter Snowflake 64 位位布局；MAY 使用 `crypto.randomUUID()` 或等价随机源。

#### Scenario: 连续调用产生不同 id

- **WHEN** 连续两次调用 `snowflakeId()`
- **THEN** 两次返回值均为非空字符串且互不相等

### Requirement: Java8 toApiSchema 多文件输入

项目 SHALL 提供 `java8.toApiSchema(inputs: string | string[], options?: { rootClass?: string }): ApiSchemaNode[]`。`inputs` 为单个 Java 源字符串或字符串数组；对每个字符串 MUST 调用 `java8.signatures()` 得到 `FileModel`，并将所有文件的顶层 `types[]` 合并为 class 索引（按类型简单名 `name` 映射到 `TypeModel`）。若多文件存在同名顶层类，后出现的文件 MUST 覆盖先出现的定义。

`options.rootClass` 可选；省略时 MUST 对 `Array.isArray(inputs) ? inputs[0] : inputs` 调用 `firstClassName` 作为根类名。若根类名在 class 索引中不存在，MUST 抛出 `Error`（或 ParseError）并说明找不到根类。

#### Scenario: 单文件默认根类

- **WHEN** `toApiSchema(test.java.text)` 且文件首个顶层类为 `User`
- **THEN** 返回 `User` 类字段展开后的 ApiSchemaNode 数组

#### Scenario: 指定根类

- **WHEN** `toApiSchema(inputs, { rootClass: 'UserDetail' })`
- **THEN** 返回以 `UserDetail` 为根展开的 ApiSchemaNode 数组

#### Scenario: 多文件合并索引

- **WHEN** `toApiSchema([user.java, tbUser.java])` 且 `tbUser.java` 定义顶层类 `TbUser`
- **THEN** class 索引含两个文件的全部顶层类型，且引用 `TbUser` 的字段可展开其字段

### Requirement: Java8 toApiSchema 仅展开字段

`toApiSchema` MUST 仅遍历根类 `ownMembers` 中 `kind === 'field'` 的成员（含 static 字段）。MUST NOT 包含 method、constructor 或其他成员种类。字段顺序 MUST 与 `ownMembers` 中 field 出现顺序一致。

#### Scenario: 方法不出现在 API Schema

- **WHEN** 根类含 `public String getName()` 与 `private String name` 字段
- **THEN** 输出数组含 `name` 节点，不含 `getName`

#### Scenario: static 字段保留

- **WHEN** 根类含 `private static final String uuid`
- **THEN** 输出数组含 `key: 'uuid'` 的节点

### Requirement: Java8 toApiSchema baseTypeMap

`toApiSchema` MUST 使用以下基础类型映射（类简单名或 primitive 名 → API type 字符串）：

`String→String`、`Boolean→Boolean`、`LocalDateTime→String`、`MultipartFile→File`、`int→Number`、`Integer→Number`、`Long→Number`、`Double→Number`、`Float→Number`。

未命中映射且非 `List`/`Map` 的 class 类型 MUST 视为 `{ kind: 'object', type: className }`。class 索引中无该类型定义时 MUST 输出 `type: 'Object'` 的叶子节点（无 `children`），且不抛出错误、不输出警告。

#### Scenario: int 映射为 Number

- **WHEN** 字段类型为 primitive `int`
- **THEN** 节点 `type` 为 `'Number'`

#### Scenario: 未知类为叶子 Object

- **WHEN** 字段类型为 `TbUser` 且 class 索引中无 `TbUser`
- **THEN** 节点 `type` 为 `'Object'`，无 `children`

### Requirement: Java8 toApiSchema List 与 Map 展开

- `List<T>` MUST 映射为 `type: 'List'`，且 MUST 含唯一子节点：`index: 0`，`key` 省略，对 `T` 递归展开
- `Map<K,V>` MUST 映射为 `type: 'Object'`，且 MUST 含唯一子节点：`index: 0`，对 `V`（value 类型）递归展开；MUST 忽略 key 类型 `K`
- List/Map 包装层 MUST NOT 将 wrapper 名追加到环检测 path

#### Scenario: List 元素模板

- **WHEN** 字段类型为 `List<UserDetail>`
- **THEN** 节点 `type` 为 `'List'`，`children[0].index` 为 `0`，且子树展开 `UserDetail` 字段

#### Scenario: Map 仅展开 value

- **WHEN** 字段类型为 `Map<String, UserDetail>`
- **THEN** 节点 `type` 为 `'Object'`，`children[0]` 展开 `UserDetail` 字段结构

### Requirement: Java8 toApiSchema 注解 desc 与 check

每个字段节点 MUST 设置 `check` 为 `@ApiModelProperty.required === true`，否则为 `false`。`desc` MUST 优先取字段 `annotations.ApiModelProperty.value`；若缺失且类型为 object（或 List/Map 内层 object），MAY 取目标类 `annotations.ApiModel.value`。

#### Scenario: required 映射为 check

- **WHEN** 字段含 `@ApiModelProperty(value = "用户名", required = true)`
- **THEN** 节点 `check` 为 `true` 且 `desc` 为 `'用户名'`

#### Scenario: 无 required 时 check 为 false

- **WHEN** 字段含 `@ApiModelProperty("年龄")` 且无 `required`
- **THEN** 节点 `check` 为 `false` 且 `desc` 为 `'年龄'`

### Requirement: Java8 toApiSchema 循环引用检测

展开 object 类型时 MUST 维护 path 栈（已展开的类型简单名列表）。若当前 object 的 `typeName` 已在 path 中，MUST 返回当前节点且不设置 `children`（叶子 Object）。否则 MUST 将 `typeName` 追加到 path 后递归展开 class 索引中该类的 field 成员。MUST NOT 使用固定 maxDepth 截断。

#### Scenario: 自引用 List

- **WHEN** `User` 含 `List<User> child` 且递归展开内层 `User` 再次遇到 `child` 字段
- **THEN** 内层 `child` 的 List 子模板在 path 含 `User` 时停止展开为叶子 Object

#### Scenario: 互引 A-B-A

- **WHEN** `A` 含 `B b`，`B` 含 `A a`
- **THEN** 展开 `B.a` 时因 path 已含 `A` 返回无 children 的 Object 节点

### Requirement: Java8 toApiSchema 节点结构

每个 ApiSchemaNode MUST 含 `id`（`snowflakeId()` 字符串）、`parentId`（根层为 number `0`，子层为父节点 id 字符串）、`type`、`check`。字段节点 MUST 含 `key`（字段名）。List/Map 元素模板节点 MUST 含 `index: 0` 且 MUST 省略 `key`。可选字段：`desc`、`children`。

#### Scenario: 根节点 parentId

- **WHEN** 展开根类顶层字段
- **THEN** 每个根节点 `parentId` 为 `0`

#### Scenario: 子节点 parentId 为父 id

- **WHEN** 字段含嵌套 children
- **THEN** 每个子节点 `parentId` 等于其直接父节点的 `id` 字符串

### Requirement: Java8 toApiSchema 不索引 nestedTypes

class 索引 MUST 仅由 `FileModel.types[]`（compilationUnit 顶层类型）构建。`TypeModel.nestedTypes` MUST NOT 加入索引。

#### Scenario: 内嵌类不可引用

- **WHEN** `User` 内嵌 `class User2` 且其他字段类型为 `User2`
- **THEN** class 索引中无 `User2`，对应字段为叶子 Object
