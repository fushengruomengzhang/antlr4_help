## 1. Node 项目与依赖

- [ ] 1.1 创建 `package.json`，设置 `"type": "module"`，添加依赖 `antlr4@4.9.3`
- [ ] 1.2 添加脚本：`generate`（调用 `scripts/generate.sh`）、`start`（`node src/index.js`）、`test`
- [ ] 1.3 创建 `.gitignore`，忽略 `node_modules/`（不忽略 `src/parser/` 与 `lib/*.jar`）

## 2. ANTLR 工具依赖（lib）

- [ ] 2.1 下载 `antlr-4.9.3-complete.jar` 到 `lib/` 并纳入版本控制
- [ ] 2.2 创建 `scripts/generate.sh`，封装 `java -jar lib/antlr-4.9.3-complete.jar -Dlanguage=JavaScript -o src/parser src/grammars/*.g4`（赋予可执行权限）

## 3. 源码与起手示例

- [ ] 3.1 创建 `src/grammars/Hello.g4` 起手语法
- [ ] 3.2 运行 `npm run generate`，在 `src/parser/` 生成并提交 Lexer/Parser/Listener
- [ ] 3.3 创建 `src/index.js`（ESM），用 `import antlr4 from 'antlr4'` 加载运行时并解析示例输入

## 4. 验证与文档

- [ ] 4.1 `npm install` 后运行 `node src/index.js`，确认退出码 0 且打印解析结果
- [ ] 4.2 更新 `README.md`，补充安装、`npm run generate`、运行说明
- [ ] 4.3 `openspec validate init-project-structure --strict` 通过
