## Context

`fix-json5-sort-compact` 已让 sort+compact 改用 `hiddenLeft`/`hiddenRight` 锚定，避免 `spanBetween(sortedNextKey)` 反向区间导致 member 重复。但新路径的 member 后缀仅取 `hiddenRight(valStop)`，再在**注释之后**程序化插入逗号，产生两个问题：

1. **锚定错位**：源码形态 `value, // comment` 中，注释词法上位于逗号与下一 key 之间，落在下一 member 的 `hiddenLeft(key)`，排序后与错误 member 关联。
2. **顺序错误**：emit 顺序为 `value → // comment → ,`，与 compact golden（`value, // comment`）及 `test/tojson5.js` 不一致。

无 sort 的 compact 仍用 `spanBetween(valStop, nextKey)`（源码顺序），能正确保留 `, // comment`；sort 路径应借鉴同一思路，但 **nextKey 必须是该 member 在源码中的下一项**，而非排序后的下一项。

## Goals / Non-Goals

**Goals:**

- `sortKeys: true`（compact 与 pretty）时，非末项 member 行尾 inline 注释输出为 `value, // comment` 且与 value 同行（compact）
- 逗号后的行尾注释随**拥有该逗号的 member** 移动，排序后不挂到其它 key
- `sortKeys: false` 行为不变
- `test.json5.format.sorted.text` 与 golden compact 行尾注释风格一致（`, //` 形态）
- 补充小 fixture 断言 sort + inline comment

**Non-Goals:**

- 不改变 `sortKeys` 默认值或隐式开启 `compact`
- 不重写无 sort 的 `spanBetween` compact 路径
- 不规定 block 注释必须压成单行（多行 `/** */` 仍可按现有规则换行）
- 不处理 JSON5 语法不允许的「末项 value 后直接 `//` 无逗号且非容器末项」输入（parser 本就报错）

## Decisions

### 1. sort 路径用「源码顺序 member 后缀区间」

在 `formatObjectCompact` / `formatObjectPretty`（及 array 对称路径）的 sort 分支中，对每个 member `m`：

```
sourceNext = 源码 member 数组中 m 的下一项 key.start，或容器 close token
suffix     = spanBetween(endToken(m.value), sourceNext)
```

末项（**排序后**容器内最后一项）对 suffix 应用现有 `stripTrailingCommaSuffix`。

**Rationale**：`spanBetween` 按 token 索引递增，只要 `sourceNext` 在源码中位于当前 value 之后，区间恒为正，与 emit 排序无关；且自然包含 `,`、hidden 注释、换行，保留 `, // comment` 形态。

**Alternative considered**：继续 `hiddenRight` + 从 `hiddenLeft(nextKey)` 拆分注释 — 需启发式区分「member 前注释」与「上一项行尾注释」，边界 case 多；弃用。

### 2. prefix 仍用 hiddenLeft(key)

key 前注释（含独立行的 `// about b`）继续 `hiddenLeft(keyTok)`；因 suffix 区间止于 **下一源码 key 起点**，不会吞掉下一 member 的 prefix。

sort 分支 opening：`hiddenRight(openTok)` 仍跳过（与现逻辑一致），容器头注释由首 member 的 `hiddenLeft` 或 opening 策略承担。

### 3. 逗号顺序规范化（防御性）

若 suffix 捕获到非常规 ` // comment ,`（输入如此），normalize 为 `, // comment`（复用/扩展 `stripTrailingCommaSuffix` 或小型 reorder helper），避免注释后逗号。

**Rationale**：spec 要求 `, //`；防御性处理避免 sort 路径 regress。

### 4. pretty + sortKeys 同步修复

pretty 模式 sort 分支当前为 `hiddenRight` + `,`（逗号在注释后），与 compact 同源 bug；一并改为源码顺序 `spanBetween` suffix，逗号由 suffix 携带或 strip，不在注释后 append。

### 5. array 元素

`formatArrayCompact` / `formatArrayPretty` 的 sort 分支（若存在 sort 或仅有 emit 顺序问题）对元素 `i` 使用 `spanBetween(endToken(values[i]), values[i+1].start)` 作为后缀，规则同 object member。

（注：当前 `sortKeys` 不排序 array；若 array 路径无 sort 分支但 pretty 有相同 hiddenRight+comma 顺序问题，仍按源码 `spanBetween` 统一后缀语义。）

### 6. 测试

- 新增 `cases/json5.sort-inline-comment.text`：`{ "score": 99.5, "age": 18, // 年龄\n "hex": 0xFF }`
- assert 输出含 `"age": 18, // 年龄`（substring），且 `// 年龄` 不在 `"score"` 行
- 重新生成 `test.json5.format.sorted.text`；可选 assert 若干 `, //` 计数不低于 golden 比例

## Risks / Trade-offs

- **[Risk] suffix 区间含下一 member 的 leading 空白** → 区间止于 next **key** token，不含 key 文本；与现 spanBetween 行为一致
- **[Risk] 末项在源码非末项但排序后为末项** → 对输出末项 strip 尾逗号；comment 保留在 value 后
- **[Risk] 快照大面积 diff** → 预期；sorted.text 向 golden compact 风格靠拢
- **[Risk] member 与 `}` 之间注释** → 仍由 `hiddenLeft(close)` 处理；与 lastMemberTrailingHidden 去重逻辑保持

## Migration Plan

1. 实现 object/array sort 后缀收集改用源码顺序 `spanBetween`
2. pretty sort 去掉「注释后 append 逗号」
3. 新增 case + 更新 sorted 快照
4. 跑 `npm test` 确认 compact-only、pretty-only、sort-only 无回归

## Open Questions

（无）
