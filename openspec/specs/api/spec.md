# api Specification

## Purpose
定义 Model → ApiSchema 转换产品线：随机唯一节点 id（`API.snowflakeId`）与 Java8 源文件 → ApiSchema 字段树（`API.java8ToApiSchema`）。实现位于 `src/parser/api/`，依赖 `JAVA8.signatures` 解析层，不包含 ANTLR grammar 变更。

## Requirements

### Requirement: api 命名空间导出

`src/parser/api/index.js` SHALL 定义并 export `API` 命名空间对象（非小写 `api`），至少含 `snowflakeId` 与 `java8ToApiSchema` 两个函数；`src/index.js` SHALL re-export 该 `API`。MUST NOT 在 `JAVA8` 命名空间或顶层 export 中再提供等价函数。

#### Scenario: API 命名空间可导入

- **WHEN** 在 ESM 模块中 `import { API } from './src/index.js'`
- **THEN** `API.snowflakeId` 与 `API.java8ToApiSchema` 均为函数

#### Scenario: API 自 package barrel 定义

- **WHEN** 查看 `src/parser/api/index.js`
- **THEN** 定义 `export const API = { snowflakeId, java8ToApiSchema }`（或等价），且含 `API` / `java8ToApiSchema` 用法 JSDoc

### Requirement: API.snowflakeId 随机唯一标识

项目 SHALL 通过 `API.snowflakeId(): string` 提供随机唯一 id。每次调用 MUST 返回新的非空字符串，且在单次进程内已生成的 id MUST 互不重复。实现 MUST NOT 使用 Twitter Snowflake 64 位位布局；MAY 使用 `crypto.randomUUID()` 或等价随机源。`snowflakeId` 实现 MUST 位于 `src/parser/api/java8/java8-to-api-schema.js` 并 export，由 `src/parser/api/index.js` re-export。

#### Scenario: 连续调用产生不同 id

- **WHEN** 连续两次调用 `API.snowflakeId()`
- **THEN** 两次返回值均为非空字符串且互不相等

### Requirement: API.java8ToApiSchema 多文件输入

项目 SHALL 提供 `API.java8ToApiSchema(inputs: string | string[], options?: { rootClass?: string }): ApiSchemaNode[]`。`inputs` 为单个 Java 源字符串或字符串数组；对每个字符串 MUST 调用 `JAVA8.signatures()` 得到 `FileModel`，并将所有文件的顶层 `types[]` 合并为 class 索引（按类型简单名 `name` 映射到 `TypeModel`）。若多文件存在同名顶层类，后出现的文件 MUST 覆盖先出现的定义。

`options.rootClass` 可选；省略时 MUST 对 `Array.isArray(inputs) ? inputs[0] : inputs` 调用 `JAVA8.firstClassName` 作为根类名。若根类名在 class 索引中不存在，MUST 抛出 `Error`（或 ParseError）并说明找不到根类。

#### Scenario: 单文件默认根类

- **WHEN** `API.java8ToApiSchema(test.java.text)` 且文件首个顶层类为 `User`
- **THEN** 返回 `User` 类字段展开后的 ApiSchemaNode 数组

#### Scenario: 指定根类

- **WHEN** `API.java8ToApiSchema(inputs, { rootClass: 'UserDetail' })`
- **THEN** 返回以 `UserDetail` 为根展开的 ApiSchemaNode 数组

#### Scenario: 多文件合并索引

- **WHEN** `API.java8ToApiSchema([user.java, tbUser.java])` 且 `tbUser.java` 定义顶层类 `TbUser`
- **THEN** class 索引含两个文件的全部顶层类型，且引用 `TbUser` 的字段可展开其字段

### Requirement: API.java8ToApiSchema 仅展开字段

`API.java8ToApiSchema` MUST 仅遍历根类 `ownMembers` 中 `kind === 'field'` 的成员（含 static 字段）。MUST NOT 包含 method、constructor 或其他成员种类。字段顺序 MUST 与 `ownMembers` 中 field 出现顺序一致。

#### Scenario: 方法不出现在 API Schema

- **WHEN** 根类含 `public String getName()` 与 `private String name` 字段
- **THEN** 输出数组含 `name` 节点，不含 `getName`

#### Scenario: static 字段保留

- **WHEN** 根类含 `private static final String uuid`
- **THEN** 输出数组含 `key: 'uuid'` 的节点

### Requirement: API.java8ToApiSchema baseTypeMap

`API.java8ToApiSchema` MUST 使用以下基础类型映射（类简单名或 primitive 名 → API type 字符串）：

`String→String`、`Boolean→Boolean`、`LocalDateTime→String`、`MultipartFile→File`、`int→Number`、`Integer→Number`、`Long→Number`、`Double→Number`、`Float→Number`。

未命中映射且非 `List`/`Map` 的 class 类型 MUST 视为 `{ kind: 'object', type: className }`。class 索引中无该类型定义时 MUST 输出 `type: 'Object'` 的叶子节点（无 `children`），且不抛出错误、不输出警告。

#### Scenario: int 映射为 Number

- **WHEN** 字段类型为 primitive `int`
- **THEN** 节点 `type` 为 `'Number'`

#### Scenario: 未知类为叶子 Object

- **WHEN** 字段类型为 `TbUser` 且 class 索引中无 `TbUser`
- **THEN** 节点 `type` 为 `'Object'`，无 `children`

### Requirement: API.java8ToApiSchema List 与 Map 展开

- `List<T>` MUST 映射为 `type: 'List'`，且 MUST 含唯一子节点：`index: 0`，`key` 省略，对 `T` 递归展开
- `Map<K,V>` MUST 映射为 `type: 'Object'`，且 MUST 含唯一子节点：`index: 0`，对 `V`（value 类型）递归展开；MUST 忽略 key 类型 `K`
- List/Map 包装层 MUST NOT 将 wrapper 名追加到环检测 path

#### Scenario: List 元素模板

- **WHEN** 字段类型为 `List<UserDetail>`
- **THEN** 节点 `type` 为 `'List'`，`children[0].index` 为 `0`，且子树展开 `UserDetail` 字段

#### Scenario: Map 仅展开 value

- **WHEN** 字段类型为 `Map<String, UserDetail>`
- **THEN** 节点 `type` 为 `'Object'`，`children[0]` 展开 `UserDetail` 字段结构

### Requirement: API.java8ToApiSchema 注解 desc 与 check

每个字段节点 MUST 设置 `check` 为 `@ApiModelProperty.required === true`，否则为 `false`。`desc` MUST 优先取字段 `annotations.ApiModelProperty.value`；若缺失且类型为 object（或 List/Map 内层 object），MAY 取目标类 `annotations.ApiModel.value`。

#### Scenario: required 映射为 check

- **WHEN** 字段含 `@ApiModelProperty(value = "用户名", required = true)`
- **THEN** 节点 `check` 为 `true` 且 `desc` 为 `'用户名'`

#### Scenario: 无 required 时 check 为 false

- **WHEN** 字段含 `@ApiModelProperty("年龄")` 且无 `required`
- **THEN** 节点 `check` 为 `false` 且 `desc` 为 `'年龄'`

### Requirement: API.java8ToApiSchema 继承 field 合并

展开 class object 类型时，`API.java8ToApiSchema` MUST 使用 **effectiveFields** 而非仅 `ownMembers`。effectiveFields MUST 沿 `extendsType` 链向上收集各层 `kind === 'field'` 成员；合并时 **子类 field 同名覆盖父类**。输出 field 顺序 MUST 为：从祖先到子孙逐层 emit，每个 field 名仅出现一次（最终生效的为子类声明）。若某层 `extendsType` 指向 classMap 中不存在的类型，MUST 在该处终止继承链。

#### Scenario: 子类含父类字段

- **WHEN** `UserP extends User`，`User` 含 field `name`，`UserP` 含 field `id`
- **THEN** 展开 `UserP` 的 ApiSchema 节点 children 同时含 `name` 与 `id` 字段节点

#### Scenario: 子类覆盖父类同名字段

- **WHEN** `Child extends Parent` 且二者均声明 field `name`（类型或注解不同）
- **THEN** 展开 `Child` 时 `name` 节点对应 `Child.ownMembers` 中的 field 定义

#### Scenario: 父类不在 classMap

- **WHEN** `Child extends External` 且 classMap 无 `External`
- **THEN** 展开 `Child` 仅含 `Child.ownMembers` 中的 field

### Requirement: API.java8ToApiSchema 循环引用检测

展开 object 类型时 MUST 维护 path 栈（已展开的类型简单名列表）。当 `typeName` **尚未**在 path 中时，MUST 将 `typeName` 追加到 path，并使用 **effectiveFields** 递归展开全部 field（见继承 field 合并 requirement）。当 `typeName` **已在** path 中（回边）时，MUST 仍创建当前 Object 节点，且 MUST 展开 effectiveFields，但 MUST **排除** 字段类型 object 核（含 `List`/`Map` 内层递归）等于 **fromType** 的 field——其中 `fromType` 为进入当前 field 递归前所在 object 的类型名。排除后若无剩余 field，MAY 不设置 `children`。MUST NOT 使用固定 maxDepth 截断。List/Map 包装层 MUST NOT 将 wrapper 追加到 path；进入 List/Map 内层 object 时 MUST 传递与进入该 List/Map 字段前相同的 `fromType`。

#### Scenario: 自引用 List 回边展开但排除 child

- **WHEN** `User` 含 `List<User> child` 且递归展开内层 `User`
- **THEN** 内层 `User` 节点含 `uuid`、`name` 等 effectiveFields，但 **不含** `child` 字段节点

#### Scenario: 互引 A-B-A 回边排除

- **WHEN** `A` 含 `B b`，`B` 含 `A a`，且展开路径为 `A → B → A`
- **THEN** 第二次 `A` 节点含 `A` 的 effectiveFields 中除 `b` 外的 field（如 `nameA`），且 **不含** `b` 字段节点

#### Scenario: 互引 B 侧仍完整

- **WHEN** 展开路径 `A → B` 且 `B` 含 `A a` 与 `String nameB`
- **THEN** `B` 节点 children 含 `a` 与 `nameB`

### Requirement: API.java8ToApiSchema 节点结构

每个 ApiSchemaNode MUST 含 `id`（`API.snowflakeId()` 字符串）、`parentId`（根层为 number `0`，子层为父节点 id 字符串）、`type`、`check`。字段节点 MUST 含 `key`（字段名）。List/Map 元素模板节点 MUST 含 `index: 0` 且 MUST 省略 `key`。可选字段：`desc`、`children`。

#### Scenario: 根节点 parentId

- **WHEN** 展开根类顶层字段
- **THEN** 每个根节点 `parentId` 为 `0`

#### Scenario: 子节点 parentId 为父 id

- **WHEN** 字段含嵌套 children
- **THEN** 每个子节点 `parentId` 等于其直接父节点的 `id` 字符串

### Requirement: API.java8ToApiSchema 不索引 nestedTypes

class 索引 MUST 仅由 `FileModel.types[]`（compilationUnit 顶层类型）构建。`TypeModel.nestedTypes` MUST NOT 加入索引。

#### Scenario: 内嵌类不可引用

- **WHEN** `User` 内嵌 `class User2` 且其他字段类型为 `User2`
- **THEN** class 索引中无 `User2`，对应字段为叶子 Object

### Requirement: api 模块目录布局

ApiSchema 转换实现 MUST 位于 `src/parser/api/`。Java8 来源的转换模块 MUST 位于 `src/parser/api/java8/`。`snowflakeId` MUST 与 `java8ToApiSchema` 同位于 `java8-to-api-schema.js`（export 后由 `index.js` 聚合）。`src/parser/java8/` MUST NOT 含 toApiSchema 实现文件。

#### Scenario: api 目录结构

- **WHEN** 查看 `src/parser/api/`
- **THEN** 存在 `index.js` 与 `java8/` 子目录，且 `java8/` 含 `java8-to-api-schema.js`（export `snowflakeId` 与 `java8ToApiSchema`）；不存在独立的 `snowflake-id.js`
