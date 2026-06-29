## 1. FormatOptions 与类型

- [x] 1.1 `normalizeFormatOptions` 与 JSDoc 增加 `compact`（默认 `false`）
- [x] 1.2 `DEFAULT_FORMAT_OPTIONS` 增加 `compact: false`

## 2. Compact 值 emit

- [x] 2.1 实现 `emitSourceValue(ctx)`：STRING / TRIPLE_* / NUMBER / literal 等 emit 源 token 文本
- [x] 2.2 compact 路径调用 `emitSourceValue`，pretty 路径保持 `formatPrimitiveValue`

## 3. Compact 布局（object / array）

- [x] 3.1 非空容器 opening：`hiddenRight(ctx.start)` 且与首个 member `hiddenLeft` 去重
- [x] 3.2 实现 member/element 后缀区间（value 末 token → 下一项 key/start），含逗号与行尾注释
- [x] 3.3 嵌套 object/array value 紧凑 opening（`"key": { // comment`）
- [x] 3.4 控制空行：compact 不插入多余 `\n\n`；保留 member 级 `\n` + indent
- [x] 3.5 尾逗号移除、closing `hiddenLeft(stop)` 去重（复用现有逻辑）

## 4. 验证与文档

- [x] 4.1 单测/scenario：容器头同行、行尾注释同行、单引号/`'''` 保留、sortKeys+compact
- [x] 4.2 `test/run.mjs` 增加 compact 输出 → `out/test.json5.format.compact.text`
- [x] 4.3 对比 `test.json5.text` compact 输出与 `target.json5.format.text`（117 条注释 + 布局）
- [x] 4.4 确认默认 `format()` 输出与 `test.json5.format.text` 无回归
- [x] 4.5 更新 README FormatOptions；`openspec validate --all`
