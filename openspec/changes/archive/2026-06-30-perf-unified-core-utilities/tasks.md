## 1. 基准与 baseline

- [x] 1.1 运行现有 `scripts/bench-json5.mjs` 与内联 JSON4/Java8/API bench，将 ms/op 记录到 design 备注或 PR 描述
- [x] 1.2 新增 `scripts/bench-all.mjs` 骨架（bench helper + fixture 路径），可先只打印 JSON4.parse 一行以验证可运行

## 2. Phase A — 抽取共享 core 模块（行为不变）

- [x] 2.1 新建 `src/parser/core/text-buf.js`，从 `format-emitter.js` 迁移 `TextBuf` class
- [x] 2.2 新建 `src/parser/core/string-decode.js`，从 `json/string-utils.js` 迁移 decode/encode；`string-utils.js` 改为 re-export
- [x] 2.3 新建 `src/parser/core/visit-helpers.js`，实现 `visitArrayChildren`
- [x] 2.4 新建 `src/parser/core/error-listener.js`，迁移 `CollectingErrorListener` + `throwIfErrors`
- [x] 2.5 更新 `format-emitter.js` import 共享 `TextBuf`；删除私有 class
- [x] 2.6 更新 `parse-pipeline.js` import 共享 error listener；删除私有 class
- [x] 2.7 更新 `peek-first-class-name.js` import 共享 error listener；删除私有 class 与重复 `throwIfErrors`
- [x] 2.8 `npm test` 全绿（Phase A 零行为变更验收）

## 3. Phase B — 共享层与 format 优化（byte-equal）

- [x] 3.1 优化 `decodeJsonString`：无转义快路径 + TextBuf/parts 拼接
- [x] 3.2 JSON4 `value-visitor.js` 改用 `visitArrayChildren`
- [x] 3.3 JSON5 `value-visitor.js` 改用 `visitArrayChildren`
- [x] 3.4 优化 `TextBuf.beginMemberLine` / `beginCloseLine`（避免全量 join）
- [x] 3.5 `formatDocument` 与 `emitTripleSingleString` / `emitTripleDoubleString` 改用 `TextBuf`
- [x] 3.6 新增 core 模块中文 JSDoc；更新改动入口注释
- [x] 3.7 `npm test` 全绿；主 fixture 四种 JSON5 format byte-equal 抽检

## 4. Phase C — Pipeline SLL + LL fallback

- [x] 4.1 在 `parse-pipeline.js` 实现 SLL 尝试 + reset + LL 重试
- [x] 4.2 验证 JSON4 / JSON5 / Java8 合法与非法输入；`npm test` 全绿

## 5. Phase D — 薄层收尾与 bench

- [x] 5.1 `java8ToApiSchema`：未传 `rootClass` 时从 `fileModels[0].types[0]?.name` 取 root，移除 `firstClassName` 二次 parse
- [x] 5.2 完善 `scripts/bench-all.mjs`：JSON4 / JSON5 / Java8 / API + synthetic 大 object
- [x] 5.3 跑 bench-all 对比优化前后；500 key sort+compact 与 JSON4 2000 key 记录结果
- [x] 5.4 `openspec validate --all` 通过
- [x] 5.5 bump `package.json` patch 版本；提交 release commit
