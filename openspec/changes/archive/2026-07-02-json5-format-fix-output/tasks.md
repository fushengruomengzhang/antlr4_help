## 1. Build-document HIDDEN 去重

- [x] 1.1 在 `TokenStreamReader` 或 `DocumentBuilder` 增加 `consumedHiddenIndices` 与 `hiddenBetween` / `markHidden` / `takeHiddenLeft` 辅助方法
- [x] 1.2 容器 `openRight` 分配后 mark 对应 hidden token；`entry.before` 改为 `pendingBefore || takeHiddenLeft(key)`
- [x] 1.3 `right` 与 comma→nextKey gap 中的 hidden token 在分配后 mark consumed
- [x] 1.4 空容器 `closeBefore` 改用 `hiddenLeft(closeTok)`，不用 `spanBetween(open, close)`

## 2. Emit 修复

- [x] 2.1 移除 pretty 模式三引号 close 转 `"""` 逻辑，保持 `'''`/`"""` 一致
- [x] 2.2 验证 compact 空嵌套对象 emit 与修复后的 AST 一致

## 3. 测试与验证

- [x] 3.1 在 `test/json5-format-standalone.mjs` 增加注释去重、三引号 round-trip、空对象 compact 断言
- [x] 3.2 运行 `node test/json5-format-out.mjs` 与 `npm test`，确认对比改善

## 4. 第二轮修复（对比校验后续）

- [x] 4.1 修复 `closeRight` / `document.after` 互斥（`takeHiddenRight`）
- [x] 4.2 修复最后一项 member `right` 与 `closeBefore` 重叠；末项 gap 改用 `hiddenBetween`
- [x] 4.3 修复空容器 `closeBefore` 与 `hiddenLeft` 重复
- [x] 4.4 compact/pretty 空容器 emit 换行布局（可再解析）
- [x] 4.5 sort 时 `trailingSep` 合并到源序末 entry.sep
- [x] 4.6 compact emit `normalizeEntryBeforeCompact` 减少空白行
