## 1. Format 模块骨架

- [x] 1.1 创建 `src/parser/json5/format/`：`types.js`、`format-options.js`（自 format-emitter 迁移选项）
- [x] 1.2 创建 `src/parser/json5/decode.js`（自 value-visitor 抽出 keyToString、string decode 等共享逻辑）

## 2. AST build 阶段

- [x] 2.1 实现 `format/ast-builder.js`：`buildDocumentAst(tree, tokenStream)`，COMMA 驱动 entry 槽位
- [x] 2.2 新增 builder 单测或 run.mjs 级断言（sort prefix / inline / openRight case）
- [x] 2.3 实现 `format/ast-transform.js`：sortKeys 稳定排序、stripTrailingComma

## 3. Emit 与 pipeline 接线

- [x] 3.1 实现 `format/emit.js`：从 format-emitter 迁移布局逻辑，无 hidden 考古
- [x] 3.2 实现 `format.js` 入口：parse → build → transform → emit
- [x] 3.3 切换 `index.js` 使用新 `format.js`；删除 `format-emitter.js`

## 4. API 模块拆分（json5-module-layout）

- [x] 4.1 实现 `validate.js`、`parse.js`；更新 `index.js` 三模块聚合
- [x] 4.2 删除 `value-visitor.js`；确认 parse/validate 不 import `format/`

## 5. 验证

- [x] 5.1 运行 `npm test` 全量通过
- [x] 5.2 运行 `scripts/bench-json5.mjs` 确认无显著性能退化
- [x] 5.3 若 baseline 有 intentional cosmetic 差异，运行 `npm run test:update-expected`
