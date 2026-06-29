## 1. JSON fixture 更新

- [x] 1.1 在 `test/resources/test.json.text` 根对象添加 `"1": "数字key"`（标准 JSON 引号 key，位置与 json5 fixture 语义对齐）
- [x] 1.2 确认 fixture 仍为合法标准 JSON（无注释、无尾逗号、无 JSON5 特性）

## 2. 集成 runner 断言

- [x] 2.1 在 `test/run.mjs` 的 json parse case 中，parse 成功后断言 `result["1"] === "数字key"`
- [x] 2.2 断言失败时走现有 error 路径（stderr + `*.error.json` sidecar）

## 3. 验证

- [x] 3.1 运行 `npm test`，确认 json parse case 通过且 `obj["1"]` 不为 `undefined`
- [x] 3.2 运行 `openspec validate --change add-json-key-1-fixture-coverage` 确认 change 合法
