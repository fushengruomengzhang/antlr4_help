## ADDED Requirements

### Requirement: Annotation attribute literals use minify-safe node identity

当 `JAVA8.signatures` 从表达式树提取注解元素值时，实现 MUST 在识别字面量节点与需阻断的表达式节点时，不依赖 JavaScript 的 `constructor.name`（或其他会被压缩器改写的类名字符串）。在库被打包并 minify（例如 Vite 生产构建 / esbuild minify）后，节点身份判定 MUST 仍然正确。

#### Scenario: Normal annotation string and boolean attrs

- **WHEN** 以包含字段注解 `@ApiModelProperty(value = "商号id", hidden = true)` 的编译单元调用 `JAVA8.signatures`
- **THEN** 该字段的 `annotations.ApiModelProperty` SHALL 包含等于 `"商号id"` 的 `value` 以及等于 `true` 的 `hidden`

#### Scenario: Single-element annotation value

- **WHEN** 以字段注解 `@ApiModelProperty("发布范围")` 调用 `JAVA8.signatures`
- **THEN** 该字段的 `annotations.ApiModelProperty.value` SHALL 等于 `"发布范围"`

#### Scenario: Non-literal annotation values remain absent

- **WHEN** 以字段注解 `@ApiModelProperty(value = Msg.X)`（`Msg.X` 非字面量）调用 `JAVA8.signatures`
- **THEN** 该字段的 `annotations.ApiModelProperty` SHALL NOT 包含 `value` 键（仅保留空对象或其它字面量属性）

### Requirement: Module spec provides Simplified Chinese mirror document

`openspec/specs/java8-signatures/spec.zh.md`（以及本变更中的 delta mirror）SHALL 以简体中文完整镜像 `spec.md`，并遵循与其它模块相同的保留规则（保留 Requirement/Scenario/WHEN/THEN/AND/SHALL 等英文关键字）。

#### Scenario: java8-signatures mirror exists in the change

- **WHEN** 检出本变更的 specs
- **THEN** `specs/java8-signatures/spec.zh.md` SHALL 与 `spec.md` 同时存在
