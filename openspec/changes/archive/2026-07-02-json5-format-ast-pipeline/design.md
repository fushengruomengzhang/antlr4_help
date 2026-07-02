## Context

```
现状                              目标
────                              ────
format-emitter.js (850行)         format.js → format/
  parse + emit 考古                 ├─ ast-builder.js
  sort 后 isNextMemberPurePrefix    ├─ ast-transform.js
                                    └─ emit.js (无考古)
value-visitor.js (混用)           validate.js + parse.js + shared decode
Json5Parser.g4 (value)            不变 — comment 仍 HIDDEN
```

主 spec `json5-format-ast` 与 archive `json5-ast-format-refactor` 设计已完整；已删 JSON5Format 的 `types/transform/emit` 思路可借鉴，**build 须按 value grammar + COMMA 重写**（无 `layout` 节点）。

`json5-module-layout` spec 要求 format 实现在 `format/` 下且三 API 不交叉 import。

## Goals / Non-Goals

**Goals:**

- 实现 build → transform → emit，对齐 `json5-format-ast`
- build 在源码顺序分配 comment；transform 做 sortKeys；emit 只拼槽位
- 删除 `isNextMemberPurePrefix`、`hiddenLeftForSortedMember`、`memberSuffixForSortedMember` 等
- 落地 `validate.js` / `parse.js` / `format.js` + `format/` 目录
- `npm test` 全绿

**Non-Goals:**

- 修改 g4 或引入第二套 grammar
- 恢复 `JSON5Format` export
- 第一版 `Comment[]` 结构化（槽位仍为 opaque string）
- 改 JSON4 / Java8 / API

## Decisions

### D1: 单 grammar build 算法（COMMA 驱动）

对每个 `object.member[i]`（源码顺序）：

| 槽位 | 来源 |
|------|------|
| `before` | `hiddenLeft(key.start)` |
| `value` | 递归 buildValue |
| `right` | hidden 从 `value.stop` 到 `object.COMMA(i).start`（不含 COMMA） |
| `sep` | `COMMA.text` + hidden 直到 `member[i+1].key.start` |
| `trailingSep` | 末 member 后 g4 可选 `COMMA?` + hidden |

Array 同理，用 `array.COMMA(i)`。Document / 容器 `openRight` / `closeBefore` / 三引号 `openRight` 同 archive D2/D5。

**理由：** g4 已有 `object.COMMA(i)`；源码顺序 build 使 prefix 自然归当前 entry，sort 后整 entry 移动。

### D2: 文件布局（对齐 json5-module-layout）

```
src/parser/json5/
├── index.js
├── validate.js
├── parse.js
├── format.js              # parse pipeline + build + transform + emit
├── decode.js              # 自 value-visitor 抽出共享 decode/keyToString
└── format/
    ├── types.js
    ├── format-options.js
    ├── ast-builder.js
    ├── ast-transform.js
    └── emit.js
```

`format.js` 仅 import `format/*` 与 core pipeline；`parse.js` / `validate.js` 不 import `format/`。

### D3: 迁移 emit 逻辑

从 `format-emitter.js` 提取 **布局** 部分到 `format/emit.js`（compact/pretty、TextBuf、indent），去掉所有 hidden 考古 helper。

可参照 archive 已删 `json5-format/emit.js` 的槽位拼接顺序，行为对齐 legacy 输出。

### D4: 分阶段切换

1. **Phase 1** — `ast-builder.js` + builder 单测（槽位断言，case 输入）
2. **Phase 2** — `transform.js` + `emit.js` + `format.js` 接线
3. **Phase 3** — 拆分 validate/parse；删 `format-emitter.js`、`value-visitor.js`
4. **Phase 4** — 全量 test + bench；必要时 `test:update-expected`

不在 Phase 1 删旧路径，直到 Phase 2 端到端绿。

### D5: 输出兼容性

优先 **语义一致**（case 断言 + valueEqual）；byteEqual 与 `expected/json5/` 不一致时可 update baseline，须无 comment dup、sort prefix 错位的回归。

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| build 边界与 legacy 细微差异 | builder 单测 + 现有 sort case |
| emit 迁移工作量大 | 先 compact+sort，再 pretty |
| 与 json5-module-layout 同批改动 | format/ 目录一次到位 |
| 性能 | bench-json5.mjs；build 一次应 ≤ 现 emit 多次考古 |

## Migration Plan

1. 新增 `format/` 模块，旧 `format()` 暂保留
2. 新 pipeline 通过后切换 `format.js`
3. 删 `format-emitter.js`；拆 validate/parse
4. `npm test` 绿

Rollback: git revert 恢复 `format-emitter.js` 入口。

## Open Questions

- （无）decode 共享放 `decode.js` 还是 `format/decode.js` — 实施时选 `json5/decode.js` 供 parse 与 format builder 共用
