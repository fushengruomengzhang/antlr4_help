## Context

`java8.signatures()` 已输出结构化 AST（TypeSignature、AnnotationModel 数组、declarators 数组等）。下游典型访问为「取某注解属性」「取字段名/默认值」，当前需数组遍历。本 change 在 parser 逻辑基本不变的前提下，调整 JSON 形状以 O(1) 查询。

约束：
- breaking change，不保留旧字段兼容层
- 假定无同名注解重复
- modifiers 保持 `string[]`；parameters 保持数组保序

## Goals / Non-Goals

**Goals:**

- 全树统一 `annotations: Record<string, AnnotationAttrs>`
- field / interfaceConstant：`name` + `defaultValue?` 在 member 顶层；多 declarator 拆成多条 member
- parameter.annotations 同样为 Record
- 无注解时 `annotations: {}`（非 `[]`、不省略）

**Non-Goals:**

- modifiers 改为 Set/Record
- parameters 改为 Record（需保序）
- ownMembers 索引化或按 kind 分组
- 支持同名注解多实例

## Decisions

### 1. AnnotationMap 形状

```javascript
// AnnotationAttrs = 原 attributes 对象（属性键值）
type AnnotationMap = Record<string, AnnotationAttrs>

// marker:  { ESDocument: {} }
// single:  { ApiModel: { value: "用户信息" } }
// normal:  { ApiModelProperty: { value: "...", required: true } }
```

- 删除 `AnnotationModel` typedef（`name` + `attributes` 包装）
- `extractAnnotation` 改为产出 `[simpleName, attrs]` 或直接写入 map；新增 `buildAnnotationMap(modifierCtxs[])` 合并多个注解

### 2. 字段拆分策略

```javascript
// fieldDeclaration → N 个 field member（N = variableDeclarator 数量）
for (const declarator of variableDeclaratorList) {
  ownMembers.push({
    kind: 'field',
    name: declarator.id,
    defaultValue?: shallowParse(declarator.init),
    type,           // 共享
    annotations,    // 共享（Record）
    modifiers,      // 共享
  });
}
```

- `private int a = 1, b = 2` → 两条 field，`type`/`annotations`/`modifiers` 相同
- 丢失「同一行声明」分组；可接受（下游按 `name` 索引）

### 3. 不变部分

| 字段 | 形状 |
|------|------|
| `modifiers` | `string[]` |
| `parameters` | `ParameterModel[]`（顺序与源码一致） |
| `typeParameters` | `TypeParameterModel[]` |
| `TypeSignature` | 不变 |
| `ownMembers` | `MemberModel[]`（field 条目可能变多） |

### 4. TypeParameterModel.annotations

若形参含注解，使用同一 `AnnotationMap` 形状（仍为可选字段；无则省略或 `{}`——与 field 统一用 `{}` 当无注解时出现在 type/field/method 层；typeParameter 无注解时省略 `annotations` 字段以保持精简，或统一 `{}`——**统一 field/method/type 层为 `{}`，typeParameter 省略**）。

### 5. 实现分层

```
annotation-parser.js
  extractAnnotationPair(ctx) → [name, attrs]
  buildAnnotationMap(modifierCtxs[]) → Record

signature-visitor.js
  extractField → split declarators → push multiple members
  extractInterfaceConstant → 同上
  各 extract* → annotations: buildAnnotationMap(...)
```

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 多 declarator 拆分导致 ownMembers 变长 | spec 明确；golden 加 `int a, b` fixture（可选） |
| 同名注解假设不成立时静默覆盖 | spec 声明 out of scope；文档说明 |
| 连续 breaking change | 项目尚无外部消费者 |

## Migration Plan

1. 更新 models + annotation-parser + signature-visitor
2. 重写 golden JSON
3. archive 后合并 delta spec

## Open Questions

（无）
