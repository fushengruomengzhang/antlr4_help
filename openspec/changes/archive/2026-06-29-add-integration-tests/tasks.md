## 1. Fixture 准备

- [x] 1.1 填充 `test/resources/test.json.text` 为标准 JSON（嵌套 object/array、转义、unicode、特殊 key，无 JSON5 特性）
- [x] 1.2 确认 `test/resources/test.json5.text` 与 `test/resources/test.java.text` 已存在且非空

## 2. 集成 Runner

- [x] 2.1 创建 `test/run.mjs`：从 `../src/index.js` 导入 `{ json, json5, java8 }`
- [x] 2.2 实现工具函数：`readFixture`、`writeJson`、`writeText`、`runCase`（含 ParseError → `*.error.json` 与 stderr 日志）
- [x] 2.3 启动时 `mkdirSync(test/resources/out/, { recursive: true })`
- [x] 2.4 实现 json5 四步：validate → `test.json5.validate.txt`；parse → `test.json5.parse.json`；format 默认 → `test.json5.format.text`；format sortKeys → `test.json5.format.sorted.text`
- [x] 2.5 实现 json 一步：parse → `test.json.parse.json`
- [x] 2.6 实现 java8 两步：firstClassName → `test.java.firstClassName.txt`；signatures → `test.java.signatures.json`

## 3. 项目配置

- [x] 3.1 在 `.gitignore` 添加 `test/resources/out/`
- [x] 3.2 更新 `package.json`：`"test": "node test/run.mjs"`（`start` 保持不变）

## 4. 验证

- [x] 4.1 运行 `npm test`，确认 `test/resources/out/` 下生成 7 个输出文件且无未捕获异常
- [x] 4.2 抽查 `test.java.firstClassName.txt` 为 `User`，json5 validate 为 `OK`
