## Context

`json5.format` 通过 `FormatEmitter` 从 CST + HIDDEN token 重建输出。默认模式（`compact: false`）对每个 member 强制 `\n` + indent，value 走 `formatPrimitiveValue` 规范化字符串，导致：

1. 行尾 `//` 常落在独立行（hidden 区间与 COMMA 锚点分离）
2. `{` 与容器头注释分行
3. member 间产生大量空行

用户金标准 `test/resources/target.json5.format.text` 体现 **comment-aware tidy** 风格：紧凑布局 + 保留源字符串 token。

## Goals / Non-Goals

**Goals:**

- 新增 `compact: true` 选项，输出对齐 `target.json5.format.text`
- `compact: false` 行为与输出不变
- compact 模式复用已有注释锚定规则（含文档首尾、sortKeys）
- `test.json5.text` + `compact: true` 输出与 target 注释条数一致、布局紧凑

**Non-Goals:**

- 不改变 `json5.parse` / grammar
- 不替换默认 format 为 compact
- 不新增独立的 `preserveStringStyle` 选项（bundle 进 compact）

## Decisions

### 1. `compact` 作为 FormatOptions 布尔开关

```javascript
{ indent, sortKeys, compact: false }
```

**Rationale**：与 `sortKeys` 同级，API 简单；默认 false 保证非 BREAKING。

### 2. compact 捆绑布局 + 字符串保留

| 行为 | compact: false | compact: true |
|------|----------------|---------------|
| 字符串 value | 规范化（`"`、`"""`） | emit 源 token 文本 |
| 布局 | 结构换行清晰 | 紧凑、行尾注释同行 |
| 注释锚定 | 同 | 同 |
| 尾逗号 | 移除 | 移除 |

**Alternative**：拆分 `preserveStringStyle` — 拒绝，增加组合爆炸且用户 target 需要两者同时成立。

### 3. member 后缀区间（compact 布局核心）

pretty 模式行尾注释丢失/拆行，因 `hiddenRight(value.stop)` 止于下一个 on-channel token（常为 `,`），而 `// comment` 在 COMMA 之后。

compact 模式对每个 member 计算：

```
memberSuffix = hidden tokens from member 末 token 到下一 member.key（或容器 close）
```

emit 顺序：`key + ": " + value + memberSuffix`（单行或紧凑多行），逗号从 suffix 保留或由 emitter 补充，最后一项去掉尾逗号。

### 4. 容器 opening（compact）

非空 object/array 在 compact 下 emit `hiddenRight(ctx.start)`，使 `{ // head` 同行。与 pretty 不同（pretty 故意跳过以防与 `hiddenLeft(firstKey)` 重复）；compact 需同行展示，且 member 前缀不再重复 absorb 同一段 hidden（member 循环仍 `hiddenLeft(key)`，需去重 opening 区间或调整 absorb 策略）。

**策略**：compact 非空容器 emit `hiddenRight(openTok)`；首个 member 的 `hiddenLeft(keyTok)` 过滤掉已在 opening 区间 emit 的 token index（与 closing 去重同理）。

### 5. 实现结构

单 `FormatEmitter` 内 `if (this.options.compact)` 分支：

- `emitValueText(ctx)` — compact 用 token 原文，pretty 用现有逻辑
- `formatObject` / `formatArray` — compact 子路径处理 opening、memberSuffix、少空行
- 共用 `hiddenLeft` / `hiddenRight` / `formatDocument` 文档级注释

**Alternative**：独立 `CompactFormatEmitter` 类 — MVP 用分支，减少文件碎片化。

### 6. 空行控制

compact emit hidden 时：

- 保留语义换行（member 前 `\n` + indent）
- 不额外插入 `\n\n`
- `emitHidden` 后可选 `collapseBlankLines`：连续 `\n` 压为单个（仅 compact）

### 7. 测试

- `test/run.mjs` 增加 `json5.format(json5Input, { compact: true })` → `out/test.json5.format.compact.text`
- 与 `test/resources/target.json5.format.text` 对比（内容一致或 documented 允许差异）

## Risks / Trade-offs

- **[Risk] compact + sortKeys 布局与 target 不同** → 预期；单测覆盖 sortKeys+compact 注释锚定
- **[Risk] memberSuffix 与程序 `,` 重复** → suffix 已含逗号则不再 insert
- **[Risk] 双路径维护** → 共用 hidden 工具与 formatDocument；compact 仅布局/value emit 分支
- **[Risk] target 逐字不完全匹配** → 以注释完整 + 关键布局 scenario 为主，允许行尾空白微差

## Migration Plan

1. 实现 compact 分支
2. 更新 `test/run.mjs` 与 out 快照
3. 更新 README FormatOptions 文档
4. 无需消费者迁移

## Open Questions

（无 — explore 阶段已确认 bundle 字符串保留与 target 为金标准）
