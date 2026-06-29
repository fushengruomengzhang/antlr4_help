## Why

当前 `java8.toApiSchema` 展开 object 类型时仅使用 `ownMembers`，子类（如 `UserP extends User`）不包含父类字段；遇循环引用（A↔B 或自引用 `List<User>`）时在 path 重复处直接返回无 `children` 的叶子 Object，API 文档树信息损失过大。业务需要更接近真实 Model 的展开：合并继承字段，并在回边时展开对端类型但排除指回来源类型的字段。

## What Changes

- **ADDED** `effectiveFields`：展开 class 时沿 `extendsType` 链合并父类 field（父先子后，子类同名 field 覆盖父类）
- **MODIFIED** 循环引用策略：path 再次遇到 `typeName` 时，不再返回空叶子；改为展开 `typeName` 的 effectiveFields，但 **排除** 字段类型（含 List/Map 内层 object 核）等于 `fromType`（当前递归来源类型）的 field
- `buildNode` 递归增加 `fromType` 上下文参数；List/Map 包装层仍不扩展 path
- 更新 `test/resources/golden/test.java.api.structure.json`（`UserP` 含 `User` 字段、自引用 `child` 内层展开但无 `child` 等）
- **BREAKING**（输出语义）：`toApiSchema` 输出树结构与 v2.2.x 不同；`signatures()` 行为不变

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `java8-api`：新增继承 field 合并 requirement；修改循环引用检测 requirement
- `integration-tests`：更新 toApiSchema structure golden 相关 scenario 期望

## Impact

- **代码**：`src/parser/java8/to-api-schema.js`（及可能的 `effective-fields.js` helper）
- **测试**：`test/resources/golden/test.java.api.structure.json`、`test/run.mjs`（若需新 assert）
- **API 签名**：`toApiSchema` 签名不变；**输出 JSON 结构变化**
- **依赖**：无新 npm 依赖；依赖现有 `TypeModel.extendsType` 与 `ownMembers`
