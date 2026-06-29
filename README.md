# antlr4_help

基于 **ANTLR 4.9.3** 的学习/参考项目，运行环境为 **Node.js (ESM)**。

> antlr4 使用版本 4.9.3

## 目录结构

```
antlr4_help/
├── package.json            # Node 项目 ("type": "module")，依赖 antlr4@4.9.3
├── lib/                    # 非 npm 依赖：ANTLR 生成工具 jar（需 Java 运行）
│   └── antlr-4.9.3-complete.jar
├── scripts/
│   └── generate.sh         # 调用 jar 生成 JavaScript 解析器
└── src/
    ├── grammars/           # *.g4 语法源文件
    │   └── Hello.g4
    ├── parser/             # 由语法生成的解析器（已纳入版本控制）
    └── index.js            # ESM 入口：驱动解析
```

依赖分两类：构建期的 **ANTLR 工具 jar**（在 `lib/`，需 Java）负责“生成”解析器；运行期的 **`antlr4` npm 运行时**负责“执行”解析器。

## 环境要求

- Node.js（ESM）+ npm
- Java（仅在重新生成解析器时需要，运行已生成代码不需要）

## 使用

```bash
# 1. 安装运行时依赖
npm install

# 2. （可选）修改 src/grammars/*.g4 后重新生成解析器，并提交 src/parser/
npm run generate

# 3. 运行示例（默认输入 "hello world"，也可自定义）
npm start
node src/index.js "hello antlr"
```

示例输出：

```
输入: "hello world"
解析树: (greeting hello world <EOF>)
问候对象: world
解析成功 ✅
```

## 说明

- `src/parser/` 下的生成代码已提交进仓库，clone 后无需安装 Java 即可直接运行。
- 修改语法后请运行 `npm run generate` 重新生成并提交 `src/parser/`，避免与语法不同步。
