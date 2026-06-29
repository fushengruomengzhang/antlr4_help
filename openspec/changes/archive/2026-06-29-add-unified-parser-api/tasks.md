## 1. 基础设施与代码生成

- [x] 1.1 更新 `scripts/generate.sh`：按 `src/grammars/{json5,json,java8}/` 子目录分别调用 ANTLR，输出到 `src/parser/{json5,json,java8}/`
- [x] 1.2 运行 `npm run generate` 并提交三套 Lexer/Parser 生成物
- [x] 1.3 创建 `src/core/parse-error.js`：定义 `ParseError` 类（language, line, column, message）
- [x] 1.4 创建 `src/core/parse-pipeline.js`：统一 Lexer/Parser 驱动、错误 listener 收集、validate/parse 模式

## 2. JSON API

- [x] 2.1 创建 `src/json/value-visitor.js`：JSON CST → JS 值
- [x] 2.2 创建 `src/json/parse.js`：暴露 `parse(input)`，失败抛 ParseError
- [x] 2.3 验证：合法/非法 JSON 输入的错误形状与解析结果

## 3. JSON5 validate 与 parse

- [x] 3.1 创建 `src/json5/value-visitor.js`：Json5 CST → JS 值（含 Infinity/NaN/hex/无引号 key 等）
- [x] 3.2 创建 `src/json5/validate.js`：仅 Parser，成功返回 void
- [x] 3.3 创建 `src/json5/parse.js`：暴露 `parse(input)`
- [x] 3.4 验证：合法/非法 JSON5、特殊字面量、注释被 parse 丢弃

## 4. Java8 签名 API

- [x] 4.1 定义 FileModel / TypeModel / MemberModel 数据结构（JSDoc 或注释）
- [x] 4.2 创建 `src/java8/signature-visitor.js`：浅 Visitor，提取 own members 与 nestedTypes
- [x] 4.3 创建 `src/java8/first-class-name.js`：顶层第一个类型名
- [x] 4.4 创建 `src/java8/signatures.js`：暴露 `signatures(input)` 返回 FileModel
- [x] 4.5 验证：extends/implements、nested class、父子同名 method 各归各、方法体不遍历

## 5. JSON5 format

- [x] 5.1 创建 `src/json5/format-emitter.js`：HIDDEN TokenStream 注释锚定、indent/sortKeys 配置
- [x] 5.2 实现字符串 value 规则：单行 → `"..."`，三引号保留，`'''` → `"""`，内部不 deep indent
- [x] 5.3 实现 key 形态保留、尾逗号移除、sortKeys 字典序排序
- [x] 5.4 创建 `src/json5/format.js`：暴露 `format(input, options?)`
- [x] 5.5 验证：注释锚定、sortKeys 移注释、Tab/space indent、边界 case（空 object 仅注释）

## 6. 入口与文档

- [x] 6.1 创建 `src/index.js`：re-export json5、json、java8、ParseError
- [x] 6.2 更新 `src/index.js` 或 CLI：演示三种 API，`npm start` 退出码 0
- [x] 6.3 更新 README：目录结构、API 用法、format options 说明
- [x] 6.4 运行 `openspec validate --all` 确认 change 合法
