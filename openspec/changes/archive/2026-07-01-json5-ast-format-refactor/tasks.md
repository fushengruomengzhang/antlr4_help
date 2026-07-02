## 1. AST 类型与基础设施

- [x] 1.1 新增 `src/parser/json5/ast-types.js`（JSDoc typedef：DocumentNode、ObjectNode、ObjectEntry、ArrayNode、ArrayEntry、StringNode、primitive nodes）
- [x] 1.2 抽取 token 辅助函数（hiddenLeft、hiddenRight、hiddenBetween）到 builder 可复用模块，或内聚于 ast-builder

## 2. AST Builder（grammar-driven）

- [x] 2.1 实现 `buildDocumentAst(tree, tokenStream)` 入口：Document before/after + 根 value
- [x] 2.2 实现 ObjectNode builder：openRight、entries[]、trailingSep、closeBefore/closeRight；从 `ctx.member()` 与 `ctx.COMMA(i)` 划分 sep
- [x] 2.3 实现 ObjectEntry 槽位：before（key 左）、right（value→COMMA 不含 COMMA）、sep（COMMA+hidden→下一 key）
- [x] 2.4 实现 ArrayNode / ArrayEntry builder（同 Object 模式，用 `ctx.value()` + `ctx.COMMA(i)`）
- [x] 2.5 实现 value 递归：primitive、object、array、三引号 string（openRight）
- [x] 2.6 复用 `value-visitor.js` 的 `keyToString`、`keySource` emit 形态、value 解码逻辑

## 3. AST Builder 单测

- [x] 3.1 新增 ast-builder 测试文件（如 `test/json5-ast-builder.mjs`）
- [x] 3.2 覆盖：前行+行尾注释同一 entry（`a:12 , // 2` + before `// 1`）
- [x] 3.3 覆盖：`json5.sort-prefix-comment.text` 槽位划分
- [x] 3.4 覆盖：container openRight、trailingSep、document before/after
- [x] 3.5 覆盖：三引号 openRight；duplicate key 两条 entry

## 4. Transform 层

- [x] 4.1 新增 `src/parser/json5/ast-transform.js`
- [x] 4.2 实现 `sortKeys`：递归 ObjectNode.entries 稳定排序
- [x] 4.3 实现 trailingSep / array trailingSep 去尾逗号（transform 阶段，build 不 mutate）

## 5. AST Emit 层

- [x] 5.1 实现 `emitDocument(ast, options)`：按槽位顺序输出
- [x] 5.2 实现 compact emit 路径（压空行、保留源字符串形态）
- [x] 5.3 实现 pretty emit 路径（indent、双引号规范化、`'''`→`"""`）
- [x] 5.4 将 `format()` 入口切换为 build → transform → emit

## 6. 删除旧逻辑与回归

- [x] 6.1 删除 `format-emitter.js` 中 sort 启发式（hiddenLeftForSortedMember、memberSuffixForSortedMember、isNextMemberPurePrefix、spanCache、markHiddenEmitted 等）
- [x] 6.2 运行 `npm test`，修复所有 `json5.sort-*.text` 及 golden case 回归
- [x] 6.3 运行 `node scripts/bench-json5.mjs` 确认无显著性能退化
- [x] 6.4 确认 `JSON5.parse` / `JSON5.validate` 行为未变；无新 public API

## 7. 文档

- [x] 7.1 若 README / `index.js` 模块注释需反映内部架构，做最小更新（对外 API 描述不变）
