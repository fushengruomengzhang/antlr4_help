# antlr4_help

基于 **ANTLR 4.9.3** 的学习/参考项目，运行环境为 **Node.js (ESM)**。提供 JSON5、JSON4、JAVA8 三套语法的统一解析 API。

> antlr4 使用版本 4.9.3

## 目录结构

```
antlr4_help/
├── package.json
├── lib/antlr-4.9.3-complete.jar    # 构建期：ANTLR 生成工具（需 Java）
├── scripts/generate.sh             # 生成解析器
└── src/
    ├── grammars/{json5,json,java8}/  # *.g4 语法源 + ANTLR 生成物（Lexer/Parser）
    ├── parser/                       # 运行时 API
    │   ├── core/                     # ParsePipeline、ParseError
    │   ├── json5/                  # validate/parse/format
    │   ├── json/                   # parse
    │   ├── java8/                  # signatures
    │   └── api/                    # Model → ApiSchema 等转换
    └── index.js                    # 统一导出
```

## 环境要求

- Node.js（ESM）+ npm
- Java（仅在 `npm run generate` 时需要）

## 使用

```bash
npm install
npm start                    # 运行 API 演示
node src/index.js
npm run generate             # 修改 .g4 后重新生成
```

## API

```javascript
import { JSON5, JSON4, JAVA8, API, ParseError } from './src/index.js';

// JSON5
JSON5.validate('{ a: 1, }');           // void | ParseError
JSON5.parse('{ a: 1, }');              // → object
JSON5.format('{ a: 1, }', {
  indent: { type: 'space', size: 2 },  // 或 { type: 'tab' }
  sortKeys: false,
  compact: false,  // true：紧凑布局 + 保留源字符串 token 形态
});

// JSON4（标准 JSON，100% ANTLR；命名避开全局 JSON 对象）
JSON4.parse('{"a":1}');

// JAVA8（完整文件）
JAVA8.firstClassName('public class Foo { }');  // → "Foo"
JAVA8.signatures(javaSource);                   // → FileModel

// API（Java8 Model → 字段树）
API.java8ToApiSchema(javaSource, { rootClass: 'User' });
API.snowflakeId();                              // ApiSchema 节点 id
```

### ParseError

语法/词法错误统一抛出 `ParseError`，字段：`language`（`'json5'` | `'json'` | `'java8'`，小写诊断 id）、`line`（1-based）、`column`（0-based）、`message`。

### JSON5 format 规则

- 缩进/换行可配置；去掉尾逗号
- **默认**（`compact: false`）：结构换行清晰；单行字符串 value 统一为 `"..."`；三引号多行保留为 `"""..."""`（`'''` 转为 `"""`）
- **compact**（`compact: true`）：紧凑布局（行尾注释同行、少空行）；保留源字符串 token 形态（单引号/`'''`/行续接）
- 注释保留并锚定在 member 上；`sortKeys: true` 时注释随 member 移动
- `sortKeys: true` 与 `compact: true` 同时启用时，布局与 `compact: true` 一致（仅各 object 层 key 顺序不同），无 whitespace-only 空行
- key 保留 JSON5 形态（标识符/数字/关键字/引号串）

## 说明

- 修改语法后请 `npm run generate` 并提交 `src/grammars/` 下对应语言的生成物。
- `JSON5.parse` 不保留注释；需保留注释请用 `JSON5.format`。
