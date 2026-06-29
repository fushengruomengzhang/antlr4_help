## 1. 模型定义

- [x] 1.1 重写 `src/parser/java8/models.js`：AnnotationModel、AnnotationValue、TypeSignature、TypeParameterModel、ParameterModel、DeclaratorModel 及更新后的 TypeModel / MemberModel / FileModel JSDoc
- [x] 1.2 移除所有已废弃扁平字段的 typedef（`signature`、`params`、`names`、`type` string 等）

## 2. 注解解析器

- [x] 2.1 新建 `src/parser/java8/annotation-parser.js`：实现 `extractAnnotation`（marker / single / normal 三分支）
- [x] 2.2 实现 `parseElementValue` 浅解析（字面量、嵌套注解、数组字面量；复杂表达式省略）
- [x] 2.3 实现 `splitAnnotationsAndModifiers`：从 modifier 节点列表分离 AnnotationModel[] 与 keyword modifiers[]

## 3. 类型解析器

- [x] 3.1 新建 `src/parser/java8/type-parser.js`：实现 `parseTypeSignature`（primitive / class / typeVariable / array / wildcard）
- [x] 3.2 实现 `parseTypeArguments` 与嵌套泛型递归（List、Map、多层嵌套）
- [x] 3.3 实现 `parseTypeParameter` 与 `parseTypeBound`（extends + additional `&` bounds）

## 4. Signature Visitor 重构

- [x] 4.1 更新类型级 extract（class / interface / enum / annotation）：annotations、typeParameters、extendsType、implementsTypes
- [x] 4.2 更新 field extract：结构化 type、declarators + defaultValue（浅解析 initializer）
- [x] 4.3 更新 method / interfaceMethod extract：typeParameters、returnType、returnDimensions、parameters、throwsTypes
- [x] 4.4 更新 constructor extract：parameters、throwsTypes
- [x] 4.5 更新 annotationElement extract：type + defaultValue
- [x] 4.6 更新 interfaceConstant / enumConstant extract 以符合新 MemberModel 形状

## 5. 测试与验证

- [x] 5.1 运行 `node test/run.mjs`，确认 `java8.signatures` 用例通过
- [x] 5.2 更新 `test/resources/out/test.java.signatures.json` golden（覆盖注解、嵌套泛型、参数注解、defaultValue、typeParameters 等场景）
- [x] 5.3 运行 `openspec validate --all` 确认 change 与 spec 合法
