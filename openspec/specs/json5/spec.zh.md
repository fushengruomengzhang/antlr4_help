# json5

## 目的

JSON5 校验、解析与格式化：模块布局、单一格式化栈、parse 的 sortKeys、带 AnchorTriplet 坐标的 Document AST 流水线，以及 format 性能约束。

## 需求

### Requirement: 三个独立的 API 入口模块

JSON5 产品线 SHALL 通过 `src/parser/json5/` 下三个独立顶层模块暴露 `validate`、`parse` 与 `format`：`validate.js`、`parse.js` 与 `format.js`。公共聚合器 `index.js` SHALL 仅导入这三个模块并重新导出 `JSON5` 与 `DEFAULT_FORMAT_OPTIONS`。`JSON5.validate(input)` 签名 SHALL NOT 变更。`JSON5.parse(input, options?)` SHALL 接受可选的第二参数，形状为 `{ sortKeys?: boolean }`；省略时，parse 行为 SHALL 与扩展前的单参数形式一致。`JSON5.format(input, options?)` SHALL 仍为双参数函数；**`options.indent` SHALL 为字符串**（相对先前对象形式的破坏性变更）。

#### Scenario: 索引聚合三个入口

- **WHEN** 消费者从 `src/parser/json5/index.js` 导入 `{ JSON5, DEFAULT_FORMAT_OPTIONS }`
- **THEN** `JSON5.validate`、`JSON5.parse` 与 `JSON5.format` SHALL 可调用
- **AND** `DEFAULT_FORMAT_OPTIONS.indent` SHALL 为字符串 `'  '`

#### Scenario: API 模块不交叉导入

- **WHEN** 检查 `validate.js`、`parse.js` 与 `format.js` 的依赖图
- **THEN** 这三个文件均 SHALL NOT 导入其余两个中的任何一个

#### Scenario: Parse 接受可选 sortKeys

- **WHEN** 消费者调用 `JSON5.parse('{ b: 1, a: 2 }', { sortKeys: true })`
- **THEN** 该调用 SHALL 成功，且 SHALL NOT 破坏单参数 `JSON5.parse(input)` 调用方

---

### Requirement: 用于选择性 JSON5 导入的包 subpath 导出

包 SHALL 声明 Node.js `exports` subpath，使消费者可仅导入所需 JSON5 能力而无需加载无关模块。至少包括：

- `antlr4_help` (`.`) — 完整库入口
- `antlr4_help/json5` — 完整 JSON5 命名空间
- `antlr4_help/json5/validate` — 仅 validate 门面
- `antlr4_help/json5/parse` — 仅 parse 门面
- `antlr4_help/json5/format` — 仅 format 门面及 `DEFAULT_FORMAT_OPTIONS`

每个单一能力 subpath SHALL 导出仅包含该能力方法的 `JSON5` 对象。

#### Scenario: Validate subpath 暴露 JSON5.validate

- **WHEN** 消费者执行 `import { JSON5 } from 'antlr4_help/json5/validate'`
- **THEN** `JSON5.validate(input)` SHALL 可调用
- **AND** `JSON5` SHALL NOT 包含 `parse` 或 `format` 属性

#### Scenario: Parse subpath 暴露 JSON5.parse

- **WHEN** 消费者执行 `import { JSON5 } from 'antlr4_help/json5/parse'`
- **THEN** `JSON5.parse(input)` SHALL 可调用
- **AND** `JSON5` SHALL NOT 包含 `validate` 或 `format` 属性

#### Scenario: Format subpath 暴露 JSON5.format 与默认值

- **WHEN** 消费者执行 `import { JSON5, DEFAULT_FORMAT_OPTIONS } from 'antlr4_help/json5/format'`
- **THEN** `JSON5.format(input, options?)` SHALL 可调用
- **AND** `DEFAULT_FORMAT_OPTIONS` SHALL 可用
- **AND** `JSON5` SHALL NOT 包含 `validate` 或 `parse` 属性

#### Scenario: 完整 json5 subpath 与聚合器一致

- **WHEN** 消费者从 `antlr4_help/json5` 导入
- **THEN** 导出的 `JSON5` 对象 SHALL 提供 `validate`、`parse` 与 `format`，行为与 `src/parser/json5/index.js` 相同

#### Scenario: 根入口不变

- **WHEN** 消费者执行 `import { JSON5 } from 'antlr4_help'`
- **THEN** 三个 JSON5 方法 SHALL 仍可用且行为不变

---

### Requirement: 仅 validate 导入不加载 format 实现

导入 `antlr4_help/json5/validate` SHALL NOT 传递性导入 `src/parser/json5/format/` 下任何模块。

#### Scenario: Validate subpath 依赖图

- **WHEN** 分析 `antlr4_help/json5/validate` 的静态导入图
- **THEN** 图中 SHALL NOT 出现 `src/parser/json5/format/` 下任何文件

---

### Requirement: Format 实现位于 format 目录

所有 JSON5 format 专用实现文件 SHALL 位于 `src/parser/json5/format/`。Format 选项（`DEFAULT_FORMAT_OPTIONS`、选项解析）SHALL 位于顶层 `format.js` 门面。顶层 `format.js` SHALL 编排 format 流水线、在入口一次性解析用户选项，并在 emit 前调用 `buildAndTransformDocumentAst`。

#### Scenario: Format 入口编排 parse 到 AST 再 format

- **WHEN** 调用 `JSON5.format(input, options)`
- **THEN** 实现 SHALL 从 parse tree 与已填充 token stream 构建并变换 Document AST，再 emit 文本，且 SHALL NOT 导入 `parse.js` 或 `validate.js`
- **AND** 选项解析 SHALL 在 transform 与 emit 之前于 `format.js` 中恰好执行一次

#### Scenario: Format 内部按目录限定

- **WHEN** 定位 AST builder/transform、emitter 与 token-slice 模块
- **THEN** 其文件路径 SHALL 位于 `src/parser/json5/format/` 下
- **AND** 遗留拆分文件（`ast-builder.js`、`ast-transform.js`、`types.js`、`format-options.js`）SHALL NOT 存在于 `format/` 下

#### Scenario: 已解析选项传入流水线

- **WHEN** 从 `format.js` 调用 `buildAndTransformDocumentAst` 或 `emitDocument`
- **THEN** 它们 SHALL 接收已解析的 format 选项
- **AND** SHALL NOT 在内部调用选项规范化

---

### Requirement: Parse 与 validate 不使用 format 目录

`parse.js` 与 `validate.js` SHALL NOT 导入 `src/parser/json5/format/` 下任何模块。`JSON5.parse` SHALL 使用基于 CST 的值提取路径。`JSON5.validate` SHALL 仅通过共享 parse 流水线进行语法校验，不构建 JavaScript 值或 Document AST。

#### Scenario: Parse 避开 format AST builder

- **WHEN** 调用 `JSON5.parse(input)`
- **THEN** 实现 SHALL NOT 导入或调用 `buildDocumentAst` 或 `format/` 下任何模块

#### Scenario: Validate 仅走流水线

- **WHEN** 调用 `JSON5.validate(input)`
- **THEN** 实现 SHALL 运行 JSON5 parse 流水线，且不使用 `fillTokens: true`、不构建 JavaScript 值、不导入 `format/`

---

### Requirement: 移除遗留混合模块

迁移完成后，`value-visitor.js` 与 `format-emitter.js` 这两个混合模块 SHALL 从 `src/parser/json5/` 移除。`src/parser/json5/` 下剩余生产代码 SHALL NOT 导入这些文件。

#### Scenario: 无对已移除模块的引用

- **WHEN** 在仓库中搜索 `src/parser/json5/` 下对 `value-visitor.js` 或 `format-emitter.js` 的导入
- **THEN** SHALL NOT 存在此类导入

#### Scenario: format-emitter 已移除

- **WHEN** 检查仓库
- **THEN** `src/parser/json5/format-emitter.js` SHALL NOT 存在
- **AND** `JSON5.format` SHALL 通过 `format/` 目录模块从 `format.js` 导出

#### Scenario: value-visitor 拆分为 validate 与 parse

- **WHEN** 检查仓库
- **THEN** `validate.js` 与 `parse.js` SHALL 存在于 `src/parser/json5/` 下
- **AND** `value-visitor.js` SHALL NOT 存在

---

### Requirement: 库仅通过 JSON5.format 暴露 format

包 SHALL 仅通过 `JSON5` 导出上的 `JSON5.format` 提供 JSON5 格式化。库 SHALL NOT 导出 `JSON5Format`、`JSON5_FORMAT_DEFAULT_OPTIONS` 或 `src/parser/json5-format/` 下任何模块。

#### Scenario: 包入口无 JSON5Format 导出

- **WHEN** 消费者从 `src/index.js` 导入
- **THEN** `JSON5Format` SHALL NOT 在导出绑定中
- **AND** `JSON5.format` SHALL 仍可使用 `indent`、`sortKeys` 与 `compact` 选项调用

#### Scenario: json5-format 目录已移除

- **WHEN** 检查仓库
- **THEN** `src/parser/json5-format/` 与 `src/grammars/json5-format/` SHALL NOT 存在

---

### Requirement: JSON5.parse 接受可选 sortKeys 选项

`JSON5.parse` SHALL 接受可选第二参数 `options`，形状为 `{ sortKeys?: boolean }`。当 `options` 省略或 `sortKeys` 为 `false` 时，parse 行为 SHALL 保留源 key 与数组元素顺序。

#### Scenario: 默认 parse 保留源顺序

- **WHEN** 无选项调用 `JSON5.parse('{ b: 1, a: 2 }')`
- **THEN** 返回对象的 key 插入顺序 SHALL 为 `b` 然后 `a`

#### Scenario: 非布尔 sortKeys 被拒绝

- **WHEN** 调用 `JSON5.parse('{}', { sortKeys: 1 })`
- **THEN** 实现 SHALL 抛出 `TypeError`

---

### Requirement: JSON5.parse 在 sortKeys 为 true 时稳定排序对象 key

当 `sortKeys: true` 时，实现 SHALL 使用 `keyA.localeCompare(keyB)` 递归排序每个对象的 key，并以原始源成员索引做稳定 tie-breaking。Key SHALL 使用与 `keyToString` 相同的解码字符串形式。数组元素 SHALL NOT 重排。算法 SHALL 与 `JSON5.format` 的 `sortKeys: true` 排序一致。

#### Scenario: 顶层 key 已排序

- **WHEN** 调用 `JSON5.parse('{ b: 2, a: 1 }', { sortKeys: true })`
- **THEN** `Object.keys(result)` SHALL 等于 `['a', 'b']`

#### Scenario: 嵌套对象递归排序

- **WHEN** 调用 `JSON5.parse('{ z: { y: 1, x: 2 } }', { sortKeys: true })`
- **THEN** `Object.keys(result.z)` SHALL 等于 `['x', 'y']`

#### Scenario: 数组元素顺序不变

- **WHEN** 调用 `JSON5.parse('[3, 1, 2]', { sortKeys: true })`
- **THEN** 返回数组 SHALL 深度等于 `[3, 1, 2]`

#### Scenario: sortKeys 为 false 保留源顺序

- **WHEN** 调用 `JSON5.parse('{ b: 1, a: 2 }', { sortKeys: false })`
- **THEN** 返回对象的 key 插入顺序 SHALL 为 `b` 然后 `a`

#### Scenario: 已排序对象内数组不变

- **WHEN** 调用 `JSON5.parse('{ b: [3, 1], a: 0 }', { sortKeys: true })`
- **THEN** `Object.keys(result)` SHALL 等于 `['a', 'b']`
- **AND** `result.b` SHALL 深度等于 `[3, 1]`

#### Scenario: 稳定排序在 localeCompare 平局时保留源顺序

- **WHEN** 两个对象 key 在 `localeCompare` 下相等（相同解码字符串值）
- **THEN** 它们在输出对象中的相对顺序 SHALL 与源文本中的相对顺序一致

#### Scenario: Unicode 与未加引号 key 使用 localeCompare

- **WHEN** 对包含 Unicode 或未加引号标识符 key 的输入以 `sortKeys: true` 调用 `JSON5.parse`
- **THEN** key 顺序 SHALL 按 `keyToString` 所得字符串的 `String.prototype.localeCompare` 排序

---

### Requirement: JSON5 模块文档化 parse 选项

`src/parser/json5/index.js` 模块文档 SHALL 描述 `JSON5.parse` 的可选 `options` 参数、`sortKeys` 字段（默认 `false`），以及启用 `sortKeys` 时不排序数组元素。

#### Scenario: 公共 API 文档列出 sortKeys

- **WHEN** 消费者阅读 `src/parser/json5/index.js` 中 `JSON5.parse` 的 JSDoc
- **THEN** 它 SHALL 将 `options.sortKeys` 文档化为可选布尔值，默认 `false`
- **AND** SHALL 说明仅排序对象 key，不排序数组元素

---

### Requirement: Format 内部流水线使用语法驱动的 AST

JSON5 format 实现 SHALL 在 emit 输出前从 parse tree 与已填充 token stream 构建 Document AST。流水线 SHALL 由三个内部阶段组成：构建 AST、变换 AST（选项）、emit AST。

#### Scenario: Format 入口使用 AST 流水线

- **WHEN** 以有效 JSON5 输入调用 `JSON5.format(input, options)`
- **THEN** 实现 SHALL 解析输入、构建 Document AST、按选项应用 transform，并在 emit 时通过 comment interval 提取 emit 文本

#### Scenario: Parse 不使用 AST builder

- **WHEN** 调用 `JSON5.parse(input)`
- **THEN** 实现 SHALL NOT 调用 Document AST builder

---

### Requirement: AnchorTriplet 记录语义 token 边界

format AST builder SHALL 为每个带注释的语义 token 分配 `AnchorTriplet`，包含 `prev`、`current` 与 `next` 坐标。流起始与流结束哨兵坐标 SHALL 闭合文件头尾注释的区间。

#### Scenario: 对象 open anchor 使用哨兵 prev

- **WHEN** AST builder 处理根对象且 `{` 为首个可见 token
- **THEN** `open.prev` SHALL 为流起始哨兵
- **AND** `{` 之前的 prefix 注释 SHALL 可通过区间 `(open.prev, open.current)` 发现

#### Scenario: 成员 key anchor 使用上一分隔符边界

- **WHEN** AST builder 处理第二个对象成员 key
- **THEN** `key.prev` SHALL 为上一成员的 `end.current` token（通常为 `COMMA`）

---

### Requirement: AST 构建仅存储结构、不含 comment 字符串

AST builder SHALL NOT 在 Document、容器或 entry 节点上填充 comment 或 layout 字符串槽位。Comment 文本 SHALL 推迟到 emit 阶段。

#### Scenario: ObjectEntry 仅有 triplet anchor

- **WHEN** 对带注释成员的对象完成 `buildDocumentAst`
- **THEN** 每个 `ObjectEntry` SHALL 包含 `key` 与 `end` 的 `AnchorTriplet` 值，且 SHALL NOT 包含 `before` 或 `suffix` 字符串字段

---

### Requirement: Emit 通过 token 索引区间切片提取 comment

emit 阶段 SHALL 从 `triplet.prev` 与 `triplet.current` 之间的区间提取 prefix comment，从 `triplet.current` 与 `triplet.next` 之间的区间提取 suffix comment。

#### Scenario: Prefix 保留 comment 源文本

- **WHEN** emit 处理 key 区间包含 `// 中文 key` 的 entry
- **THEN** 输出 SHALL 在该 key 之前包含字面文本 `// 中文 key`

#### Scenario: 同行 inline suffix 过滤

- **WHEN** emit 处理 end 区间在成员逗号同行包含 `// 年龄` 的 entry
- **THEN** 在 compact sort 模式下，输出 SHALL 在成员值同行 emit 该 inline comment

---

### Requirement: Emit 期间无 gap 考古

emit 阶段 SHALL NOT 扫描重格式化后的输出 gap，SHALL NOT 使用 `purePrefixHiddenTokens`、跨 entry span 排除或等效的 gap 重建辅助逻辑。

#### Scenario: 排序移动 entry 而不重扫 token stream

- **WHEN** 在 transform 中应用 `sortKeys: true`
- **THEN** 每个 entry 的 prefix 与 suffix comment SHALL 仅从该 entry 构建时的 triplet 提取

#### Scenario: Prefix follows key after sort
#### Scenario: 排序后 prefix 跟随 key anchor 而非源 hoist

- **WHEN** `JSON5.format` 以 `sortKeys: true, compact: true` 运行，输入中 `// 字符串` 在 key `1` 之前、`// 下划线` 在 `"_private"` 之前
- **THEN** `// 下划线` SHALL 在排序位置紧挨 `"_private"` 之前出现
- **AND** `// 字符串` SHALL 在排序位置紧挨 key `1` 之前出现
- **AND** `// 字符串` SHALL NOT 仅因源顺序更早而出现在 `"_private"` 之前



- **WHEN** `JSON5.format` 以 `sortKeys: true` 运行，输入中 `// 中文 key` 在 key `中文字段` 之前
- **THEN** 输出 SHALL 在排序位置将 `// 中文 key` 紧挨 `中文字段` 之前放置

---

### Requirement: Open inline comment 仅使用 suffix 区间

开括号 inline comment SHALL 通过 `open` suffix 区间提取。实现 SHALL NOT 使用会误归因 comment 的全源行扫描。

#### Scenario: 空对象 inline 不归因于内层 brace

- **WHEN** 输入为 `"emptyObject": {}, // 空对象`
- **THEN** 输出 SHALL 在一条逻辑 compact 行上为 `"emptyObject": {}, // 空对象`
- **AND** SHALL NOT 为内层空对象 emit `{ // 空对象`

---


#### Scenario: 开括号 head comment 保留

- **WHEN** 输入为 `{ // head` 后接成员
- **THEN** 输出 SHALL 将 `// head` 与 `{` 放在同一行

### Requirement: Document 与容器 comment anchor

根 document 头尾 comment SHALL 使用根值容器的 `open` prefix 区间与 `close` suffix 区间。Object 与 Array 容器节点 SHALL 具有 `open` 与 `close` 的 `AnchorTriplet` 值。三引号字符串节点 SHALL 具有用于 opener 行 comment 的 `open` `AnchorTriplet`。

#### Scenario: 文件头 comment

- **WHEN** 输入在根值之前有行或块 comment
- **THEN** 这些 comment SHALL 从根容器 `open` prefix 区间 emit

#### Scenario: 三引号 opener comment

- **WHEN** 输入包含 `''' // opener` 或 `""" // opener`
- **THEN** comment SHALL 从字符串节点 `open` 区间提取，且 SHALL NOT 出现在 `JSON5.parse` 输出中

---


---

### Requirement: Formatter 重写空白、保留 comment 文本

Emit SHALL 从区间切片输出 comment token 的字面文本。纯空白 HIDDEN token SHALL NOT 从源复制；结构空白（换行、缩进、`:` 与 `,` 周围间距）SHALL 由 formatter 根据 `compact`、`sortKeys` 与 `indent` 选项生成。

#### Scenario: Compact sort 消除仅空白行

- **WHEN** 以 `sortKeys: true, compact: true` 调用 `JSON5.format`
- **THEN** 输出 SHALL NOT 包含仅空白的行
- **AND** SHALL 仍从区间切片保留 comment 文本

#### Scenario: 最后成员 inline 无逗号

- **WHEN** 输入包含无尾随逗号的最后成员 `"zip": "100000" // 邮编`
- **THEN** 在 compact 模式下，输出 SHALL 将 `// 邮编` 保留在与值同一行

### Requirement: ObjectEntry 以 triplet anchor 分组成员

每个 g4 `member` SHALL 表示为一个 `ObjectEntry`，含 `key` 与 `end` 的 `AnchorTriplet` 值，以及 `keySource`、`sortKey` 与 `value`。

#### Scenario: 同一 entry 上的 leading 与 inline comment

- **WHEN** 输入在 key `a` 上一行包含行 comment，随后为 `a: 12 , // inline`
- **THEN** leading comment SHALL 从 `key` prefix 区间提取
- **AND** inline comment SHALL 从 `end` suffix 区间提取

#### Scenario: 重复 key 保留在 entry 中

- **WHEN** 输入按源顺序包含两个相同 key 的成员
- **THEN** AST SHALL 包含两个 `ObjectEntry` 项，且 `JSON5.parse` SHALL 仍应用 last-wins 语义

---

### Requirement: ArrayEntry 使用 triplet anchor 且不排序

每个 g4 数组 `value` 及其后分隔符 SHALL 为 `ArrayEntry`，含 `item` 与 `end` 的 `AnchorTriplet` 值。format 实现 SHALL NOT 在任何 format 选项下重排数组元素。

#### Scenario: 数组元素 inline comment

- **WHEN** 输入在数组内包含 `[ 1 , // comment`
- **THEN** comment SHALL 从元素 `1` 的 array entry `end` suffix 区间提取

---

### Requirement: sortKeys 排序 entry 并附带 comment

当 `sortKeys: true` 时，实现 SHALL 使用 locale 感知字符串比较，按 `sortKey` 稳定排序每个 `ObjectNode.entries` 数组。整个 entry（含 `AnchorTriplet` 值）SHALL 随其 key 移动。数组元素 SHALL NOT 排序。

#### Scenario: 排序后 inline comment 跟随成员

- **WHEN** 对成员带尾随 inline comment 的输入以 `sortKeys: true, compact: true` 调用 `JSON5.format`
- **THEN** 每个 inline comment SHALL 在输出中仍与其成员值同一行

#### Scenario: 重复 key 的稳定排序

- **WHEN** `sortKeys: true` 且两个 entry 共享相同 `sortKey`
- **THEN** 它们的相对顺序 SHALL 与按原始源顺序的稳定排序一致

---

### Requirement: 公共选项下 Format 输出行为不变

Format 输出 SHALL 对 `compact` 与 `sortKeys` 保留现有文档化行为。`indent` 选项 SHALL 为字符串；默认 SHALL 为 `'  '`。Pretty 模式 SHALL 使用结构换行；compact 模式 SHALL 消除仅空白的空行。Emit 中 SHALL 应用尾随逗号移除。

#### Scenario: Pretty 默认匹配 golden baseline

- **WHEN** 在 comment-heavy fixture 上以默认选项调用 `JSON5.format(input)`
- **THEN** 输出 SHALL 与 `test/resources/expected/json5/fixture.default.text` 逐字节一致

#### Scenario: Compact 匹配 golden baseline

- **WHEN** 在 comment-heavy fixture 上调用 `JSON5.format(input, { compact: true })`
- **THEN** 输出 SHALL 与 `test/resources/expected/json5/fixture.compact.text` 逐字节一致

#### Scenario: Compact sort 不产生仅空白行

- **WHEN** 以 `sortKeys: true, compact: true` 调用 `JSON5.format`
- **THEN** 输出 SHALL NOT 包含仅空白的行

#### Scenario: Sort compact 匹配 golden baseline

- **WHEN** 在 comment-heavy fixture 上调用 `JSON5.format(input, { sortKeys: true, compact: true })`
- **THEN** 输出 SHALL 与 `test/resources/expected/json5/fixture.sort-compact.text` 逐字节一致

#### Scenario: 每层 Tab 缩进

- **WHEN** 在 pretty 模式下调用 `JSON5.format(input, { indent: '\t' })`
- **THEN** 每个嵌套层级 SHALL 按深度每层增加一个 tab 字符缩进

#### Scenario: 每层自定义 indent 字符串

- **WHEN** 在 pretty 模式下调用 `JSON5.format(input, { indent: '    ' })`
- **THEN** 每个嵌套层级 SHALL 相对父行每层增加四个空格

#### Scenario: 输出中的三引号 opener comment

- **WHEN** 输入在字符串体前包含 `''' // 三引号注释`
- **THEN** pretty/compact 输出 SHALL 在格式化字符串字面量 emit 中将 `// 三引号注释` 保留在 opener 行

#### Scenario: Format 时剥离尾随逗号

- **WHEN** 输入为 `{ a: 1, }` 且以默认选项调用 `JSON5.format`
- **THEN** 输出 SHALL NOT 在 `}` 前包含尾随逗号

---

### Requirement: indent 选项仅为字符串

`FormatOptions.indent` SHALL 为字符串。实现 SHALL NOT 接受遗留的 `{ type, size }` 对象形式。`DEFAULT_FORMAT_OPTIONS.indent` SHALL 为 `'  '`。

#### Scenario: 不支持对象 indent 被拒绝或忽略

- **WHEN** 调用方传入 `indent: { type: 'space', size: 2 }`
- **THEN** 实现 SHALL NOT 将其视为有效 indent 配置（MAY 抛出或产生错误输出；调用方 MUST 迁移到字符串形式）

#### Scenario: 空字符串 indent

- **WHEN** 在 pretty 模式下调用 `JSON5.format(input, { indent: '' })`
- **THEN** 结构换行 SHALL 仍 emit，但成员行 SHALL 每层无额外 indent 前缀

---

### Requirement: 性能优化后 Format 输出不变

JSON5 format 流水线中所有内部性能优化 SHALL 保留现有测试验证的精确格式化行为。

#### Scenario: 现有 expected fixture 不变

- **WHEN** `npm test` 针对存储的 expected 文件运行所有 json5 format 用例
- **THEN** 每个 format 断言 SHALL 通过，且 SHALL NOT 更新任何 expected 文件

---

### Requirement: Document AST 构建使用线性 token 扫描

format Document AST builder SHALL NOT 需要单独的 token 预索引 pass。

#### Scenario: 无 TokenIndex 的构建

- **WHEN** 在任何 `fillTokens: true` 的输入上运行 `buildDocumentAst`
- **THEN** 实现 SHALL NOT 调用 `buildTokenIndex` 或为 token 导航分配预索引数组

---

### Requirement: 范围限于 JSON5 format 实现

性能优化 SHALL 仅应用于 `src/parser/json5/format/` 与 `src/parser/json5/format.js` 下模块。它们 SHALL NOT 修改 `parse.js`、`validate.js`、共享 core 或 ANTLR 语法。

#### Scenario: Parse 与 validate 依赖图不变

- **WHEN** 分析 `antlr4_help/json5/parse` 与 `antlr4_help/json5/validate` 的静态导入图
- **THEN** SHALL NOT 出现超出变更前基线的来自 `src/parser/json5/format/` 的新导入

---


#### Scenario: 逗号与 next-token 解析不变

- **WHEN** 构建带逗号与 hidden-channel token 的对象或数组成员
- **THEN** 逗号与 next-token 坐标 SHALL 与现有测试验证的行为一致

#### Scenario: Format subpath 仍隔离

- **WHEN** 分析 `antlr4_help/json5/format` 的静态导入图
- **THEN** 它 SHALL NOT 超出现有 `format.js` 门面模式导入 `parse.js` 或 `validate.js`

#### Scenario: 所有 format 选项组合保留

- **WHEN** 在现有测试输入上以 default、`{ compact: true }`、`{ sortKeys: true, compact: true }` 与 tab indent 选项调用 `JSON5.format`
- **THEN** 每种组合的输出 SHALL 与优化前结果一致

#### Scenario: sortKeys transform 快于 entry spread 基线

- **WHEN** 在含 2000 个 key 的扁平对象上以 `{ sortKeys: true }` 运行 `transformDocumentAst`
- **THEN** transform 阶段 wall time SHALL 小于 `bench-v2.7.1.json` 基线（200 次运行约 ~0.31 ms/op）

### Requirement: Transform sortKeys 路径使用原地更新

format AST transform 步骤在应用 `sortKeys` 时 SHALL 原地更新 object 与 array entry，避免 entry 对象与 document 节点的不必要 spread 拷贝。

#### Scenario: 稳定排序保留

- **WHEN** 两个对象 key 在 `localeCompare` 下相等
- **THEN** 它们的相对顺序 SHALL 与 transform 前源顺序一致

---

### Requirement: json5 模块 spec 提供简体中文 mirror 文档

`openspec/specs/json5/spec.zh.md` SHALL 完整 mirror `spec.md`（简体中文），并遵循与 json4 文档 requirement 相同的保留规则。

#### Scenario: json5 mirror 存在

- **WHEN** 检出仓库
- **THEN** `openspec/specs/json5/spec.zh.md` SHALL 存在
- **AND** 其 SHALL 涵盖 module layout、parse sortKeys、format AST/triplet 与 perf requirement

