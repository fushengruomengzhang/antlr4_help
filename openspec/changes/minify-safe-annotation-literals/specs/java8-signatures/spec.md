## ADDED Requirements

### Requirement: Annotation attribute literals use minify-safe node identity

When `JAVA8.signatures` extracts annotation element values from expression trees, the implementation MUST identify literal and blocking expression nodes without relying on JavaScript `constructor.name` (or other minifier-unstable class name strings). Node identity MUST remain correct when the library is bundled and minified (e.g. Vite production / esbuild minify).

#### Scenario: Normal annotation string and boolean attrs

- **WHEN** `JAVA8.signatures` is called with a compilation unit containing a field annotated `@ApiModelProperty(value = "商号id", hidden = true)`
- **THEN** that field's `annotations.ApiModelProperty` SHALL include `value` equal to `"商号id"` and `hidden` equal to `true`

#### Scenario: Single-element annotation value

- **WHEN** `JAVA8.signatures` is called with a field annotated `@ApiModelProperty("发布范围")`
- **THEN** that field's `annotations.ApiModelProperty.value` SHALL equal `"发布范围"`

#### Scenario: Non-literal annotation values remain absent

- **WHEN** `JAVA8.signatures` is called with a field annotated `@ApiModelProperty(value = Msg.X)` where `Msg.X` is not a literal
- **THEN** that field's `annotations.ApiModelProperty` SHALL NOT contain a `value` key (empty or other literal-only attrs only)

### Requirement: Module spec provides Simplified Chinese mirror document

`openspec/specs/java8-signatures/spec.zh.md` (and this change’s delta mirror) SHALL fully mirror `spec.md` in Simplified Chinese with the same preservation rules as other modules (retain Requirement/Scenario/WHEN/THEN/AND/SHALL keywords).

#### Scenario: java8-signatures mirror exists in the change

- **WHEN** this change’s specs are checked out
- **THEN** `specs/java8-signatures/spec.zh.md` SHALL exist alongside `spec.md`
