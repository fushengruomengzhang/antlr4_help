## Context

项目为 ANTLR 4.9.3 学习/参考库，提供 `json5`、`json`、`java8` 三套 ESM API（`src/index.js`）。用户已在 `test/resources/` 放置三个 fixture：

- `test.json5.text` — 完整 JSON5 样例（注释、多行字符串、Infinity 等）
- `test.java.text` — Java8 类定义样例
- `test.json.text` — 当前为空，需补标准 JSON

尚无测试 runner；`package.json` 的 `"test"` 仍指向 demo。本次新增输出型集成 runner，不引入测试框架。

## Goals / Non-Goals

**Goals:**

- `npm test` 运行 `test/run.mjs`，读取 fixture、调用 API、写入 `test/resources/out/`
- 覆盖 json5（validate / parse / format 默认 / format sortKeys）、json（parse）、java8（firstClassName / signatures）
- 填充 `test.json.text` 为有效标准 JSON
- `test/resources/out/` 加入 `.gitignore`

**Non-Goals:**

- 不引入 `node:test`、assert 或 golden file 回归
- 不修改解析 API 行为或 grammar
- 不测试错误路径 fixture（空输入等）
- 不将 `out/` 提交到 git

## Decisions

### 1. 单文件 runner（`test/run.mjs`）

**选择**: 一个 ESM 脚本，顺序执行各 case，用 `fs` 读写文件。

**理由**: 项目无测试基础设施，需求是「生成可 inspect 的输出」而非 CI 断言。单文件足够，与 `src/index.js` demo 风格一致。

**备选**: `node:test` — 更规范但超出当前 scope。

### 2. 输出目录与命名

**选择**: 固定映射表，输入 basename → 输出文件名：

| 输入 | 操作 | 输出 |
|------|------|------|
| `test.json5.text` | validate | `out/test.json5.validate.txt` |
| `test.json5.text` | parse | `out/test.json5.parse.json` |
| `test.json5.text` | format() | `out/test.json5.format.text` |
| `test.json5.text` | format({ sortKeys: true }) | `out/test.json5.format.sorted.text` |
| `test.json.text` | parse | `out/test.json.parse.json` |
| `test.java.text` | firstClassName | `out/test.java.firstClassName.txt` |
| `test.java.text` | signatures | `out/test.java.signatures.json` |

**理由**: 命名与输入文件对应，便于对照。

### 3. 输出序列化约定

- JSON 结果: `JSON.stringify(value, null, 2) + '\n'`
- 文本结果: 字符串 + `\n`；`firstClassName` 为 `null` 时写 `(null)\n`
- validate 成功: `"OK\n"`
- format 结果: API 返回的 string 原样写入（不二次 stringify）

### 4. 错误处理

**选择**: 某 case 抛错时，写入 `{ language, line, column, message }` 到 `*.error.json`，控制台打印错误，继续后续 case。

**理由**: 三个 fixture 独立，一次失败不应阻断全部输出。

### 5. 标准 JSON fixture 内容

**选择**: 从 json5 样例抽取 JSON 合法子集（字符串/数字/布尔/null、嵌套 object/array、转义、unicode、特殊 key），去掉注释、Infinity/NaN、单引号、无引号 key 等 JSON5 特性。

**理由**: 与 json5 大 fixture 互补，验证 `json.parse` 主路径即可。

### 6. import 路径

**选择**: `test/run.mjs` 从 `../src/index.js` 导入 `{ json, json5, java8 }`。

**理由**: 与对外 API 一致，不测内部模块。

## Risks / Trade-offs

- **[无断言]** → 输出变化不会自动失败；依赖人工查看 `out/`。后续可加 golden 或 `node:test`。
- **[format 输出不稳定]** → 若 formatter 微调，sorted/默认两版文件会变；可接受，因不进 git。
- **[路径耦合]** → fixture 名硬编码在 runner；fixture 少时 OK，增多后可改为 manifest。

## Migration Plan

1. 实现 `test/run.mjs` 与 `test.json.text`
2. 更新 `.gitignore` 与 `package.json`
3. 运行 `npm test`，确认 7 个文件生成
4. 无 rollback 风险（纯新增，不改 API）

## Open Questions

（无）
