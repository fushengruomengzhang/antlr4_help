## Context

仓库已有三套 ANTLR 4.9.3 语法（`src/grammars/json5/`、`json/`、`java8/`），但尚无运行时 API。上一轮 change 仅建立了 Node ESM 项目骨架与 OpenSpec 约定。本设计在现有语法资产之上，实现统一的「字符串 → Lexer → Parser → CST/Visitor → 目标」管线，并对外暴露 json5、json、java8 三类能力。

约束：
- Node.js ESM + `antlr4@4.9.3`，生成代码提交进仓库
- JSON 100% 走 ANTLR（不用 `JSON.parse`）
- Java8 输入为完整 `.java` 文件（`compilationUnit` 入口）
- 统一异常 `{ line, column, msg }`

## Goals / Non-Goals

**Goals:**

- 提供可复用的 `ParsePipeline` 与 `ParseError`，三种语言共享
- json5：`validate`、`parse`（→ object）、`format`（可配置布局 + 注释锚定 + 字符串/key 规范化）
- json：`parse`（→ plain object）
- java8：`firstClassName`、`signatures`（own members + nested 类型树，浅 Visitor）
- 修正 `generate.sh` 支持子目录语法，输出按语言分目录

**Non-Goals:**

- TypeScript、打包器、测试框架（本 change 不引入）
- Java8 符号解析、继承链成员合并、类型推断
- JSON5 `parse` 保留注释（注释仅 `format` 路径保留）
- 多线程 Parser 池、增量解析
- 除 JavaScript 外的 ANTLR 目标语言

## Decisions

### 1. 统一 ParsePipeline 工厂

每种语言传入 `{ Lexer, Parser, entryRule }`，管线负责：

```
InputStream → Lexer → CommonTokenStream → Parser → entryRule()
                      ↑ 移除默认 error listener
                      ↑ 挂载 CollectingErrorListener
```

- **validate 模式**：Parser 成功后即返回，不建 Visitor 树
- **Rationale**：三种语言共享错误格式与 boilerplate，避免重复
- **Alternative**：各语言独立封装 — 重复代码多，不利于统一异常

### 2. ParseError 形状

```javascript
class ParseError extends Error {
  language   // 'json5' | 'json' | 'java8'
  line       // 1-based
  column     // 0-based（与 ANTLR charPositionInLine 一致）
  message
}
```

- Lexer 与 Parser 错误均转换为此形状
- **Alternative**：返回 `{ errors: [] }` 不抛异常 — 与「快速验证失败即异常」需求不符

### 3. 目录布局

```
src/
├── core/
│   ├── parse-pipeline.js
│   └── parse-error.js
├── json5/   validate.js, parse.js, format.js, format-emitter.js, value-visitor.js
├── json/    parse.js, value-visitor.js
├── java8/   first-class-name.js, signatures.js, signature-visitor.js
├── parser/
│   ├── json5/   Json5Lexer.js, Json5Parser.js, ...
│   ├── json/    JSONLexer.js, JSONParser.js, ...
│   └── java8/   Java8Lexer.js, Java8Parser.js, ...
└── index.js   re-export json5, json, java8, ParseError
```

- **Rationale**：按语言隔离生成物，避免 Lexer 类名冲突
- **generate.sh**：遍历 `src/grammars/*/*.g4`（或按子目录分批调用 jar）

### 4. JSON5：parse 与 format 双路径

| 路径 | 机制 | 产出 |
|------|------|------|
| validate / parse | CST + ValueVisitor | object 或 void |
| format | CST + HIDDEN TokenStream + FormatEmitter | string |

- Json5Lexer 将注释/空白放 HIDDEN channel；`format` 必须 `fill()` TokenStream 并读取 HIDDEN
- **Rationale**：parse → serialize 无法保留注释；format 必须 token-aware

### 5. JSON5 format 规则

**FormatOptions**（默认 `{ indent: { type: 'space', size: 2 }, sortKeys: false }`）：

| 规则 | 行为 |
|------|------|
| 布局 | 仅调整缩进/换行；indent 支持 `space`+size 或 `tab` |
| sortKeys | 可选；仅 object member；注释随 member 锚定移动 |
| 尾逗号 | 去掉 |
| 单行字符串 value | 统一 `"..."`（含 `'` 输入） |
| 多行字符串 value | 保留 `"""..."""`；`'''` 输入转为 `"""` |
| 多行判定 | 按 token 类型 TRIPLE_*，不按解码内容 |
| 三引号内部 | 不 deep indent；内容行原样 emit（可 trim 行尾空白）；起止 `"""` 对齐 |
| 其他 value | NUMBER/boolean/null/Infinity/NaN 等 token 文本原样 |
| key | IdentifierName/NUMBER/关键字/STRING 各保留合法输出形态 |

**sortKeys 比较**：按 key 的 canonical 字符串表示字典序（策略 A）。

### 6. JSON：纯 Visitor 路径

- 入口规则 `json`；Visitor 映射 STRING/NUMBER/obj/arr/literal → JS 值
- **Rationale**：语法小、行为与 json.org 一致；统一 ParseError

### 7. Java8：浅 Visitor + FileModel

- 入口 `compilationUnit`；Visitor 进入 `methodBody`、`block`、`constructorBody` 内 expression 子树时跳过
- **firstClassName**：按源码顺序扫描顶层 `typeDeclaration`，返回第一个 class/interface/enum/@interface 的名称
- **signatures**：返回 `FileModel { types: TypeModel[] }`；`TypeModel` 含 kind、name、modifiers、extends、implements、ownMembers、nestedTypes
- ownMembers 含：field、method、constructor、enum constant、interface constant、annotation element
- **不**展开父类成员；extends/implements 仅保留文本
- **Alternative**：完整符号表 — 超出 scope，性能差

### 8. 实施阶段

1. 基础设施（generate.sh、core、parser 生成）
2. JSON + JSON5 validate/parse
3. Java8 signatures
4. JSON5 format（最复杂，放最后）

## Risks / Trade-offs

- [JSON5 format 复杂度高] → 分阶段实现；comment 锚定与 sortKeys 先写 spec 边界 case；format 独立模块
- [Java8 全 grammar parse 慢] → 浅 Visitor；不在 body 内遍历；文档说明大文件预期
- [generate.sh 子目录] → 按语言目录分别调用 ANTLR，验证三套生成物均可 import
- [parse 与 format 语义分裂] → API 文档明确：round-trip 保留注释须用 format，不能用 parse
- [JSON5 key 类型 vs JS object] → parse 文档说明 JS 限制（数字/关键字 key 变为 string key）

## Migration Plan

1. 实现新模块与 `src/index.js`
2. 运行 `npm run generate` 生成并提交 `src/parser/{json5,json,java8}/`
3. 更新 README 中的目录说明与 API 示例
4. 无外部消费者，无需 rollback 策略；若 format 未就绪可先导出 validate/parse/java8

## Open Questions

（探索阶段已闭合，无阻塞项）
