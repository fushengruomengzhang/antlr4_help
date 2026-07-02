## Context

`json5-format-standalone` 复制 json5 value grammar，build 从 HIDDEN token stream 推断 comment slot。多轮 fix 仍无法稳定对齐 legacy。用户要求 comment 一等公民：parse 阶段确定 ownership。

## Goals / Non-Goals

**Goals:**

- Comment token 在 parser 规则中可见（`layout` rule）
- Build = parse tree → Document AST（树驱动，非 token 考古）
- sortKeys 移动 whole ObjectEntry（prefix/tail 随 member 走）
- valueEqual 100%，inline comment dup 0，可 parse
- 性能仍优于 legacy JSON5.format

**Non-Goals:**

- 修改 json5 / JSON5.format
- WS 字节级完全 preservation（Phase 1：emit 重排 WS，comment 文本保留）
- 三引号 body 内 comment（仍是 string 内容）

## Decisions

### D1: Lexer — comment default, WS HIDDEN

```antlr
WS            -> channel(HIDDEN)
LINE_COMMENT  : '//' ~[\r\n]* ;   // default channel
BLOCK_COMMENT : '/*' .*? '*/' ;
```

三引号 opener 行 comment 仍在 TRIPLE_*_FIRST mode 内 HIDDEN（局部例外）。

### D2: Parser — document grammar

```
json5Format : layout* value layout* EOF
layout      : LINE_COMMENT | BLOCK_COMMENT
object      : LBRACE objectBody RBRACE
objectBody  : layout* (member (COMMA layout* member)* COMMA? layout*)?
member      : layout* key COLON value suffixPart*
suffixPart  : COMMA | layout
array       : LBRACK arrayBody RBRACK
arrayBody   : layout* (element (COMMA layout* element)* COMMA? layout*)?
element     : layout* value suffixPart*
```

### D3: Build — tree visitor + WS-only hidden

- `layout` nodes → comment text joined into before/right/sep/openRight/closeBefore/after
- HIDDEN channel 仅用于 WS gap（`wsBetween`, `wsAfter`），不分配 comment
- 映射到现有 `types.js` Document AST slots（迁移成本低）

### D4: Transform — member-unit sort

sortKeys 时 ObjectEntry 整项 permute；trailing comma 已在 suffixPart 中，不单独 trailingSep 合并 hack。

### D5: Emit — TextBuf + legacy-aligned compact

compact object 用 TextBuf.beginMemberLine；prefix comment 在 member.before，非 sort 时下一项 prefix 可合并到上一项 sep（与 legacy 一致）。

## Risks / Trade-offs

- [Risk] g4 冲突 → spike 小 fixture 先 validate
- [Risk] byteEqual 低 → Phase 1 接受 cosmetic WS diff，comment dup 必须为 0
- [Risk] 性能 → build 更简单，预期不变或更快

## Migration Plan

1. g4 + generate
2. build-document rewrite
3. emit/transform adjust
4. 全量对照 test
5. archive fix-output change
