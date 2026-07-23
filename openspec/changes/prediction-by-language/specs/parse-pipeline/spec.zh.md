## REMOVED Requirements

### Requirement: Parse pipeline retries with LL after SLL bail

**Reason**: 全语言统一的 SLL+Bail→LL 回退，已由按语言选择预测模式替代（`java8` = LL，`json5`/`json` = SLL），且每次仅解析一次。

**Migration**: 依赖按语言选定的预测模式；不要再期望 SLL bail 之后的第二次 LL 解析。

### Requirement: Stale SLL diagnostics MUST NOT surface after successful LL

**Reason**: 已无 SLL→LL 重试，因此不存在「首次 SLL 失败残留诊断」问题。

**Migration**: 无。

## ADDED Requirements

### Requirement: Prediction mode is selected by language

共享解析管线（`runParsePipeline`）MUST 根据 `language` 选项选择 ANTLR 预测模式：当 `language` 为 `'java8'` 时，管线 MUST 使用 LL 预测与默认错误策略，且 MUST NOT 使用 BailErrorStrategy 或第二次解析；当 `language` 为 `'json5'` 或 `'json'` 时，管线 MUST 使用 SLL 预测与默认错误策略，且 MUST NOT 使用 BailErrorStrategy 或第二次解析。

#### Scenario: java8 uses a single LL parse

- **WHEN** 调用 `JAVA8.firstClassName`（管线 `language` 为 `'java8'`）
- **THEN** compilation unit SHALL 以 LL 预测解析
- **AND** 管线 SHALL NOT 在 SLL bail 后重试入口规则

#### Scenario: json5 uses a single SLL parse

- **WHEN** 调用 `JSON5.parse`（管线 `language` 为 `'json5'`）
- **THEN** 输入 SHALL 以 SLL 预测解析
- **AND** 管线 SHALL NOT 使用 BailErrorStrategy 或 LL 重试

### Requirement: java8 accepts two-segment qualified imports under LL

在 `language` 为 `'java8'` 且使用 LL 预测时，包含两段式类型 import（含 Lombok 风格 `import lombok.Data;`）的合法编译单元 MUST 解析成功。真正非法的输入 MUST 仍抛出 `language` 为 `'java8'` 的 `ParseError`。

#### Scenario: Two-segment Java import succeeds

- **WHEN** 以源码 `import foo.Bar;\npublic class A {}` 调用 `JAVA8.firstClassName`
- **THEN** 调用 SHALL 返回 `"A"`
- **AND** 调用 SHALL NOT 抛出 `ParseError`

#### Scenario: Two-segment Java package succeeds

- **WHEN** 以源码 `package a.b;\npublic class A {}` 调用 `JAVA8.firstClassName`
- **THEN** 调用 SHALL 返回 `"A"`
- **AND** 调用 SHALL NOT 抛出 `ParseError`

#### Scenario: Lombok-style two-segment imports succeed

- **WHEN** 以包含 `import lombok.Data;`（及其他合法两段式 `lombok.*` import）及 public 类体的编译单元调用 `JAVA8.signatures`
- **THEN** 调用 SHALL 返回 `FileModel`，且首个类型名与该 public 类一致
- **AND** 调用 SHALL NOT 抛出 `ParseError`

#### Scenario: Truly invalid input still yields ParseError

- **WHEN** 以在 LL 下仍非法的源码（例如 `class {`）调用 `JAVA8.firstClassName`
- **THEN** 实现 SHALL 抛出 `ParseError`，且 `language` 等于 `'java8'`
