# core-utilities Specification

## Purpose
定义 `src/parser/core/` 下共享性能与字符串工具模块的职责与消费约定，供 JSON4、JSON5、Java8 解析路径复用。

## Requirements

### Requirement: TextBuf 分块字符串缓冲

项目 SHALL 在 `src/parser/core/text-buf.js` 提供 `TextBuf` 类，供运行时模块进行分块字符串拼接；SHALL 支持 `push(...chunks)`、`toString()`，以及 format 路径所需的 `beginMemberLine(indentFn, depth)` 与 `beginCloseLine(indentFn, depth)`。`format-emitter.js` MUST import 共享 `TextBuf`，MUST NOT 在模块内私有定义重复实现。

#### Scenario: format-emitter 使用共享 TextBuf
- **WHEN** 查看 `src/parser/json5/format-emitter.js`
- **THEN** 自 `src/parser/core/text-buf.js` import `TextBuf`，且文件内不存在私有 `class TextBuf`

#### Scenario: TextBuf 基本拼接
- **WHEN** 对 `TextBuf` 实例依次 `push('a', 'b')` 后调用 `toString()`
- **THEN** 返回 `'ab'`

### Requirement: 共享 JSON 字符串解码与编码

项目 SHALL 在 `src/parser/core/string-decode.js` 提供 `decodeJsonString(tokenText)` 与 `encodeJsonString(value)`。`src/parser/json/string-utils.js` MUST re-export 上述函数以保持既有 import 路径兼容。JSON4 与 JSON5 parse/format 路径 MUST 通过共享实现解码双引号 JSON 字符串 token。

#### Scenario: json 模块 re-export 兼容
- **WHEN** 在 `src/parser/json/value-visitor.js` 中 `import { decodeJsonString } from './string-utils.js'`
- **THEN** 导入成功且行为与 `core/string-decode.js` 一致

#### Scenario: JSON5 复用共享 decode
- **WHEN** 查看 `src/parser/json5/value-visitor.js`
- **THEN** 双引号 STRING 分支调用共享 `decodeJsonString`（经 `string-utils` 或 `core/string-decode` 导入）

### Requirement: 共享数组 visitor 辅助

项目 SHALL 在 `src/parser/core/visit-helpers.js` 提供 `visitArrayChildren(nodes, visitFn)`，以预分配 loop 遍历数组子节点并返回结果数组。JSON4 与 JSON5 的 value visitor MUST 使用此辅助函数构建 array 结果，MUST NOT 对子节点数组使用 `.map(visitFn)` 直接分配中间数组。

#### Scenario: JSON4 visitArr 使用共享辅助
- **WHEN** 查看 `src/parser/json/value-visitor.js` 的 array 访问逻辑
- **THEN** 调用 `visitArrayChildren` 而非 `values.map(visitValue)`

#### Scenario: JSON5 visitArray 使用共享辅助
- **WHEN** 查看 `src/parser/json5/value-visitor.js` 的 array 访问逻辑
- **THEN** 调用 `visitArrayChildren` 而非 `values.map(visitValue)`

### Requirement: 共享错误监听器

项目 SHALL 在 `src/parser/core/error-listener.js` 提供 `CollectingErrorListener` 与 `throwIfErrors(language, listener)`。`parse-pipeline.js` 与 `peek-first-class-name.js` MUST import 共享实现，MUST NOT 各自私有定义重复类。

#### Scenario: pipeline 使用共享 listener
- **WHEN** 查看 `src/parser/core/parse-pipeline.js`
- **THEN** 自 `error-listener.js` import `CollectingErrorListener`，文件内无重复 class 定义

#### Scenario: peek 使用共享 listener
- **WHEN** 查看 `src/parser/java8/peek-first-class-name.js`
- **THEN** 自 `core/error-listener.js` import `CollectingErrorListener`，文件内无重复 class 定义
