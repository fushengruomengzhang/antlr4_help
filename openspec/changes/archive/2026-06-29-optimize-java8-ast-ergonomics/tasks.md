## 1. 模型与注解 Map

- [x] 1.1 更新 `models.js`：`AnnotationMap` / `AnnotationAttrs`；删除 `AnnotationModel`、`DeclaratorModel`；field/interfaceConstant 增加顶层 `name`、`defaultValue?`
- [x] 1.2 更新 `annotation-parser.js`：`buildAnnotationMap()`、`extractAnnotationPair()`；`splitAnnotationsAndModifiers` 返回 Record

## 2. Visitor 组装

- [x] 2.1 更新 `extractField` / `extractInterfaceConstant`：多 declarator 拆成多条 member，共享 type/annotations/modifiers
- [x] 2.2 更新 type/method/constructor/enum/parameter/annotationElement extract：`annotations` 改为 Record

## 3. 测试与验证

- [x] 3.1 运行 `node test/run.mjs`，确认 `java8.signatures` 通过
- [x] 3.2 重写 `test/resources/out/test.java.signatures.json` golden
- [x] 3.3 （可选）在 `test/resources/test.java.text` 增加 `private int a = 1, b = 2` 多 declarator 用例
- [x] 3.4 运行 `openspec validate --all`
