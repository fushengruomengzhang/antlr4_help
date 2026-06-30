## MODIFIED Requirements

### Requirement: 共享 JSON 字符串解码与编码

项目 SHALL 在 `src/parser/core/string-decode.js` 提供 `decodeJsonString(tokenText)` 与 `encodeJsonString(value)`。JSON4 与 JSON5 的 value visitor MUST 自 `core/string-decode.js`（或相对路径等价 import）解码双引号 JSON 字符串 token。

#### Scenario: JSON4 visitor 直引 core decode
- **WHEN** 查看 `src/parser/json/value-visitor.js`
- **THEN** 自 `../core/string-decode.js` import `decodeJsonString`，且不存在 `./string-utils.js` 中转

#### Scenario: JSON5 复用共享 decode
- **WHEN** 查看 `src/parser/json5/value-visitor.js`
- **THEN** 双引号 STRING 分支调用共享 `decodeJsonString`（自 `core/string-decode.js` 导入）

### Requirement: 共享数组 visitor 辅助

项目 SHALL 在 `src/parser/core/parse-pipeline.js` 提供 `visitArrayChildren(nodes, visitFn)`，以预分配 loop 遍历数组子节点并返回结果数组。JSON4 与 JSON5 的 value visitor MUST 使用此辅助函数构建 array 结果。

#### Scenario: JSON4 visitArr 使用共享辅助
- **WHEN** 查看 `src/parser/json/value-visitor.js` 的 array 访问逻辑
- **THEN** 自 `parse-pipeline.js` import `visitArrayChildren` 并调用，而非 `values.map(visitValue)`

#### Scenario: JSON5 visitArray 使用共享辅助
- **WHEN** 查看 `src/parser/json5/value-visitor.js` 的 array 访问逻辑
- **THEN** 自 `parse-pipeline.js` import `visitArrayChildren` 并调用

### Requirement: 共享错误监听器

项目 SHALL 在 `src/parser/core/parse-pipeline.js` 提供 `CollectingErrorListener` 与 `throwIfErrors(language, listener)`。`runParsePipeline` 与 `peek-first-class-name.js` MUST import 共享实现自同一模块，MUST NOT 各自私有定义重复类。

#### Scenario: pipeline 使用内联 listener
- **WHEN** 查看 `src/parser/core/parse-pipeline.js`
- **THEN** 导出 `CollectingErrorListener` 与 `throwIfErrors`，且不存在独立的 `error-listener.js`

#### Scenario: peek 使用共享 listener
- **WHEN** 查看 `src/parser/java8/peek-first-class-name.js`
- **THEN** 自 `core/parse-pipeline.js` import `CollectingErrorListener` 与 `throwIfErrors`
