## ADDED Requirements

### Requirement: Java8 toApiSchema 继承 field 合并

展开 class object 类型时，`toApiSchema` MUST 使用 **effectiveFields** 而非仅 `ownMembers`。effectiveFields MUST 沿 `extendsType` 链向上收集各层 `kind === 'field'` 成员；合并时 **子类 field 同名覆盖父类**。输出 field 顺序 MUST 为：从祖先到子孙逐层 emit，每个 field 名仅出现一次（最终生效的为子类声明）。若某层 `extendsType` 指向 classMap 中不存在的类型，MUST 在该处终止继承链。

#### Scenario: 子类含父类字段

- **WHEN** `UserP extends User`，`User` 含 field `name`，`UserP` 含 field `id`
- **THEN** 展开 `UserP` 的 ApiSchema 节点 children 同时含 `name` 与 `id` 字段节点

#### Scenario: 子类覆盖父类同名字段

- **WHEN** `Child extends Parent` 且二者均声明 field `name`（类型或注解不同）
- **THEN** 展开 `Child` 时 `name` 节点对应 `Child.ownMembers` 中的 field 定义

#### Scenario: 父类不在 classMap

- **WHEN** `Child extends External` 且 classMap 无 `External`
- **THEN** 展开 `Child` 仅含 `Child.ownMembers` 中的 field

## MODIFIED Requirements

### Requirement: Java8 toApiSchema 循环引用检测

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
