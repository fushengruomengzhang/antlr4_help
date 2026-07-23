## ADDED Requirements

### Requirement: Parse pipeline retries with LL after SLL bail

共享解析管线（`runParsePipeline`）MUST 先以 SLL 预测模式并配合 bail 错误策略执行入口规则。当 SLL 因 bail 取消而失败时，管线 MUST 重置 token 流与 parser、清空 SLL 尝试期间收集的错误、切换为 LL 预测与默认错误策略，并对同一入口规则重跑一次。当 SLL 未触发 bail 即完成时，管线 MUST NOT 再以 LL 重解析。

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

#### Scenario: Truly invalid input still yields ParseError after LL

- **WHEN** 以在 LL 下仍非法的源码（例如 `class {`）调用 `JAVA8.firstClassName`
- **THEN** 实现 SHALL 抛出 `ParseError`，且 `language` 等于 `'java8'`

### Requirement: Stale SLL diagnostics MUST NOT surface after successful LL

在 LL 重试成功后，`throwIfErrors` MUST NOT 抛出仅源于失败 SLL 尝试的 `ParseError`。

#### Scenario: Successful LL retry has empty effective error set

- **WHEN** 某输入在 SLL bail 下失败但在 LL 下成功（例如 `import foo.Bar;\npublic class A {}`）
- **THEN** 管线 SHALL 返回解析树且不抛错
- **AND** 调用方 SHALL NOT 收到 SLL 阶段的 `mismatched input '.' expecting ';'` 诊断
