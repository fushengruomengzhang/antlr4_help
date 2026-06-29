## Context

`java8.signatures()` 已实现浅 Visitor 提取 own members 与 nested 类型树，但 `signature-visitor.js` 主要依赖 `getText()` 产出扁平字符串。测试 fixture `test/resources/test.java.text` 含注解、嵌套泛型、参数注解等典型场景，当前 golden 输出无法结构化消费。

约束：
- Node.js ESM + ANTLR 4.9.3，不修改 `.g4` grammar
- 保持浅 Visitor：不进入 `methodBody`、`block`、`constructorBody` 及复杂表达式子树
- **Breaking change**：不保留旧扁平字段作兼容层

## Goals / Non-Goals

**Goals:**

- 定义并实现结构化签名模型：AnnotationModel、TypeSignature、TypeParameterModel、ParameterModel、DeclaratorModel
- 注解与 keyword 修饰符分离；注解 attributes 结构化（marker 空对象、单值默认 key=`value`）
- 类型与泛型递归结构化（List/Map/嵌套/wildcard/数组）
- 类/方法 `typeParameters` 结构化（含 extends bound 与 `&` 交叉 bound）
- 字段 declarator 级 `defaultValue`（浅解析 literal）；`@interface` 元素 `defaultValue`
- 方法头完整结构化（参数注解、varargs、throwsTypes）；方法体仍跳过
- 更新 golden 测试输出

**Non-Goals:**

- 符号解析、import 展开、继承链成员合并
- 注解/initializer 中复杂表达式（SpEL、方法调用、`new`）的深入解析
- TypeScript 类型定义文件或 JSON Schema 导出
- 修改 `java8.firstClassName()` 行为

## Decisions

### 1. 模块拆分：type-parser + annotation-parser

```
src/parser/java8/
├── models.js              ← 全部 JSDoc typedef
├── annotation-parser.js   ← extractAnnotation, parseElementValue, splitModifiers
├── type-parser.js         ← parseTypeSignature, parseTypeParameter, parseTypeBound
├── signature-visitor.js   ← 组装 FileModel，调用上述 parser
└── signatures.js          ← 入口不变
```

- **Rationale**：类型与注解解析逻辑可独立单测，visitor 只负责遍历 CST 节点
- **Alternative**：全部写在 `signature-visitor.js` — 文件膨胀、难维护

### 2. AnnotationModel 形状

```javascript
// { name: string, attributes: Record<string, AnnotationValue> }
// marker:     @ESDocument           → attributes: {}
// single:     @ApiModel("x")        → attributes: { value: "x" }
// normal:     @Foo(a=1, b="y")      → attributes: { a: 1, b: "y" }
```

- `name` 取 `typeName` 简单名（不含 package；grammar 层 typeName 通常已是简单名或 qualified）
- **Alternative**：保留原始 `@...` 字符串 — 与 breaking change 目标冲突

### 3. AnnotationValue 浅解析边界

| CST 形态 | 结果 |
|----------|------|
| String/Integer/Boolean/Char literal | 对应 JS 值 |
| 嵌套 `annotation` | AnnotationModel |
| `elementValueArrayInitializer` | AnnotationValue[] |
| 其他 `conditionalExpression` | 省略（字段不出现） |

字段 `variableInitializer` 与 `@interface` `defaultValue` 使用同一套 `parseElementValue` / literal 检测逻辑。

### 4. TypeSignature discriminated union

```
kind: 'primitive' | 'class' | 'typeVariable' | 'array' | 'wildcard'

class:       { kind, name, typeArguments? }
primitive:   { kind, name }          // int, boolean, void 仅用于 returnType 时用 { kind: 'void' }
typeVariable:{ kind, name }
array:       { kind, elementType, dimensions }
wildcard:    { kind, bound?: { extends|super, type: TypeSignature } }
```

- `extendsType` / `implementsTypes` / 字段类型 / 参数类型 / throws / typeArguments 均复用 `parseTypeSignature`
- **Alternative**：extends/implements 保留字符串 — 泛型继承无法结构化

### 5. TypeParameterModel

```javascript
{ name, annotations?, bound?: { extends: TypeSignature, additional?: TypeSignature[] } }
```

- 无 bound 的 `<T>` → 省略 `bound` 字段
- `typeParameterModifier`（注解）提取到 `annotations`
- 类级与方法级 `typeParameters` 共用同一 parser

### 6. MemberModel breaking 形状

**field:** `{ kind, annotations, modifiers, type: TypeSignature, declarators: [{ name, defaultValue? }] }`

**method:** `{ kind, name, annotations, modifiers, typeParameters?, returnType, returnDimensions?, parameters, throwsTypes? }`

- `returnType`: TypeSignature 或 `{ kind: 'void' }`
- `returnDimensions`: methodDeclarator 上 `dims` 数量（返回数组时）
- 移除 `signature`、`params`、`names`、`type`（string）、`returnType`（string）、`throws`（string）

**annotationElement:** `{ kind, name, type: TypeSignature, annotations?, defaultValue? }`

### 7. TypeModel breaking 形状

- 新增 `annotations: AnnotationModel[]`；`modifiers` 仅 keyword
- `extendsType?: TypeSignature` 替换 `extends: string`
- `implementsTypes?: TypeSignature[]` 替换 `implements: string[]`
- `typeParameters?: TypeParameterModel[]` 替换 `typeParameters: string`

### 8. 浅 Visitor 策略不变

- 进入 `methodBody` / `constructorBody` 即停止
- `parseElementValue` 遇到非 literal/annotation/array 的 `conditionalExpression` 不递归
- 字段 initializer 为 `new Foo()` 或方法调用时，`defaultValue` 省略

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| Breaking change 影响已有调用方 | 本仓库尚无外部消费者；golden 测试一次性更新 |
| `getText()` 替换为节点遍历，实现量大 | 拆分为独立 parser 模块，按 fixture 场景增量实现 |
| 注解 value 浅解析遗漏复杂默认值 | spec 明确边界；复杂场景 `defaultValue` 省略 |
| qualified typeName 与 simple name 不一致 | 先用 grammar `typeName.getText()`；后续可按需加 `qualifiedName` 字段 |

## Migration Plan

1. 实现新 parser 模块与新 models
2. 重写 `signature-visitor.js` extract 函数
3. 运行 `node test/run.mjs`，更新 `test.java.signatures.json` golden
4. archive change 后 main spec 合并 delta

无运行时 migration — API 直接换返回形状。Rollback：revert commit。

## Open Questions

（无 — explore 阶段已确认：marker 空 attributes、breaking change、浅 elementValue、declarator defaultValue、extends/implements/typeParameters 全结构化。）
