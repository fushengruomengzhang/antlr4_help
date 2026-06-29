## 1. effectiveFields helper

- [x] 1.1 实现 `src/parser/java8/effective-fields.js`：`collectExtendsChain`、`effectiveFields(typeName, classMap)`
- [x] 1.2 实现 `fieldReferencesType(typeSignature, typeName)`（含 List/Map 内层 object 核）

## 2. buildNode 增强

- [x] 2.1 `buildNode` 增加 `fromType` 参数；object 展开改用 effectiveFields
- [x] 2.2 实现回边分支：path 含 typeName 时排除 `fieldReferencesType(f.type, fromType)` 的 field
- [x] 2.3 List/Map 分支正确传递 path 与 fromType

## 3. Golden 与集成测试

- [x] 3.1 重新生成 `test/resources/golden/test.java.api.structure.json`
- [x] 3.2 在 `test/run.mjs` 增加 UserP 继承与 child 自引用 assert（若 spec scenario 需要）
- [x] 3.3 运行 `npm test` 全部通过

## 4. Validation

- [x] 4.1 运行 `openspec validate --all` 确认 change 合法
