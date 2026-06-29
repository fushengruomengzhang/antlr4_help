## 1. FormatEmitter 文档级注释

- [x] 1.1 修改 `formatDocument`：在 `formatValue` 前 emit `hiddenLeft(valueCtx.start)`
- [x] 1.2 在 `formatValue` 后 emit `hiddenRight(endToken(valueCtx))`；调整 `trimEnd` 避免剥掉尾部注释

## 2. Bracket 锚点修复

- [x] 2.1 `formatObject`：用 `ctx.start`/`ctx.stop` 替代 `ctx.LBRACE()`/`ctx.RBRACE()` 做 hidden-token 查询
- [x] 2.2 `formatArray`：用 `ctx.start`/`ctx.stop` 替代 `ctx.LBRACK()`/`ctx.RBRACK()`
- [x] 2.3 非空容器不 emit `hiddenRight(start)`（避免与首个子项 `hiddenLeft` 重复）；空容器 emit opening/closing 间隙注释
- [x] 2.4 非空容器闭合前 emit `hiddenLeft(ctx.stop)`（最后 member 与 `}`/`]` 之间）

## 3. 验证与测试

- [x] 3.1 手工验证 spec 新增 scenario：文档首尾、空 object/array、member 与 `}` 之间、`sortKeys` member 注释
- [x] 3.2 对 `test/resources/test.json5.text` 运行 format，确认输入/输出注释条数一致（117）
- [x] 3.3 运行 `node test/run.mjs`，更新 `test/resources/out/test.json5.format*.text` 快照
- [x] 3.4 运行 `openspec validate --all` 确认 change 与 spec 合法
