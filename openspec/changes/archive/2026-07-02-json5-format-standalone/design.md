## Context

用户要求：新 json5 format 不使用 json5 内任何东西；新导出；独立 lexer/parser；旧 format 永久保留；比原来快；三引号需特别处理。

## Goals / Non-Goals

**Goals:**

- `JSON5Format.format` 独立实现，零依赖 `src/parser/json5/**`
- 独立 `Json5FormatLexer.g4` / `Json5FormatParser.g4`（可复制 json5 词法规则但文件/生成物分离）
- Document-oriented build（entry + memberSep + layout slots）
- 高效 emit（避免 TextBuf 每 member 全量 materialize）
- 三引号：`openRight`（opener 行注释/空白）、body 分片、close 原文
- 2000 keys sort+compact 明显快于 `JSON5.format`

**Non-Goals:**

- 不改 `JSON5.format` 或 json5 g4
- 不共用 json5 lexer/parser 生成物
- 不在此 change 废弃旧 format

## Decisions

### D1: 目录与依赖边界

```
src/grammars/json5-format/     ← 仅 json5-format g4 + generated JS
src/parser/json5-format/       ← 仅 format 管线
src/parser/json5/              ← 禁止被 json5-format import
src/parser/core/               ← 允许（parse-pipeline, string-decode, parse-error）
```

### D2: Parser 方向 B（document grammar）

入口 `json5Format : value EOF`；object 在 builder 层按 `member` + g4 `COMMA` 建 `ObjectEntry`（before/right/sep/trailingSep），与 json5-format-ast spec 语义对齐。

### D3: Lexer 独立复制 + 三引号

`Json5FormatLexer.g4` 独立文件，包含 TRIPLE_S/D 四 mode（与 json5 词法等价，不 import）。Builder 从 token stream 读 opener 行 HIDDEN 填入 `TripleStringNode.openRight`。

### D4: 高效 emit

compact object：用 `string[]` 累积 member 行，最后 `join('\n')`；不用 `beginMemberLine` + 重复 materialize。

### D5: 新导出

```javascript
// src/index.js
export { JSON5Format, JSON5_FORMAT_DEFAULT_OPTIONS } from './parser/json5-format/index.js';
```

`JSON5Format.format(input, options?)` 签名对齐 `JSON5.format` 选项。

### D6: 测试

- 单元：AST slot、三引号 opener 注释
- 对照：`JSON5Format.format` vs `JSON5.format` 在 fixture 上输出一致（允许 trimEnd 一致）
- bench：2000 keys sort+compact 耗时 < JSON5.format

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 双 lexer 词法 drift | 同一 input validate 两边均可 parse；对照测试 |
| 实现工作量大 | 分 phase：g4 → build → emit → export |
| 注释场景 emit 差异 | 优先覆盖现有 test fixture + sort 注释 case |

## Migration Plan

1. 添加 g4 + generate
2. 实现 json5-format 管线
3. 导出 JSON5Format
4. 测试与 bench
5. 旧 JSON5.format 不动

## Open Questions

- 根 export 常量名：`JSON5_FORMAT_DEFAULT_OPTIONS` vs 复用 `DEFAULT_FORMAT_OPTIONS` 别名（采用独立常量避免 json5 import）
