## Context

`java8.toApiSchema` 将 `FileModel` 转为 ApiSchemaNode 树。当前实现：
- 仅读取 `TypeModel.ownMembers` 中的 field
- 使用 `path: string[]` 检测环；`path.includes(typeName)` 时返回无 children 的叶子 Object

`signatures()`  deliberately 不合并继承成员（`ownMembers` 语义）。API 文档展开层需要不同的 **effective field** 视图。

## Goals / Non-Goals

**Goals:**

- 展开 class 时使用 **effectiveFields**（extends 链合并）
- 环回边时 **展开 + 排除 fromType 字段**，而非空叶子
- 保持 path 栈、List/Map path 不扩展、unknown 类叶子等行为不变
- 更新 structure golden 与集成测试

**Non-Goals:**

- 不修改 `signatures()` / FileModel 语义
- 不处理 interface `implements` 多继承 field（Java class 单继承足够）
- 不在本 change 实现 `toJson5`（留给 `add-java8-to-json5`）

## Decisions

### 1. effectiveFields 合并规则

```javascript
function effectiveFields(typeName, classMap) {
  // 自底向上收集: [User, UserP] for UserP extends User
  const chain = [];
  for (let t = classMap[typeName]; t; t = t.extendsType ? classMap[t.extendsType.name] : undefined)
    chain.unshift(t);  // [User, UserP]

  const byName = new Map();
  for (const t of chain) {
    for (const m of t.ownMembers.filter(m => m.kind === 'field'))
      byName.set(m.name, m);  // 后者覆盖
  }
  // 输出顺序: 按 chain 从父到子依次 emit，同名只 emit 一次（最终为子类 field）
  ...
}
```

- **理由**: `UserP` 展开应含 `User` 全部 field + `UserP` 独有/覆盖 field
- **extends 不在 classMap**: 链在该处终止，仅已知父类参与合并

### 2. fromType 回边排除

`buildNode(..., path, fromType?)`

```
展开 object T:
  if path.includes(T):
    fields = effectiveFields(T).filter(f => !fieldReferencesType(f.type, fromType))
  else:
    fields = effectiveFields(T)

  对每个 field F:
    buildNode(..., path + [T], fromType = T)
```

`fieldReferencesType(typeSig, fromType)`:
- 解析 TypeSignature 的 **object 核类型名**（List/Map 递归到内层 class）
- 若任一核等于 `fromType` → 排除

**示例 A↔B:**

```
A.b → B (path [A], fromType A)
  B.a → A 在 path 中 (fromType B)
    → 展开 A fields 排除 type=B 的 `b`
    → 保留 nameA 等
```

**示例 User.child 自引用:**

```
User.child → List → User (path [User], fromType User)
  → 展开 User effectiveFields 排除 type=User 的 `child`
  → 保留 uuid, name, userDetail, ...
```

### 3. 首次进入 vs 回边

| 条件 | 行为 |
|------|------|
| `!path.includes(T)` | 正常展开全部 effectiveFields |
| `path.includes(T)` && `fromType` 有值 | 展开 effectiveFields 排除 fromType 引用 |
| `path.includes(T)` && 无 `fromType` | 保守：空叶子（不应出现于 object 展开） |

List/Map 子节点调用 `buildNode(inner, ..., path, fromType)` — **fromType 仍为父 object 的 T**，不是 List。

### 4. 模块布局

```
src/parser/java8/effective-fields.js   // effectiveFields, fieldReferencesType
src/parser/java8/to-api-schema.js      // buildNode 集成
```

### 5. 测试与 golden

- 重新生成 `test/resources/golden/test.java.api.structure.json`
- 新增 assert（可选）：`userP` 节点含 `name`（来自 User）；内层 `child` 模板无 `child` 子 field

## Risks / Trade-offs

- **[Risk] 输出 BREAKING** → 仅 structure golden；文档说明
- **[Risk] 深环仍可能较大树** → 每层回边至少排除一条边，保证有限
- **[Risk] Map/List 内 fromType 匹配** → 单元级用 `fieldReferencesType` 测 List\<User\>, Map\<String,User\>

## Migration Plan

1. 实现 effectiveFields + fromType 逻辑
2. 更新 golden
3. `npm test` + `openspec validate`

## Open Questions

（无）
