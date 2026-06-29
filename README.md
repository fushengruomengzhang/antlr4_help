# antlr4_help

基于 **ANTLR 4.9.3** 的学习/参考项目，运行环境为 **Node.js (ESM)**。提供 json5、json、java8 三套语法的统一解析 API。

> antlr4 使用版本 4.9.3

## 目录结构

```
antlr4_help/
├── package.json
├── lib/antlr-4.9.3-complete.jar    # 构建期：ANTLR 生成工具（需 Java）
├── scripts/generate.sh             # 生成解析器
└── src/
    ├── core/                       # ParsePipeline、ParseError
    ├── grammars/{json5,json,java8}/  # *.g4 语法源
    ├── parser/{json5,json,java8}/    # 生成的 Lexer/Parser（已入库）
    ├── json5/                      # validate、parse、format
    ├── json/                       # parse
    ├── java8/                      # firstClassName、signatures
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
import { json5, json, java8, ParseError } from './src/index.js';

// JSON5
json5.validate('{ a: 1, }');           // void | ParseError
json5.parse('{ a: 1, }');              // → object
json5.format('{ a: 1, }', {
  indent: { type: 'space', size: 2 },  // 或 { type: 'tab' }
  sortKeys: false,
});

// JSON（100% ANTLR）
json.parse('{"a":1}');

// Java8（完整文件）
java8.firstClassName('public class Foo { }');  // → "Foo"
java8.signatures(javaSource);                   // → FileModel
```

### ParseError

语法/词法错误统一抛出 `ParseError`，字段：`language`、`line`（1-based）、`column`（0-based）、`message`。

### JSON5 format 规则

- 缩进/换行可配置；去掉尾逗号
- 单行字符串 value 统一为 `"..."`；三引号多行保留为 `"""..."""`（`'''` 转为 `"""`）
- 注释保留并锚定在 member 上；`sortKeys: true` 时注释随 member 移动
- key 保留 JSON5 形态（标识符/数字/关键字/引号串）

## 说明

- 修改语法后请 `npm run generate` 并提交 `src/parser/`。
- `json5.parse` 不保留注释；需保留注释请用 `json5.format`。
