## Context

`Json5Lexer.g4` 第 21–27 行用 `.*?` 匹配三引号字符串，开引号行注释无法走 `LINE_COMMENT`/`BLOCK_COMMENT` HIDDEN 通道。用户已确认：(1) 开引号行 `//`、`/* */` 不进 parse；(2) format 保留 `'''`/`"""` delimiter；(3) golden 与 fixture 一致。另需修复三引号不成对（未闭合、delimiter 混用、lexer 边界）问题。

## Goals / Non-Goals

**Goals:**

- Lexer 模式拆分三引号 token；开引号**同一行**行/块注释 → HIDDEN
- Parser 结构规则；`decodeJson5String` 只解 BODY
- Format 全模式保留 delimiter + 还原开引号行注释
- 未闭合 / EOF in mode / `'''` 与 `"""` 混关 MUST ParseError
- 测试与 golden 对齐 `test.json5.text` 的 `names` 字段

**Non-Goals:**

- 修改单行 `STRING` 规则
- 闭引号同行注释（仍走 member `hiddenRight`）
- 正文中 `//`、`/* */` 改为注释（仍为字符串内容）

## Decisions

### 1. Lexer 模式（`'''` 为例，`"""` 对称）

```
DEFAULT
  TRIPLE_S_OPEN: ''' -> pushMode(TRIPLE_S_FIRST)

TRIPLE_S_FIRST  (开引号同一行)
  TRIPLE_S_FIRST_LINE_COMMENT: // ... -> HIDDEN
  TRIPLE_S_FIRST_BLOCK_COMMENT: /* */ -> HIDDEN
  TRIPLE_S_FIRST_SP: [ \t]+ -> HIDDEN
  TRIPLE_S_FIRST_NL: [\r\n]+ -> mode(TRIPLE_S_BODY)
  TRIPLE_S_CLOSE: ''' -> mode(DEFAULT)    // 空串 '''''' 或 ''' // only '''

TRIPLE_S_BODY
  TRIPLE_S_CLOSE: ''' -> mode(DEFAULT)
  TRIPLE_S_BODY_CHAR: (~'|'|'~''|'~''')+  // 直到 closing '''

// EOF 在 FIRST/BODY：专用规则或 @eof 报错，禁止回落 DEFAULT 吞掉
```

删除原 `TRIPLE_SINGLE_STRING` / `TRIPLE_DOUBLE_STRING` 单行 `.*?` 规则。

### 2. Parser 规则

```antlr
tripleSingleString : TRIPLE_S_OPEN TRIPLE_S_BODY TRIPLE_S_CLOSE ;
tripleDoubleString : TRIPLE_D_OPEN TRIPLE_D_BODY TRIPLE_D_CLOSE ;

value : ... | tripleSingleString | tripleDoubleString | ...
```

`TRIPLE_S_BODY` 为单一 token，文本为纯正文（不含 delimiter、不含开引号行注释）。

### 3. Parse 解码

- `visitValue` / `decodeJson5String`：对三引号结构取 `TRIPLE_S_BODY.getText()`，按现有转义规则解码
- 开引号行注释不出现在 parse 结果

空 body：`''' // only\n'''` → `""`（document 约定）

### 4. Format 发射

```javascript
emitTripleSingleString(ctx) {
  out += ctx.TRIPLE_S_OPEN.text;
  out += emitHidden(hiddenRight(open));
  out += ctx.TRIPLE_S_BODY.text;  // 保留原文空白
  out += ctx.TRIPLE_S_CLOSE.text;
}
```

- **pretty 与 compact 共用**此路径（不再 `'''`→`"""`）
- 三引号内部仍遵守「不 deep indent」：仅 delimiter 行跟 member indent

### 5. 不成对 / 未闭合处理

| 情况 | 行为 |
|------|------|
| `{ x: ''' no close }` | Lexer 在 BODY 遇 `}` 或 EOF → ParseError |
| `{ x: '''` EOF | FIRST/BODY 模式 @eof → ParseError（明确「unclosed triple string」类消息） |
| `{ x: ''' ... """ }` | CLOSE 类型不匹配 → ParseError |
| `''''` 裸 token | 不再被 `.*?` 误匹配为合法三引号字符串；按 OPEN/BODY/CLOSE 严格解析 |

实现：BODY 模式中 `}`、`]`、`,` 等若出现在未 CLOSE 前，由 parser 报错；lexer 在 mode 内遇到无法匹配的输入报错。

### 6. 测试

| 文件 | 用途 |
|------|------|
| `cases/json5.triple-opener-line.text` | `''' // c\nbody\n'''` parse/format |
| `cases/json5.triple-opener-block.text` | `''' /* b */\nbody\n'''` |
| `cases/json5.triple-unclosed.text` | expectError |
| `cases/json5.triple-mismatch.text` | `''' ... """` expectError |
| golden compact | 含 `''' // 三引号注释` 行 |

## Risks / Trade-offs

- **[Breaking parse]** 开引号行注释从字符串值移除 → 文档化 breaking，fixture 行为更正
- **[Lexer 复杂度]** 双引号/单引号三引号两套 mode → 可抽 fragment 减重复
- **[Spec 冲突]** 现 spec 要求 pretty 将 `'''`→`"""` → 本 change 修改 requirement
- **[generate 必须]** 改 g4 后必须 `npm run generate` 并提交 `src/grammars/json5/*`

## Migration Plan

1. 改 `Json5Lexer.g4`、`Json5Parser.g4`
2. `npm run generate`
3. 更新 visitor、format-emitter
4. 更新 cases、golden、`test/run.mjs`
5. 跑 `npm test`、`openspec validate --all`

## Open Questions

（无）
