## 1. 基准与 baseline

- [x] 1.1 新增 `scripts/bench-json5.mjs`（主 fixture + 50/200/500 key synthetic；format default/compact/sort+compact/parse）
- [x] 1.2 在优化前运行 bench，将 ms/op 记录到 PR 或 design 备注

## 2. P0 性能优化

- [x] 2.1 实现 `ensureTokensFilled()`；构造时 fill 一次；替换四处裸 `fill()`
- [x] 2.2 实现 `buildMemberIndexMap(sourceMembers)`；sort 路径传入 `memberIdx` 替代 `indexOf`
- [x] 2.3 sort key 预计算（compact + pretty 两处 sort）；稳定排序保留同 key 源码序

## 3. P1 性能优化

- [x] 3.1 `indentUnit` depth 缓存（实例级 Map）
- [x] 3.2 object 级 `spanBetween` 缓存（formatObject* 作用域；exclude 路径正确 filter）
- [x] 3.3 实现 `TextBuf`（或等价 parts 辅助）；重构四 container formatter 的 `out +=`

## 4. 中文注释

- [x] 4.1 `format-emitter.js` 全部方法补中文 JSDoc 首行（含 sort 锚定约束说明）
- [x] 4.2 `parse-pipeline.js` 导出函数与 `CollectingErrorListener` 补中文说明

## 5. 验证与发布

- [x] 5.1 `npm test` 全绿；主 fixture 四种 format 模式 byte-equal 抽检
- [x] 5.2 跑 bench 对比 P0/P1 前后；500 key sort+compact 有 measurable 提升
- [x] 5.3 `openspec validate --all` 通过
- [x] 5.4 bump `package.json` 至 `2.5.1`；提交 `release: v2.5.1 JSON5 format 性能优化`
