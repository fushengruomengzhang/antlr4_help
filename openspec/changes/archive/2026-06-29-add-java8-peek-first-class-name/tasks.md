## 1. 实现 peekFirstClassName

- [x] 1.1 新增 `src/parser/java8/peek-first-class-name.js`：专用 parse pipeline + ParseListener，在 body 入口 cancel
- [x] 1.2 实现取名逻辑（class/interface/enum/@interface，跳过顶层 `;`），与 `extractFirstClassName` 语义对齐
- [x] 1.3 区分 cancel（成功取名）与真实 ParseError；header/package/import 非法仍抛 ParseError

## 2. 导出与文档

- [x] 2.1 在 `src/index.js` 导出 `JAVA8.peekFirstClassName` 并补充 JSDoc（与 `firstClassName` 对比说明）
- [x] 2.2 确认 `first-class-name.js` 未被修改

## 3. 集成测试

- [x] 3.1 新增 body 非法小 fixture（如 `test/resources/cases/java8.peek-invalid-body.java.text`）
- [x] 3.2 在 `test/run.mjs` 增加 `java8 peekFirstClassName` case 及 peek vs strict 对比断言
- [x] 3.3 运行 `npm test` 全绿
