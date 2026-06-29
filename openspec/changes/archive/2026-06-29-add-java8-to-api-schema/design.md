## Context

项目已通过 `java8.signatures()` 将 Java8 源文件解析为 `FileModel` AST（顶层 `types[]`、字段 `ownMembers`、结构化 `TypeSignature` 与 `AnnotationMap`）。业务侧需要将 Java Model 类（含 Swagger `@ApiModel` / `@ApiModelProperty`）转为 API 参数/字段树 JSON（`api.json` 形态），供接口文档或参数编辑 UI 使用。

既有伪代码实现（`javaCodeToDocument` + `buildNode`）已验证业务规则；本 change 将其移植到当前 ESM 项目，数据源改为 `FileModel`，不修改 ANTLR grammar。

## Goals / Non-Goals

**Goals:**

- 提供 `java8.toApiSchema(inputs, options?)`，支持单字符串或字符串数组（多文件合并 class 索引）
- 提供 `snowflakeId()`：随机唯一字符串 id（命名保留，非 Twitter Snowflake 位布局）
- 按既定 `baseTypeMap` 映射基础类型；未知类静默为叶子 Object
- path 栈环检测（A↔B 互引时不死循环）
- 集成测试覆盖结构输出（不含 id golden）

**Non-Goals:**

- 不修改 `signatures()` / `firstClassName()` 行为
- 不索引 `nestedTypes`（内嵌类不进 classMap，与伪代码一致）
- 不引入新 npm 依赖
- 不实现 `javaCodeToDocument` 别名或 debounce 版 className 提取

## Decisions

### 1. 三层流水线：Java → AST → API

```
inputs[] → signatures(each) → merge top-level types → buildNode(root) → ApiNode[]
```

- **理由**: AST 层已存在，转换层纯函数，易测、与 parser 解耦
- **备选**: 在 Visitor 内直接 emit API 节点 — 拒绝，职责混杂

### 2. 多文件 inputs 合并 classMap

```javascript
for (const fm of fileModels)
  for (const t of fm.types)
    classMap[t.name] = t  // 同名后者覆盖
```

- **理由**: 支持 `TbUser` 等类型定义在其他文件时被展开
- **备选**: 仅单文件 — 拒绝，用户明确要求 `inputs[]`

### 3. classMap 仅含顶层 types

`FileModel.types[]` 入 map；`TypeModel.nestedTypes` 不入 map。

- **理由**: 与伪代码 `parseJava → classes[]` 一致；`User2` 等内嵌类不参与引用解析

### 4. TypeSignature 适配为内部 parsed 形态

```
primitive / baseTypeMap class → { kind: 'base', type }
其他 class name              → { kind: 'object', type: name }
List<T>                      → { kind: 'list', inner: parse(T) }
Map<K,V>                     → { kind: 'map', inner: parse(V) }  // 仅 value
```

- **理由**: 复用已验证的 `buildNode` 递归逻辑，最小改动

### 5. buildNode 环检测：path 栈

对 `kind: 'object'` 展开时，若 `path.includes(typeName)` 则返回当前节点（无 children）。List/Map 分支不扩展 path，仅向子节点传递当前 path。

- **理由**: 伪代码已验证；比 memo cache 更简单
- **备选**: 全局 cache 复用子树 — 拒绝，与 id 分配和 parentId 纠缠

### 6. baseTypeMap（固定，不扩展）

```javascript
{
  String: 'String', Boolean: 'Boolean', LocalDateTime: 'String', MultipartFile: 'File',
  int: 'Number', Integer: 'Number', Long: 'Number', Double: 'Number', Float: 'Number',
}
```

未命中且非 List/Map 的 class → object；classMap 无定义 → 叶子 Object（无 children、无报错）。

primitive `int` 等通过 `kind: 'primitive'` 映射到 Number（与 wrapper 类共用 baseTypeMap 规则）。

### 7. 节点字段语义

| 字段 | 规则 |
|------|------|
| `id` | `snowflakeId()` 字符串 |
| `parentId` | 根层 `0`（number）；子层父节点 id（string） |
| `key` | 字段名；List/Map 元素模板节点省略 key |
| `type` | base 映射值 / `List` / `Object` |
| `check` | `@ApiModelProperty.required === true`，否则 `false` |
| `desc` | 字段 `@ApiModelProperty.value`；否则目标类 `@ApiModel.value` |
| `index` | List/Map 子模板节点为 `0` |
| `children` | 可选，递归子节点 |

仅 `ownMembers` 中 `kind === 'field'` 参与展开（含 static 字段；排除 method/constructor）。

### 8. snowflakeId 实现

使用 `crypto.randomUUID()`（或等价随机唯一 string）。每次 `buildNode` 调用一次。

- **理由**: 用户明确要求非位运算雪花；UUID 零依赖
- **测试**: 不断言 id 具体值；断言非空、全局唯一、结构 golden

### 9. 公开 API 命名

- `java8.toApiSchema(inputs, options?)` — `inputs` 为 `string | string[]`；`options.rootClass` 可选
- 省略 `rootClass` 时，对 `inputs[0]` 调用 `firstClassName` 作为根类名；若无则抛错或返回 `[]`（spec 中定为 ParseError 或明确错误 — 见 spec：根类不存在时抛错）

### 10. 模块布局

```
src/parser/core/snowflake-id.js
src/parser/java8/base-type-map.js
src/parser/java8/type-to-parsed.js
src/parser/java8/to-api-schema.js
src/index.js  — export java8.toApiSchema, snowflakeId
```

## Risks / Trade-offs

- **[Risk] 同名类多文件覆盖** → 文档化「后者覆盖」；未来可加冲突警告（非本 change）
- **[Risk] id 随机导致 golden 不稳定** → 结构 golden strip id/parentId；单独 assert id 格式与唯一性
- **[Risk] TbUser 等外部类单文件时为叶子** → 符合设计；多文件 inputs 可展开
- **[Risk] check 语义与旧 api.json 样例不一致** → 以伪代码 `required || false` 为准，更新 golden

## Migration Plan

1. 实现模块并导出 API
2. 添加 `test/resources/golden/test.java.api.structure.json`（无 id）
3. `test/run.mjs` 新增 case
4. 归档 change 后 sync 至 `openspec/specs/`

无运行时 migration；纯新增 API。

## Open Questions

（无 — 探索阶段已闭合）
